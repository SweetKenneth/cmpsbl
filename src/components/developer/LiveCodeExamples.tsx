/**
 * Live Code Examples
 * Embedded StackBlitz/CodeSandbox iframes for runnable code
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Code, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeExample {
  id: string;
  title: string;
  description: string;
  framework: 'react' | 'node' | 'python';
  embedUrl: string;
  sourceUrl: string;
}

const examples: CodeExample[] = [
  {
    id: 'react-memory',
    title: 'React + Substrate API',
    description: 'Add persistent memory to a React chat component',
    framework: 'react',
    embedUrl: 'https://stackblitz.com/edit/react-ts-memory-demo?embed=1&file=src%2FApp.tsx&hideNavigation=1&theme=dark',
    sourceUrl: 'https://stackblitz.com/edit/react-ts-memory-demo',
  },
  {
    id: 'node-agent',
    title: 'Node.js Agent',
    description: 'Build a Substrate-powered agent with Express',
    framework: 'node',
    embedUrl: 'https://codesandbox.io/embed/node-memory-agent-demo?fontsize=14&hidenavigation=1&theme=dark&view=editor',
    sourceUrl: 'https://codesandbox.io/s/node-memory-agent-demo',
  },
  {
    id: 'python-integration',
    title: 'Python Integration',
    description: 'Call the Substrate API from Python with httpx',
    framework: 'python',
    embedUrl: 'https://codesandbox.io/embed/langchain-memory-demo?fontsize=14&hidenavigation=1&theme=dark&view=editor',
    sourceUrl: 'https://codesandbox.io/s/langchain-memory-demo',
  },
];

const frameworkColors = {
  react: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20',
  node: 'bg-neon-green/10 text-neon-green border-neon-green/20',
  python: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20',
};

export function LiveCodeExamples({ className }: { className?: string }) {
  const [activeExample, setActiveExample] = useState(examples[0].id);
  const [expanded, setExpanded] = useState(false);

  const currentExample = examples.find(e => e.id === activeExample) || examples[0];

  return (
    <Card className={cn("border-border/50 overflow-hidden", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Code Examples</CardTitle>
              <p className="text-xs text-muted-foreground">Run in your browser • Edit and experiment</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
            className="hidden md:flex"
          >
            {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs value={activeExample} onValueChange={setActiveExample}>
          <div className="px-6 pb-4 border-b border-border/50">
            <TabsList className="h-auto p-1 bg-muted/50">
              {examples.map((example) => (
                <TabsTrigger 
                  key={example.id} 
                  value={example.id}
                  className="text-xs data-[state=active]:bg-background"
                >
                  {example.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {examples.map((example) => (
            <TabsContent key={example.id} value={example.id} className="m-0">
              <div className="p-4 bg-muted/20 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{example.title}</h3>
                      <Badge variant="outline" className={cn("text-[10px]", frameworkColors[example.framework])}>
                        {example.framework}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{example.description}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={example.sourceUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open
                    </a>
                  </Button>
                </div>
              </div>
              
              <motion.div 
                animate={{ height: expanded ? '600px' : '400px' }}
                transition={{ duration: 0.3 }}
                className="w-full bg-muted/50"
              >
                <iframe
                  src={example.embedUrl}
                  className="w-full h-full border-0"
                  title={example.title}
                  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                  loading="lazy"
                />
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Compact version for homepage
export function LiveCodeExamplesCompact() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {examples.map((example, index) => (
        <motion.a
          key={example.id}
          href={example.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="group block"
        >
          <Card className="h-full hover:border-primary/30 transition-colors">
            <CardContent className="pt-6">
              <Badge 
                variant="outline" 
                className={cn("mb-3 text-[10px]", frameworkColors[example.framework])}
              >
                {example.framework}
              </Badge>
              <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                {example.title}
              </h3>
              <p className="text-xs text-muted-foreground">{example.description}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Open in browser
                <ExternalLink className="w-3 h-3" />
              </div>
            </CardContent>
          </Card>
        </motion.a>
      ))}
    </div>
  );
}
