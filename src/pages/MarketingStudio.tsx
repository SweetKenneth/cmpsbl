import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  MessageSquare, Target, TrendingUp, Users, 
  FileText, Sparkles, BarChart3, Lightbulb 
} from "lucide-react";

export default function MarketingStudio() {
  const [isLoading, setIsLoading] = useState(false);
  const [brandProfile, setBrandProfile] = useState({
    name: '',
    industry: '',
    targetAudience: '',
    brandVoice: '',
    products: '',
    uniqueValue: ''
  });

  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  const [campaignData, setCampaignData] = useState({
    headline: '',
    offer: '',
    promoType: 'sale',
    cta: '',
    description: ''
  });

  const [researchTopic, setResearchTopic] = useState('');
  const [researchType, setResearchType] = useState('demand');
  const [results, setResults] = useState<any>(null);

  const [competitors, setCompetitors] = useState('');
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [audienceData, setAudienceData] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);

  const handleChat = async () => {
    if (!chatMessage.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-marketing', {
        body: { 
          action: 'chat',
          message: chatMessage, 
          conversationId: 'default',
          messageHistory: chatHistory,
          brandProfile 
        }
      });

      if (error) throw error;

      setChatHistory([...chatHistory, 
        { role: 'user', content: chatMessage },
        { role: 'assistant', content: data.message }
      ]);
      setChatMessage('');
      toast.success('Response received');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCampaign = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-marketing', {
        body: { action: 'campaign', ...campaignData, brandProfile }
      });

      if (error) throw error;
      setResults(data);
      toast.success('Campaign content generated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const runResearch = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-marketing', {
        body: { action: 'research', researchType, topic: researchTopic, brandProfile }
      });

      if (error) throw error;
      setResults(data);
      toast.success('Research complete!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const runSWOT = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-marketing', {
        body: { action: 'swot', brandProfile }
      });

      if (error) throw error;
      setResults(data);
      toast.success('SWOT analysis complete!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateStrategy = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-marketing', {
        body: {
          action: 'strategy',
          campaignType: campaignData.promoType,
          goal: 'conversions',
          audience: brandProfile.targetAudience,
          brandProfile
        }
      });

      if (error) throw error;
      setResults(data);
      toast.success('Strategy generated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeCompetitors = async () => {
    if (!competitors.trim()) {
      toast.error('Please enter competitor names');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-marketing', {
        body: {
          action: 'competitor',
          competitors: competitors.split(',').map(c => c.trim()),
          brandProfile,
          analysisType: 'full'
        }
      });

      if (error) throw error;
      setResults(data);
      toast.success('Competitor analysis complete!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateContent = async () => {
    if (platforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-marketing', {
        body: {
          action: 'content',
          strategy: { headline: campaignData.headline, cta: campaignData.cta },
          platforms,
          brandProfile
        }
      });

      if (error) throw error;
      setResults(data);
      toast.success('Content generated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <SEO 
        title="Marketing Studio — AI-Powered Campaign Generator"
        description="Create complete marketing campaigns with AI assistance for any business"
      />

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Marketing Studio</h1>
        </div>
        <p className="text-sm sm:text-base text-muted-foreground">AI-powered marketing automation for your business</p>

        {/* Brand Profile Setup */}
        <Card className="p-4 sm:p-6 glass">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            Brand Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label>Company Name</Label>
              <Input 
                value={brandProfile.name}
                onChange={(e) => setBrandProfile({...brandProfile, name: e.target.value})}
                placeholder="Your Company"
              />
            </div>
            <div>
              <Label>Industry</Label>
              <Input 
                value={brandProfile.industry}
                onChange={(e) => setBrandProfile({...brandProfile, industry: e.target.value})}
                placeholder="e.g., E-commerce, SaaS, Services"
              />
            </div>
            <div>
              <Label>Target Audience</Label>
              <Input 
                value={brandProfile.targetAudience}
                onChange={(e) => setBrandProfile({...brandProfile, targetAudience: e.target.value})}
                placeholder="Who are your customers?"
              />
            </div>
            <div>
              <Label>Brand Voice</Label>
              <Input 
                value={brandProfile.brandVoice}
                onChange={(e) => setBrandProfile({...brandProfile, brandVoice: e.target.value})}
                placeholder="Professional, Casual, Bold, etc."
              />
            </div>
            <div>
              <Label>Products/Services</Label>
              <Input 
                value={brandProfile.products}
                onChange={(e) => setBrandProfile({...brandProfile, products: e.target.value})}
                placeholder="What do you sell?"
              />
            </div>
            <div>
              <Label>Unique Value</Label>
              <Input 
                value={brandProfile.uniqueValue}
                onChange={(e) => setBrandProfile({...brandProfile, uniqueValue: e.target.value})}
                placeholder="What makes you different?"
              />
            </div>
          </div>
        </Card>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="w-full h-auto flex-wrap justify-start gap-1 p-2 bg-muted/50">
            <TabsTrigger value="chat" className="flex-shrink-0">
              <MessageSquare className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="strategy" className="flex-shrink-0">
              <Lightbulb className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Strategy</span>
            </TabsTrigger>
            <TabsTrigger value="campaign" className="flex-shrink-0">
              <FileText className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Campaign</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="audience" className="flex-shrink-0">
              <Target className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Audience</span>
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="competitor" className="flex-shrink-0">
              <Users className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Competitors</span>
            </TabsTrigger>
            <TabsTrigger value="swot" className="flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">SWOT</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="h-96 overflow-y-auto space-y-3 p-4 glass rounded-lg">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea 
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Ask about campaign strategy, messaging, platforms..."
                    rows={2}
                  />
                  <Button onClick={handleChat} disabled={isLoading}>
                    Send
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="strategy">
            <Card className="p-6 space-y-4">
              <div>
                <Label>Campaign Type</Label>
                <select 
                  className="w-full p-2 rounded-md border bg-background mt-1"
                  value={campaignData.promoType}
                  onChange={(e) => setCampaignData({...campaignData, promoType: e.target.value})}
                >
                  <option value="product_launch">Product Launch</option>
                  <option value="sale">Sale/Promotion</option>
                  <option value="brand_awareness">Brand Awareness</option>
                  <option value="lead_generation">Lead Generation</option>
                  <option value="engagement">Engagement</option>
                </select>
              </div>
              <Button onClick={generateStrategy} disabled={isLoading} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Complete Strategy
              </Button>
              {results?.strategy && (
                <div className="space-y-3 mt-4">
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold mb-2">Strategic Approach:</h3>
                    <p>{results.strategy.strategy.approach}</p>
                  </div>
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold mb-2">Messaging:</h3>
                    <p className="mb-2"><strong>Core Message:</strong> {results.strategy.messaging.coreMessage}</p>
                    <p><strong>Headlines:</strong></p>
                    <ul className="list-disc list-inside">
                      {results.strategy.messaging.headlines.map((h: string, i: number) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold mb-2">Platform Strategy:</h3>
                    {results.strategy.platforms.map((p: any, i: number) => (
                      <div key={i} className="mb-2">
                        <strong>{p.platform}</strong> ({p.budgetPercent}%)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="campaign">
            <Card className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Headline</Label>
                  <Input 
                    value={campaignData.headline}
                    onChange={(e) => setCampaignData({...campaignData, headline: e.target.value})}
                    placeholder="Main campaign message"
                  />
                </div>
                <div>
                  <Label>CTA (Call to Action)</Label>
                  <Input 
                    value={campaignData.cta}
                    onChange={(e) => setCampaignData({...campaignData, cta: e.target.value})}
                    placeholder="Shop Now, Learn More, etc."
                  />
                </div>
                <div>
                  <Label>Offer</Label>
                  <Input 
                    value={campaignData.offer}
                    onChange={(e) => setCampaignData({...campaignData, offer: e.target.value})}
                    placeholder="20% off, Free shipping, etc."
                  />
                </div>
                <div>
                  <Label>Promotion Type</Label>
                  <Input 
                    value={campaignData.promoType}
                    onChange={(e) => setCampaignData({...campaignData, promoType: e.target.value})}
                    placeholder="Sale, Launch, Limited Time"
                  />
                </div>
              </div>
              <div>
                <Label>Campaign Description</Label>
                <Textarea 
                  value={campaignData.description}
                  onChange={(e) => setCampaignData({...campaignData, description: e.target.value})}
                  placeholder="Additional campaign details..."
                  rows={3}
                />
              </div>
              <Button onClick={generateCampaign} disabled={isLoading} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Campaign Content
              </Button>
              {results?.captions && (
                <div className="space-y-3 mt-4">
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold mb-2">Short Caption:</h3>
                    <p>{results.captions.short}</p>
                  </div>
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold mb-2">Medium Caption:</h3>
                    <p>{results.captions.medium}</p>
                  </div>
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold mb-2">Long Caption:</h3>
                    <p>{results.captions.long}</p>
                  </div>
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold mb-2">Hashtags:</h3>
                    <p>{results.hashtags.join(' ')}</p>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card className="p-6 space-y-4">
              <div>
                <Label>Campaign Headline</Label>
                <Input 
                  value={campaignData.headline}
                  onChange={(e) => setCampaignData({...campaignData, headline: e.target.value})}
                  placeholder="Your campaign headline"
                />
              </div>
              <div>
                <Label>Call to Action</Label>
                <Input 
                  value={campaignData.cta}
                  onChange={(e) => setCampaignData({...campaignData, cta: e.target.value})}
                  placeholder="Shop Now, Learn More, etc."
                />
              </div>
              <div>
                <Label>Platforms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Facebook', 'Instagram', 'TikTok', 'Twitter', 'LinkedIn'].map(platform => (
                    <button
                      key={platform}
                      onClick={() => {
                        setPlatforms(prev => 
                          prev.includes(platform) 
                            ? prev.filter(p => p !== platform)
                            : [...prev, platform]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        platforms.includes(platform)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={generateContent} disabled={isLoading} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Platform Content
              </Button>
              {results?.content && (
                <div className="space-y-3 mt-4">
                  {results.content.map((item: any, i: number) => (
                    <div key={i} className="p-4 glass rounded-lg">
                      <h3 className="font-semibold mb-2">{item.platform} - {item.variant}</h3>
                      <p className="whitespace-pre-wrap">{item.copy}</p>
                      <p className="text-sm text-muted-foreground mt-2">{item.hashtags.join(' ')}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="competitor">
            <Card className="p-6 space-y-4">
              <div>
                <Label>Competitor Names (comma-separated)</Label>
                <Input 
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                  placeholder="Competitor 1, Competitor 2, Competitor 3"
                />
              </div>
              <Button onClick={analyzeCompetitors} disabled={isLoading} className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Analyze Competitors
              </Button>
              {results?.competitors && (
                <div className="space-y-3 mt-4">
                  {results.competitors.map((comp: any, i: number) => (
                    <div key={i} className="p-4 glass rounded-lg">
                      <h3 className="font-semibold mb-2">{comp.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <strong>Strengths:</strong>
                          <ul className="list-disc list-inside">
                            {comp.strengths.slice(0, 3).map((s: string, j: number) => (
                              <li key={j}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Weaknesses:</strong>
                          <ul className="list-disc list-inside">
                            {comp.weaknesses.slice(0, 3).map((w: string, j: number) => (
                              <li key={j}>{w}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                  {results.opportunities && (
                    <div className="p-4 glass rounded-lg mt-4">
                      <h3 className="font-semibold mb-2">Strategic Opportunities</h3>
                      <ul className="list-disc list-inside">
                        {results.opportunities.slice(0, 5).map((opp: any, i: number) => (
                          <li key={i}><strong>{opp.title}:</strong> {opp.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="audience">
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">🎯 Audience Intelligence</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate detailed buyer personas and audience insights based on your brand and industry
                </p>
              </div>
              <Button onClick={async () => {
                setIsLoading(true);
                try {
                  const { data, error } = await supabase.functions.invoke('pf-marketing', {
                    body: { 
                      action: 'audience',
                      industry: brandProfile.industry,
                      brandProfile,
                      campaignData: {},
                      performanceHistory: {}
                    }
                  });
                  if (error) throw error;
                  setAudienceData(data);
                  toast.success('Audience intelligence generated!');
                } catch (error: any) {
                  toast.error(error.message || 'Failed to generate audience data');
                } finally {
                  setIsLoading(false);
                }
              }} disabled={isLoading} className="w-full">
                <Target className="w-4 h-4 mr-2" />
                Generate Audience Personas
              </Button>
              
              {audienceData?.personas && (
                <div className="space-y-4 mt-4">
                  {audienceData.personas.map((persona: any, idx: number) => (
                    <Card key={idx} className="p-4 glass">
                      <h4 className="font-semibold text-lg mb-1">{persona.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{persona.tagline}</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong className="text-primary">Demographics:</strong>
                          <p>Age: {persona.demographics?.ageRange}</p>
                          <p>Income: {persona.demographics?.income}</p>
                          <p>Location: {persona.demographics?.location}</p>
                        </div>
                        <div>
                          <strong className="text-primary">Platform Usage:</strong>
                          <ul className="list-disc list-inside">
                            {persona.platforms?.slice(0, 3).map((p: any, i: number) => (
                              <li key={i}>{p.name} - {p.usage}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="mt-3">
                        <strong className="text-primary">Pain Points:</strong>
                        <ul className="list-disc list-inside text-sm">
                          {persona.painPoints?.slice(0, 3).map((point: string, i: number) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-3">
                        <strong className="text-primary">Goals:</strong>
                        <ul className="list-disc list-inside text-sm">
                          {persona.goals?.slice(0, 3).map((goal: string, i: number) => (
                            <li key={i}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  ))}
                  {audienceData.overallInsights && (
                    <Card className="p-4 glass">
                      <h4 className="font-semibold mb-2">Overall Insights</h4>
                      <p className="text-sm"><strong>Primary Audience:</strong> {audienceData.overallInsights.primaryAudience}</p>
                      <p className="text-sm mt-2"><strong>Platform Priority:</strong> {audienceData.overallInsights.platformPriority?.join(', ')}</p>
                    </Card>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="predictions">
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">🔮 Campaign Predictions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  AI-powered performance forecasting and optimization recommendations
                </p>
              </div>
              <div className="grid gap-4">
                <div>
                  <Label>Campaign Budget (USD)</Label>
                  <Input placeholder="5000" type="number" id="pred-budget" />
                </div>
                <div>
                  <Label>Campaign Duration (days)</Label>
                  <Input placeholder="30" type="number" id="pred-duration" />
                </div>
              </div>
              
              <Button onClick={async () => {
                const budget = (document.getElementById('pred-budget') as HTMLInputElement)?.value;
                const duration = (document.getElementById('pred-duration') as HTMLInputElement)?.value;
                
                if (!budget || !duration) {
                  toast.error('Please enter budget and duration');
                  return;
                }
                
                setIsLoading(true);
                try {
                  const { data, error } = await supabase.functions.invoke('pf-marketing', {
                    body: { 
                      action: 'predictions',
                      budget: parseFloat(budget),
                      duration: parseInt(duration),
                      brandProfile,
                      campaignDetails: campaignData,
                      historicalData: {}
                    }
                  });
                  if (error) throw error;
                  setPredictions(data);
                  toast.success('Predictions generated!');
                } catch (error: any) {
                  toast.error(error.message || 'Failed to generate predictions');
                } finally {
                  setIsLoading(false);
                }
              }} disabled={isLoading} className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate Performance Forecast
              </Button>
              
              {predictions?.forecast && (
                <div className="space-y-4 mt-4">
                  <Card className="p-4 glass">
                    <h4 className="font-semibold mb-3">📊 Performance Forecast</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Expected Impressions:</strong></p>
                        <p className="text-2xl font-bold text-primary">{predictions.forecast.impressions?.expected?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          Range: {predictions.forecast.impressions?.min?.toLocaleString()} - {predictions.forecast.impressions?.max?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p><strong>Expected Clicks:</strong></p>
                        <p className="text-2xl font-bold text-primary">{predictions.forecast.clicks?.expected?.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">
                          Range: {predictions.forecast.clicks?.min?.toLocaleString()} - {predictions.forecast.clicks?.max?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p><strong>Expected CTR:</strong></p>
                        <p className="text-2xl font-bold text-primary">{predictions.forecast.ctr}%</p>
                      </div>
                      <div>
                        <p><strong>Expected ROAS:</strong></p>
                        <p className="text-2xl font-bold text-primary">{predictions.forecast.roas}x</p>
                      </div>
                      <div>
                        <p><strong>Confidence Level:</strong></p>
                        <p className="text-2xl font-bold text-primary">{predictions.forecast.confidence}%</p>
                      </div>
                      <div>
                        <p><strong>Expected Conversions:</strong></p>
                        <p className="text-2xl font-bold text-primary">{predictions.forecast.conversions?.expected?.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                  
                  {predictions.optimizations && predictions.optimizations.length > 0 && (
                    <Card className="p-4 glass">
                      <h4 className="font-semibold mb-3">💡 Optimization Opportunities</h4>
                      <div className="space-y-3">
                        {predictions.optimizations.map((opt: any, idx: number) => (
                          <div key={idx} className="border-l-2 border-primary pl-3">
                            <p className="font-semibold text-sm">{opt.title}</p>
                            <p className="text-xs text-muted-foreground">{opt.description}</p>
                            <p className="text-xs mt-1">
                              <span className="text-primary">Expected Uplift:</span> {opt.expectedUplift}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {predictions.budgetAllocation && predictions.budgetAllocation.length > 0 && (
                    <Card className="p-4 glass">
                      <h4 className="font-semibold mb-3">💰 Recommended Budget Allocation</h4>
                      <div className="space-y-2">
                        {predictions.budgetAllocation.map((alloc: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="font-medium">{alloc.platform}</span>
                            <span className="text-primary">${alloc.amount} ({alloc.percentage}%)</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="research">
            <Card className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Research Topic</Label>
                  <Input 
                    value={researchTopic}
                    onChange={(e) => setResearchTopic(e.target.value)}
                    placeholder="Product, market, or trend to research"
                  />
                </div>
                <div>
                  <Label>Research Type</Label>
                  <select 
                    className="w-full p-2 rounded-md border bg-background"
                    value={researchType}
                    onChange={(e) => setResearchType(e.target.value)}
                  >
                    <option value="demand">Product Demand</option>
                    <option value="audience">Audience Insights</option>
                    <option value="pricing">Pricing Strategy</option>
                    <option value="competition">Competitive Analysis</option>
                    <option value="trends">Market Trends</option>
                  </select>
                </div>
              </div>
              <Button onClick={runResearch} disabled={isLoading} className="w-full">
                <Lightbulb className="w-4 h-4 mr-2" />
                Run Market Research
              </Button>
              {results?.insights && (
                <div className="p-4 glass rounded-lg mt-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {results.insights}
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="swot">
            <Card className="p-6 space-y-4">
              <p className="text-muted-foreground">Generate a comprehensive SWOT analysis for your brand</p>
              <Button onClick={runSWOT} disabled={isLoading} className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate SWOT Analysis
              </Button>
              {results?.strengths && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold text-green-600 mb-2">Strengths</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {results.strengths.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold text-yellow-600 mb-2">Weaknesses</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {results.weaknesses.map((w: string, i: number) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold text-blue-600 mb-2">Opportunities</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {results.opportunities.map((o: string, i: number) => (
                        <li key={i}>{o}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 glass rounded-lg">
                    <h3 className="font-semibold text-red-600 mb-2">Threats</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {results.threats.map((t: string, i: number) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 glass rounded-lg md:col-span-2">
                    <h3 className="font-semibold text-primary mb-2">Strategic Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {results.recommendations.map((r: string, i: number) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
