/**
 * CodeAgent v3 - Inline Code Annotations
 * Explain what each code block does in natural language
 */

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MessageSquare, Code, ChevronDown, ChevronUp, Lightbulb, Zap } from 'lucide-react';
import { analyzeCode, ASTAnalysis } from '@/lib/codeagent/ast-analyzer';

interface Annotation {
  line: number;
  endLine?: number;
  type: 'function' | 'import' | 'type' | 'hook' | 'component' | 'effect' | 'state';
  title: string;
  explanation: string;
  tips?: string[];
}

interface CodeAnnotationsProps {
  code: string;
  filename: string;
  showLineNumbers?: boolean;
}

export function CodeAnnotations({ code, filename, showLineNumbers = true }: CodeAnnotationsProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);
  
  const { annotations, analysis } = useMemo(() => {
    const analysis = analyzeCode(code, filename);
    const annotations = generateAnnotations(code, analysis);
    return { annotations, analysis };
  }, [code, filename]);
  
  const lines = code.split('\n');
  const annotationsByLine = new Map<number, Annotation[]>();
  
  for (const ann of annotations) {
    if (!annotationsByLine.has(ann.line)) {
      annotationsByLine.set(ann.line, []);
    }
    annotationsByLine.get(ann.line)!.push(ann);
  }
  
  const toggleLine = (line: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(line)) {
      newExpanded.delete(line);
    } else {
      newExpanded.add(line);
    }
    setExpanded(newExpanded);
  };
  
  const getTypeColor = (type: Annotation['type']) => {
    switch (type) {
      case 'function': return 'bg-neon-blue/10 text-neon-blue border-neon-blue/30';
      case 'component': return 'bg-neon-purple/10 text-neon-purple border-neon-purple/30';
      case 'hook': return 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30';
      case 'import': return 'bg-neon-amber/10 text-neon-amber border-neon-amber/30';
      case 'type': return 'bg-neon-green/10 text-neon-green border-neon-green/30';
      case 'effect': return 'bg-neon-magenta/10 text-neon-magenta border-neon-magenta/30';
      case 'state': return 'bg-neon-amber/10 text-neon-amber border-neon-amber/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  
  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Code Annotations</span>
          <Badge variant="outline" className="text-xs">
            {annotations.length} annotations
          </Badge>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="text-xs h-7"
        >
          {showAll ? 'Collapse All' : 'Expand All'}
          {showAll ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
        </Button>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="font-mono text-xs">
          {lines.map((line, index) => {
            const lineNum = index + 1;
            const lineAnnotations = annotationsByLine.get(lineNum) || [];
            const hasAnnotation = lineAnnotations.length > 0;
            const isExpanded = showAll || expanded.has(lineNum);
            
            return (
              <div key={index}>
                <div 
                  className={`flex group ${hasAnnotation ? 'cursor-pointer hover:bg-muted/30' : ''}`}
                  onClick={() => hasAnnotation && toggleLine(lineNum)}
                >
                  {showLineNumbers && (
                    <span className="w-10 px-2 text-right text-muted-foreground border-r border-border/30 select-none">
                      {lineNum}
                    </span>
                  )}
                  
                  <div className="w-6 flex items-center justify-center border-r border-border/30">
                    {hasAnnotation && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{lineAnnotations.length} annotation(s)</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  <pre className="flex-1 px-3 py-0.5 overflow-x-auto whitespace-pre">
                    {line || ' '}
                  </pre>
                  
                  {hasAnnotation && (
                    <div className="flex items-center gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {lineAnnotations.map((ann, i) => (
                        <Badge key={i} variant="outline" className={`${getTypeColor(ann.type)} text-[10px] py-0`}>
                          {ann.type}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {hasAnnotation && isExpanded && (
                  <div className="ml-16 mr-4 my-2 space-y-2">
                    {lineAnnotations.map((ann, i) => (
                      <div 
                        key={i}
                        className="p-3 rounded-lg bg-muted/20 border border-border/30"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={getTypeColor(ann.type)}>
                            {ann.type}
                          </Badge>
                          <span className="font-medium text-sm">{ann.title}</span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {ann.explanation}
                        </p>
                        
                        {ann.tips && ann.tips.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-border/30">
                            <div className="flex items-center gap-1 text-xs text-neon-amber mb-1">
                              <Lightbulb className="h-3 w-3" />
                              <span>Tips</span>
                            </div>
                            <ul className="space-y-1">
                              {ann.tips.map((tip, j) => (
                                <li key={j} className="text-xs text-muted-foreground flex items-start gap-1">
                                  <Zap className="h-3 w-3 mt-0.5 text-neon-amber/50" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="p-2 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span><Code className="h-3 w-3 inline mr-1" />{analysis.linesOfCode} lines</span>
          <span>{analysis.functions.length} functions</span>
          <span>{analysis.imports.length} imports</span>
        </div>
        <span>Complexity: {analysis.cyclomaticComplexity}</span>
      </div>
    </Card>
  );
}

function generateAnnotations(code: string, analysis: ASTAnalysis): Annotation[] {
  const annotations: Annotation[] = [];
  
  // Annotate imports
  for (const imp of analysis.imports) {
    const isReact = imp.source === 'react';
    const isUI = imp.source.includes('@/components/ui');
    const isHook = imp.specifiers.some(s => s.startsWith('use'));
    
    annotations.push({
      line: imp.line,
      type: 'import',
      title: `Import from ${imp.source}`,
      explanation: isReact 
        ? `Imports React utilities: ${imp.specifiers.join(', ')}. These are core React features.`
        : isUI
        ? `Imports UI components from the design system. These are pre-styled, accessible components.`
        : isHook
        ? `Imports custom hooks that encapsulate reusable stateful logic.`
        : `Imports ${imp.specifiers.join(', ')} from the ${imp.source} module.`,
      tips: isReact ? ['React imports are optimized by the bundler'] : undefined
    });
  }
  
  // Annotate functions/components
  for (const func of analysis.functions) {
    const isComponent = analysis.hasJSX && /^[A-Z]/.test(func.name);
    const isHook = func.name.startsWith('use');
    
    annotations.push({
      line: func.startLine,
      endLine: func.endLine,
      type: isComponent ? 'component' : isHook ? 'hook' : 'function',
      title: func.name,
      explanation: isComponent
        ? `A React component that renders UI. ${func.isExported ? 'Exported for use in other files.' : 'Used internally.'}`
        : isHook
        ? `A custom React hook that ${func.isAsync ? 'handles async operations and ' : ''}encapsulates reusable logic.`
        : `A ${func.isAsync ? 'async ' : ''}function that ${describeFunction(func)}`,
      tips: [
        func.complexity > 5 ? 'Consider breaking this into smaller functions' : undefined,
        func.isAsync ? 'Remember to handle loading and error states' : undefined,
        isComponent ? 'Add React.memo if props are stable and component is expensive' : undefined
      ].filter(Boolean) as string[]
    });
  }
  
  // Annotate types
  for (const type of analysis.types) {
    annotations.push({
      line: type.line,
      type: 'type',
      title: type.name,
      explanation: `Defines the shape of ${type.name} with ${type.properties.length} properties. ` +
        `${type.kind === 'interface' ? 'Interfaces can be extended.' : 'Type aliases are immutable.'}`,
      tips: type.properties.length > 10 
        ? ['Consider splitting into smaller, composable types'] 
        : undefined
    });
  }
  
  // Annotate React patterns
  const lines = code.split('\n');
  lines.forEach((line, i) => {
    const lineNum = i + 1;
    
    // useState
    if (/useState[<(]/.test(line)) {
      annotations.push({
        line: lineNum,
        type: 'state',
        title: 'State Declaration',
        explanation: 'Creates a piece of reactive state. When this value changes, the component re-renders.',
        tips: ['Group related state together', 'Consider useReducer for complex state']
      });
    }
    
    // useEffect
    if (/useEffect\s*\(/.test(line)) {
      const hasDeps = /\]\s*\)/.test(lines.slice(i, i + 5).join(''));
      annotations.push({
        line: lineNum,
        type: 'effect',
        title: 'Side Effect',
        explanation: 'Runs code after render. Used for subscriptions, fetching data, or DOM manipulation.',
        tips: [
          !hasDeps ? 'Add dependency array to control when effect runs' : undefined,
          'Remember to return cleanup function if needed'
        ].filter(Boolean) as string[]
      });
    }
  });
  
  return annotations.sort((a, b) => a.line - b.line);
}

function describeFunction(func: { name: string; params: { name: string }[]; isAsync: boolean }): string {
  const paramDesc = func.params.length > 0 
    ? `takes ${func.params.map(p => p.name).join(', ')} as input` 
    : 'takes no parameters';
  
  // Infer purpose from name
  if (func.name.startsWith('handle')) {
    return `handles the ${func.name.replace('handle', '').toLowerCase()} event`;
  }
  if (func.name.startsWith('get')) {
    return `retrieves ${func.name.replace('get', '').toLowerCase()} data`;
  }
  if (func.name.startsWith('set')) {
    return `updates ${func.name.replace('set', '').toLowerCase()}`;
  }
  if (func.name.startsWith('fetch')) {
    return `fetches ${func.name.replace('fetch', '').toLowerCase()} from an API`;
  }
  if (func.name.startsWith('calculate') || func.name.startsWith('compute')) {
    return `computes a value and ${paramDesc}`;
  }
  
  return paramDesc;
}

export default CodeAnnotations;
