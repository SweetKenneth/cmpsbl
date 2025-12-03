import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageGenerator } from './ImageGenerator';
import { VideoGenerator } from './VideoGenerator';
import { Sparkles, Image, Video } from 'lucide-react';

export function CreativeStudio() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Creative Studio
          </h1>
          <p className="text-muted-foreground">Generate images and videos with AI</p>
        </div>
      </div>

      <Tabs defaultValue="image" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Image Generation
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Generation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="image" className="mt-6">
          <ImageGenerator />
        </TabsContent>

        <TabsContent value="video" className="mt-6">
          <VideoGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}