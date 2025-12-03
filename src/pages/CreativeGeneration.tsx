import { useState } from 'react';
import { useCreativeGeneration } from '@/hooks/useCreativeGeneration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, Image as ImageIcon, Video } from 'lucide-react';

const CreativeGeneration = () => {
  const { generateText, generateImage, generateVideo, isGenerating } = useCreativeGeneration();
  
  const [textPrompt, setTextPrompt] = useState('');
  const [textResult, setTextResult] = useState('');
  
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageResult, setImageResult] = useState('');
  
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoResult, setVideoResult] = useState<any>(null);

  const handleTextGeneration = async () => {
    if (!textPrompt) return;
    const result = await generateText({ prompt: textPrompt });
    setTextResult(result.text);
  };

  const handleImageGeneration = async () => {
    if (!imagePrompt) return;
    const result = await generateImage({ prompt: imagePrompt });
    setImageResult(result.url);
  };

  const handleVideoGeneration = async () => {
    if (!videoPrompt) return;
    const result = await generateVideo({ prompt: videoPrompt, duration: 5 });
    setVideoResult(result);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Creative Generation
        </h1>
        <p className="text-muted-foreground">
          AI-powered text, image, and video generation through PromptFluid Nexus
        </p>
      </div>

      <Tabs defaultValue="text" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">
            <Sparkles className="w-4 h-4 mr-2" />
            Text
          </TabsTrigger>
          <TabsTrigger value="image">
            <ImageIcon className="w-4 h-4 mr-2" />
            Image
          </TabsTrigger>
          <TabsTrigger value="video">
            <Video className="w-4 h-4 mr-2" />
            Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Text Generation</CardTitle>
              <CardDescription>
                Powered by Groq, OpenAI, and Anthropic with smart routing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter your prompt..."
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={handleTextGeneration} 
                disabled={isGenerating || !textPrompt}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Text
                  </>
                )}
              </Button>
              {textResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Result:</h3>
                  <p className="whitespace-pre-wrap">{textResult}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle>Image Generation</CardTitle>
              <CardDescription>
                Multi-provider AI image generation with smart routing (Together AI, Lovable, Stability, more)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe the image you want to generate..."
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={handleImageGeneration} 
                disabled={isGenerating || !imagePrompt}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
              {imageResult && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Generated Image:</h3>
                  <img 
                    src={imageResult} 
                    alt="Generated" 
                    className="max-w-full rounded-lg shadow-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Video Generation</CardTitle>
              <CardDescription>
                Queue video generation through Ripple (RunwayML, Pika, Luma)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe the video you want to generate..."
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={handleVideoGeneration} 
                disabled={isGenerating || !videoPrompt}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Queueing...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>
              {videoResult && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Status:</h3>
                  <p><strong>Job ID:</strong> {videoResult.job_id}</p>
                  <p><strong>Status:</strong> {videoResult.status}</p>
                  <p><strong>Message:</strong> {videoResult.message}</p>
                  <p><strong>Estimated Cost:</strong> ${videoResult.estimated_cost?.toFixed(4)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>System Features</CardTitle>
          <CardDescription>Built-in optimizations and capabilities</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-subtle rounded-lg">
            <h3 className="font-semibold mb-2">🧠 Smart Routing</h3>
            <p className="text-sm text-muted-foreground">
              Automatically selects cheapest available AI provider
            </p>
          </div>
          <div className="p-4 bg-gradient-subtle rounded-lg">
            <h3 className="font-semibold mb-2">⚡ Caching</h3>
            <p className="text-sm text-muted-foreground">
              90-day cache with instant retrieval for repeated prompts
            </p>
          </div>
          <div className="p-4 bg-gradient-subtle rounded-lg">
            <h3 className="font-semibold mb-2">📊 Cost Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Full logging of generation costs and performance
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreativeGeneration;
