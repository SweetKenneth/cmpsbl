import { useState, useRef } from "react";
import { Upload, ArrowLeft, FileText, CheckCircle, AlertCircle, Type, Send, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BrainPasscode } from "@/components/BrainPasscode";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BrainTraining() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [manualText, setManualText] = useState("");
  const [submittingText, setSubmittingText] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newFiles: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `training/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('brain-training-data')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        // Read file content for text files
        let content = '';
        if (file.type.includes('text') || fileExt === 'txt' || fileExt === 'md') {
          content = await file.text();
        }

        // Log the upload to brain memory
        await supabase.from('brain_memory_hot').insert({
          content: content || `Training file uploaded: ${file.name}`,
          context: 'training_upload',
          priority: 8,
          tags: ['training', 'upload', fileExt],
          metadata: { 
            file_name: file.name, 
            file_path: filePath,
            file_size: file.size,
            file_type: file.type 
          }
        });

        // Log to learning_logs
        await supabase.from('learning_logs').insert({
          source: 'file_upload',
          content: `Uploaded training file: ${file.name}`,
          success: true,
          metadata: { file_name: file.name, file_path: filePath }
        });

        newFiles.push(file.name);
      }

      setUploadedFiles([...uploadedFiles, ...newFiles]);
      toast({
        title: "Upload Successful",
        description: `${newFiles.length} file(s) uploaded and added to Brain's knowledge`,
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload training data",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualSubmit = async () => {
    if (!manualText.trim()) {
      toast({
        title: "Empty Input",
        description: "Please enter some text to add to the Brain's knowledge",
        variant: "destructive",
      });
      return;
    }

    setSubmittingText(true);

    try {
      // Add to brain hot memory
      const { error: memoryError } = await supabase.from('brain_memory_hot').insert({
        content: manualText,
        context: 'manual_training',
        priority: 8,
        tags: ['training', 'manual', 'knowledge'],
        metadata: { 
          source: 'manual_entry',
          length: manualText.length,
          timestamp: new Date().toISOString()
        }
      });

      if (memoryError) throw memoryError;

      // Log to learning_logs
      await supabase.from('learning_logs').insert({
        source: 'manual_entry',
        content: manualText.substring(0, 500),
        success: true,
        metadata: { full_length: manualText.length }
      });

      // Also add to brain_memories for long-term storage
      await supabase.from('brain_memories').insert({
        content: manualText,
        memory_type: 'training',
        source: 'manual_entry',
        confidence: 1.0,
        metadata: { 
          entry_type: 'manual_training',
          timestamp: new Date().toISOString()
        }
      });

      toast({
        title: "Knowledge Added",
        description: "Text has been added to the Brain's memory",
      });

      setManualText("");
    } catch (error: any) {
      console.error('Manual submit error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to add knowledge",
        variant: "destructive",
      });
    } finally {
      setSubmittingText(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <BrainPasscode>
      <div className="space-y-6 animate-fade-in px-4 sm:px-0">
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/vision')}
            className="w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vision Control
          </Button>
          <div>
            <h1 className="text-3xl font-bold glow-text mb-2">Upload Training Data</h1>
            <p className="text-muted-foreground">Train the Brain with custom documents, text, and knowledge</p>
          </div>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              File Upload
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Type className="w-4 h-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div className="glass glass-hover p-6 rounded-xl">
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="w-12 h-12 text-primary animate-glow" />
                </div>
                <h2 className="text-xl font-semibold">Upload Training Files</h2>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Upload PDFs, text files, or documents to enhance the Brain's knowledge base.
                  Files will be processed and integrated into the learning system.
                </p>
                <Button
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-lg"
                >
                  {uploading ? (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Choose Files
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.doc,.docx,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <div className="glass glass-hover p-6 rounded-xl space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Manual Knowledge Entry</h2>
                  <p className="text-sm text-muted-foreground">
                    Type or paste text directly into the Brain's memory
                  </p>
                </div>
              </div>

              <Textarea
                placeholder="Enter knowledge, facts, documentation, or any text you want the Brain to learn...

Examples:
- Product documentation
- Company policies
- Technical specifications
- Domain knowledge
- Training data
- Personas and behavior rules"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {manualText.length} characters
                </p>
                <Button
                  onClick={handleManualSubmit}
                  disabled={submittingText || !manualText.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {submittingText ? (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2 animate-spin" />
                      Adding to Brain...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Add to Brain Memory
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {uploadedFiles.length > 0 && (
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Uploaded Files ({uploadedFiles.length})
            </h3>
            <div className="space-y-2">
              {uploadedFiles.map((fileName, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted/30"
                >
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm">{fileName}</span>
                  <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="glass p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Supported File Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['PDF', 'TXT', 'DOC/DOCX', 'Markdown', 'JSON'].map((type) => (
              <div key={type} className="p-4 rounded-lg bg-muted/30 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrainPasscode>
  );
}