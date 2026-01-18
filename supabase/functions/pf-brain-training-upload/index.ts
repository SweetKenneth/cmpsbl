import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_CONTENT_LENGTH = 500000; // 500k characters
const ALLOWED_EXTENSIONS = ['txt', 'md', 'json'];
const ALLOWED_MIME_TYPES = ['text/plain', 'text/markdown', 'application/json', 'text/x-markdown'];

// Basic content sanitization - strip potentially dangerous patterns
function sanitizeContent(content: string): string {
  return content
    // Remove script tags
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Remove event handlers
    .replace(/\son\w+\s*=/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove data: URLs with executable content
    .replace(/data:text\/html/gi, '')
    // Limit consecutive whitespace
    .replace(/\s{10,}/g, '\n\n')
    .trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: "No file provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file extension
    const fileName = file.name || 'unknown';
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(', ')} files are allowed for text processing` 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate MIME type (with fallback for text files)
    const mimeType = file.type || 'text/plain';
    if (!ALLOWED_MIME_TYPES.includes(mimeType) && !mimeType.startsWith('text/')) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid file MIME type for text processing" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Read and sanitize content
    let content: string;
    try {
      content = await file.text();
    } catch (e) {
      return new Response(
        JSON.stringify({ success: false, error: "Could not read file as text" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate content length
    if (content.length > MAX_CONTENT_LENGTH) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Content too large. Maximum is ${MAX_CONTENT_LENGTH} characters` 
        }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize content
    const sanitizedContent = sanitizeContent(content);

    if (sanitizedContent.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "File appears to be empty after sanitization" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate secure file path for storage
    const safeFileName = `${Date.now()}_${crypto.randomUUID().substring(0, 8)}.${fileExt}`;
    const filePath = `training/${safeFileName}`;

    // Upload sanitized content to storage
    const { error: uploadError } = await supabase.storage
      .from('brain-training-data')
      .upload(filePath, new Blob([sanitizedContent], { type: 'text/plain' }));

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to store file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add to brain hot memory
    const { error: memoryError } = await supabase.from('brain_memory_hot').insert({
      content: sanitizedContent,
      context: 'training_upload',
      priority: 8,
      tags: ['training', 'upload', fileExt],
      metadata: {
        file_name: fileName,
        file_path: filePath,
        file_size: file.size,
        sanitized_length: sanitizedContent.length,
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString()
      }
    });

    if (memoryError) {
      console.error('Memory insert error:', memoryError);
    }

    // Log the upload
    await supabase.from('learning_logs').insert({
      source: 'secure_file_upload',
      content: `Training file uploaded: ${fileName} (${sanitizedContent.length} chars)`,
      success: true,
      metadata: {
        file_name: fileName,
        file_path: filePath,
        user_id: user.id,
        original_size: file.size,
        sanitized_size: sanitizedContent.length
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        file_name: fileName,
        file_path: filePath,
        content_length: sanitizedContent.length,
        message: "File uploaded and processed successfully"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Brain training upload error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Upload processing failed" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
