/**
 * Portal Chat Panel 2026
 * Modern chat interface with floating input and rich message rendering
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Loader2, 
  Sparkles, 
  HelpCircle, 
  Bot, 
  User, 
  Command,
  Mic,
  Paperclip
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Agency } from '@/lib/agency/agencyTypes';
import { 
  getAvailableCommands, 
  parseCommand, 
  buildPromptFromCommand,
  type QuickCommand 
} from '@/lib/agency/agencyCommands';
import { AgencyCommandPalette } from '../AgencyCommandPalette';
import { AgencyHelpPanel } from '../AgencyHelpPanel';
import type { Specialization } from '@/lib/agency/agencyTypes';
import { formatChatMessage } from '@/lib/ui/formatChatMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    command?: string;
    respondingMember?: string;
    processingTime?: number;
  };
}

interface PortalChatPanelProps {
  agency: Agency;
  className?: string;
}

export function PortalChatPanel({ agency, className }: PortalChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const teamSpecs = agency.members.map(m => m.specialization as Specialization);
  const availableCommands = getAvailableCommands(teamSpecs);
  const leader = agency.members.find(m => m.role === 'leader');

  // Initialize welcome
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'system',
        content: `Welcome to **${agency.name}**! Type \`/help\` for commands or start chatting.`,
        timestamp: new Date(),
      }]);
    }
  }, [agency.name, messages.length]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (value: string) => {
    setInput(value);
    setShowCommands(value === '/');
  };

  const handleCommandSelect = (command: QuickCommand) => {
    if (command.id === 'help') {
      setShowHelp(true);
      setShowCommands(false);
      setInput('');
      return;
    }
    setInput(command.command + ' ');
    setShowCommands(false);
    inputRef.current?.focus();
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowCommands(false);
    setIsLoading(true);

    try {
      const { command, args } = parseCommand(userMessage.content);
      
      if (command?.id === 'help') {
        setShowHelp(true);
        setIsLoading(false);
        return;
      }

      if (command?.id === 'status') {
        setMessages(prev => [...prev, {
          id: `status_${Date.now()}`,
          role: 'assistant',
          content: generateTeamStatus(agency),
          timestamp: new Date(),
          metadata: { command: command.command },
        }]);
        setIsLoading(false);
        return;
      }

      const prompt = command ? buildPromptFromCommand(command, args) : userMessage.content;
      const startTime = Date.now();

      // Build full conversation history for context
      const allMessages = [...messages, userMessage];
      const chatHistory = allMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke('pf-agency-chat', {
        body: {
          message: prompt,
          messages: chatHistory,
          agencyId: agency.id,
          agencyName: agency.name,
          teamComposition: agency.members.map(m => ({
            role: m.role,
            specialization: m.specialization,
            skills: m.skillWeights,
          })),
          dreamPoolMode: agency.dreamPoolMode,
          command: command?.command,
        },
      });

      const processingTime = Date.now() - startTime;

      if (error) throw new Error(error.message);

      setMessages(prev => [...prev, {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data?.reply || 'Let me coordinate with the team on this.',
        timestamp: new Date(),
        metadata: {
          command: command?.command,
          respondingMember: leader?.specialization,
          processingTime,
        },
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: `fallback_${Date.now()}`,
        role: 'assistant',
        content: `The team is reviewing your request.`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, agency, leader]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (e.key === 'Escape') {
      setShowCommands(false);
      setShowHelp(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-full relative", className)}>
      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === 'user' && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                "border",
                msg.role === 'user' 
                  ? "bg-primary/10 border-primary/30" 
                  : msg.role === 'system'
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-card border-border/50"
              )}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-primary" />
                ) : (
                  <Bot className={cn(
                    "w-4 h-4",
                    msg.role === 'system' ? "text-amber-400" : "text-foreground"
                  )} />
                )}
              </div>

              <div className={cn(
                "flex-1 max-w-[85%] rounded-2xl px-4 py-3",
                msg.role === 'user' 
                  ? "bg-primary text-primary-foreground ml-auto" 
                  : "bg-card/80 border border-border/50"
              )}>
                <div 
                  className="text-sm whitespace-pre-wrap prose prose-sm max-w-none dark:prose-invert
                    [&_strong]:text-foreground [&_strong]:font-semibold
                    [&_em]:text-muted-foreground [&_a]:text-primary"
                  dangerouslySetInnerHTML={{ __html: formatChatMessage(msg.content) }}
                />
                
                <div className="flex items-center gap-2 mt-2">
                  {msg.metadata?.command && (
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                      {msg.metadata.command}
                    </Badge>
                  )}
                  <span className={cn(
                    "text-[10px]",
                    msg.role === 'user' ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-card border border-border/50 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-card/80 border border-border/50 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-3 h-3" />
                  Thinking...
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Command Palette */}
      {showCommands && (
        <div className="absolute bottom-24 left-4 right-4 z-20 max-w-3xl mx-auto">
          <AgencyCommandPalette
            commands={availableCommands}
            onSelect={handleCommandSelect}
            onClose={() => setShowCommands(false)}
            filter={input.slice(1)}
          />
        </div>
      )}

      {/* Help Panel */}
      {showHelp && (
        <AgencyHelpPanel
          teamSpecs={teamSpecs}
          onClose={() => setShowHelp(false)}
          onSelectTask={(task) => {
            setInput(`/${task.id.replace(/_/g, '-')} `);
            setShowHelp(false);
            inputRef.current?.focus();
          }}
        />
      )}

      {/* Floating Input */}
      <div className="p-4 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className={cn(
            "flex items-end gap-2 p-2 rounded-2xl",
            "bg-card/80 border border-border/50 backdrop-blur-xl",
            "shadow-lg shadow-background/50"
          )}>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-9 w-9 rounded-xl"
              onClick={() => setShowHelp(true)}
            >
              <Command className="w-4 h-4" />
            </Button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message your team..."
              rows={1}
              className={cn(
                "flex-1 resize-none bg-transparent border-0 focus:ring-0 focus:outline-none",
                "text-sm placeholder:text-muted-foreground py-2 max-h-32",
                "scrollbar-hide"
              )}
              style={{ minHeight: '36px' }}
              disabled={isLoading}
            />

            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0 h-9 w-9 rounded-xl bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateTeamStatus(agency: Agency): string {
  const lines = [
    `## ${agency.name} Status`,
    '',
    `**Team:** ${agency.members.length} cognitives`,
    `**Cohesion:** ${agency.cohesionRating}%`,
    '',
    '### Composition',
  ];

  for (const member of agency.members) {
    const icon = member.role === 'leader' ? '👑' : '🤖';
    lines.push(`${icon} **${member.specialization}** — ${member.role}`);
  }

  return lines.join('\n');
}

// formatMessageContent removed — now using shared formatChatMessage from @/lib/ui/formatChatMessage
