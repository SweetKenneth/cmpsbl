import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ExternalLink, Maximize2 } from 'lucide-react';

interface BeforeAfterComparisonProps {
  originalUrl: string;
  modernizedUrl: string;
  scores?: {
    accessibility: number;
    seo: number;
  };
}

export const BeforeAfterComparison = ({ 
  originalUrl, 
  modernizedUrl,
  scores 
}: BeforeAfterComparisonProps) => {
  const [sliderValue, setSliderValue] = useState([50]);
  const [viewMode, setViewMode] = useState<'split' | 'slider'>('split');

  return (
    <Card className="overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between bg-muted/30">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'split' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('split')}
          >
            Split View
          </Button>
          <Button
            variant={viewMode === 'slider' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('slider')}
          >
            Slider
          </Button>
        </div>
        
        {scores && (
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">A11y:</span>
              <span className="font-bold text-primary">{scores.accessibility}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">SEO:</span>
              <span className="font-bold text-accent">{scores.seo}/100</span>
            </div>
          </div>
        )}
      </div>

      {viewMode === 'split' ? (
        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative min-h-[600px] border-r">
            <div className="absolute top-0 left-0 right-0 p-3 bg-destructive/10 border-b border-destructive/20 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-destructive">Before (Original)</span>
                <a 
                  href={originalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-destructive hover:underline flex items-center gap-1"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <iframe 
              src={originalUrl}
              className="w-full h-[600px] mt-12"
              title="Original Site"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>

          <div className="relative min-h-[600px]">
            <div className="absolute top-0 left-0 right-0 p-3 bg-primary/10 border-b border-primary/20 backdrop-blur-sm z-10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">After (Modernized)</span>
                <a 
                  href={modernizedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <iframe 
              src={modernizedUrl}
              className="w-full h-[600px] mt-12"
              title="Modernized Site"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative min-h-[600px] overflow-hidden">
            <div className="absolute inset-0">
              <iframe 
                src={originalUrl}
                className="w-full h-full"
                title="Original Site"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderValue[0]}% 0 0)` }}
            >
              <iframe 
                src={modernizedUrl}
                className="w-full h-full"
                title="Modernized Site"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>

            <div 
              className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg z-20"
              style={{ left: `${sliderValue[0]}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-xl">
                <Maximize2 className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/50">
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Before</span>
              <span>After</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
