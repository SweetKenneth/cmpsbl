import { useState } from "react";
import { Upload, ArrowLeft, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BrainPasscode } from "@/components/BrainPasscode";

export default function BrainTraining() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newFiles: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `training/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('brain-training-data')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        newFiles.push(file.name);
      }

      setUploadedFiles([...uploadedFiles, ...newFiles]);
      toast({
        title: "Upload Successful",
        description: `${newFiles.length} file(s) uploaded for Brain training`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload training data",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <BrainPasscode>
      <div className="space-y-6 animate-fade-in px-4 sm:px-0">
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/nexus-brain')}
            className="w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Nexus Brain
          </Button>
          <div>
            <h1 className="text-3xl font-bold glow-text mb-2">Upload Training Data</h1>
            <p className="text-muted-foreground">Train the Brain with custom documents, PDFs, and text files</p>
          </div>
        </div>

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
            <label htmlFor="file-upload" className="cursor-pointer">
              <Button
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
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.txt,.doc,.docx,.md"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">PDF</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">TXT</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">DOC/DOCX</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Markdown</p>
            </div>
          </div>
        </div>
      </div>
    </BrainPasscode>
  );
}
