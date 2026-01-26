/**
 * Marketplace User Hook — Observer profile, purchases, likes, recommendations
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Template } from '@/data/templates';
import { TEMPLATES } from '@/data/templates';

interface MarketplacePurchase {
  id: string;
  template_id: string;
  template_name: string;
  price_cents: number;
  purchased_at: string;
  download_count: number;
}

interface UserInterest {
  template_id: string;
  interaction_type: string;
  created_at: string;
}

interface MarketplaceUserState {
  // Auth state
  isLoggedIn: boolean;
  loading: boolean;
  
  // Purchases
  purchases: MarketplacePurchase[];
  hasPurchased: (templateId: string) => boolean;
  
  // Likes/Saved
  savedTemplates: string[];
  isLiked: (templateId: string) => boolean;
  toggleLike: (templateId: string) => Promise<void>;
  
  // Recommendations
  recommendations: Template[];
  recentlyViewed: Template[];
  
  // Tracking
  trackView: (templateId: string) => Promise<void>;
  trackPreview: (templateId: string) => Promise<void>;
  
  // Mailing list
  isSubscribed: boolean;
  subscribeToMailingList: (email: string, preferences?: object) => Promise<void>;
  
  // Refresh
  refresh: () => Promise<void>;
}

export function useMarketplaceUser(): MarketplaceUserState {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<MarketplacePurchase[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<string[]>([]);
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (!user) {
      setPurchases([]);
      setSavedTemplates([]);
      setInterests([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch purchases
      const { data: purchaseData } = await supabase
        .from('marketplace_purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('purchased_at', { ascending: false });
      
      if (purchaseData) {
        setPurchases(purchaseData as MarketplacePurchase[]);
      }

      // Fetch saved templates
      const { data: savedData } = await supabase
        .from('marketplace_saved_templates')
        .select('template_id')
        .eq('user_id', user.id);
      
      if (savedData) {
        setSavedTemplates(savedData.map(s => s.template_id));
      }

      // Fetch interests for recommendations
      const { data: interestData } = await supabase
        .from('marketplace_user_interests')
        .select('template_id, interaction_type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (interestData) {
        setInterests(interestData as UserInterest[]);
      }

      // Check mailing list subscription
      const { data: subData } = await supabase
        .from('marketplace_mailing_list')
        .select('is_active')
        .eq('user_id', user.id)
        .single();
      
      setIsSubscribed(subData?.is_active ?? false);

    } catch (error) {
      console.error('Error fetching marketplace user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const hasPurchased = useCallback((templateId: string) => {
    return purchases.some(p => p.template_id === templateId);
  }, [purchases]);

  const isLiked = useCallback((templateId: string) => {
    return savedTemplates.includes(templateId);
  }, [savedTemplates]);

  const toggleLike = useCallback(async (templateId: string) => {
    if (!user) return;

    const liked = isLiked(templateId);

    if (liked) {
      // Remove from saved
      await supabase
        .from('marketplace_saved_templates')
        .delete()
        .eq('user_id', user.id)
        .eq('template_id', templateId);
      
      setSavedTemplates(prev => prev.filter(id => id !== templateId));
    } else {
      // Add to saved
      await supabase
        .from('marketplace_saved_templates')
        .insert({ user_id: user.id, template_id: templateId });
      
      setSavedTemplates(prev => [...prev, templateId]);

      // Track the like interaction
      await supabase.rpc('track_template_interaction', {
        p_template_id: templateId,
        p_interaction_type: 'like'
      });
    }
  }, [user, isLiked]);

  const trackView = useCallback(async (templateId: string) => {
    await supabase.rpc('track_template_interaction', {
      p_template_id: templateId,
      p_interaction_type: 'view'
    });
  }, []);

  const trackPreview = useCallback(async (templateId: string) => {
    await supabase.rpc('track_template_interaction', {
      p_template_id: templateId,
      p_interaction_type: 'preview'
    });
  }, []);

  const subscribeToMailingList = useCallback(async (emailAddress: string) => {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('marketplace_mailing_list')
      .select('id')
      .eq('email', emailAddress)
      .maybeSingle();

    if (existing) {
      // Update existing record
      await supabase
        .from('marketplace_mailing_list')
        .update({
          user_id: user?.id || null,
          is_active: true,
        })
        .eq('email', emailAddress);

      setIsSubscribed(true);
    } else {
      // Insert new record  
      await supabase
        .from('marketplace_mailing_list')
        .insert([{
          email: emailAddress,
          user_id: user?.id || null,
          is_active: true,
        }]);

      setIsSubscribed(true);
    }
  }, [user]);

  // Generate recommendations based on interests
  const recommendations = (() => {
    if (interests.length === 0) {
      // Return featured templates for new users
      return TEMPLATES.slice(0, 6);
    }

    // Get categories from liked/purchased templates
    const interactedTemplateIds = [...new Set(interests.map(i => i.template_id))];
    const interactedTemplates = TEMPLATES.filter(t => interactedTemplateIds.includes(t.id));
    const preferredCategories = [...new Set(interactedTemplates.map(t => t.category))];

    // Find templates in same categories that user hasn't interacted with
    const purchasedIds = purchases.map(p => p.template_id);
    const recommended = TEMPLATES.filter(t => 
      preferredCategories.includes(t.category) &&
      !interactedTemplateIds.includes(t.id) &&
      !purchasedIds.includes(t.id)
    ).slice(0, 6);

    return recommended.length > 0 ? recommended : TEMPLATES.slice(0, 6);
  })();

  // Get recently viewed templates
  const recentlyViewed = (() => {
    const viewedIds = interests
      .filter(i => i.interaction_type === 'view' || i.interaction_type === 'preview')
      .map(i => i.template_id)
      .slice(0, 8);
    
    const uniqueIds = [...new Set(viewedIds)];
    return TEMPLATES.filter(t => uniqueIds.includes(t.id));
  })();

  return {
    isLoggedIn: !!user,
    loading,
    purchases,
    hasPurchased,
    savedTemplates,
    isLiked,
    toggleLike,
    recommendations,
    recentlyViewed,
    trackView,
    trackPreview,
    isSubscribed,
    subscribeToMailingList,
    refresh: fetchUserData,
  };
}
