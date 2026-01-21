/**
 * Agency Chat Interface — Interact with deployed agency team
 * Features quick commands, /help menu, and team-specific prompts
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Sparkles, Command, HelpCircle, ChevronUp, X, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Agency, AgencyMember, Specialization } from '@/lib/agency/agencyTypes';
import { 
  getAvailableCommands, 
  getCommandsByCategory, 
  parseCommand, 
  buildPromptFromCommand,
  CATEGORY_INFO,
  type QuickCommand 
} from '@/lib/agency/agencyCommands';
import { AgencyCommandPalette } from './AgencyCommandPalette';

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

interface AgencyChatInterfaceProps {
  agency: Agency;
  className?: string;
}

export function AgencyChatInterface({ agency, className }: AgencyChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get team specializations
  const teamSpecs = agency.members.map(m => m.specialization as Specialization);
  const availableCommands = getAvailableCommands(teamSpecs);
  const commandsByCategory = getCommandsByCategory(availableCommands);

  // Get leader for responses
  const leader = agency.members.find(m => m.role === 'leader');

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMsg: Message = {
        id: 'welcome',
        role: 'system',
        content: `Welcome to **${agency.name}**! I'm ${leader?.specialization || 'your team lead'}. Type \`/help\` to see available commands or ask me anything.`,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [agency.name, leader]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle input change - detect / for command suggestions
  const handleInputChange = (value: string) => {
    setInput(value);
    if (value === '/') {
      setShowCommands(true);
    } else if (!value.startsWith('/')) {
      setShowCommands(false);
    }
  };

  // Handle command selection
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

  // Send message
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
      // Parse for commands
      const { command, args } = parseCommand(userMessage.content);
      
      if (command?.id === 'help') {
        setShowHelp(true);
        setIsLoading(false);
        return;
      }

      if (command?.id === 'status') {
        // Generate team status
        const statusContent = generateTeamStatus(agency);
        setMessages(prev => [...prev, {
          id: `status_${Date.now()}`,
          role: 'assistant',
          content: statusContent,
          timestamp: new Date(),
          metadata: { command: command.command },
        }]);
        setIsLoading(false);
        return;
      }

      // Build the actual prompt
      const prompt = command 
        ? buildPromptFromCommand(command, args) 
        : userMessage.content;

      const startTime = Date.now();

      // Call the AI with agency context
      const { data, error } = await supabase.functions.invoke('pf-agency-chat', {
        body: {
          message: prompt,
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

      if (error) {
        throw new Error(error.message || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data?.reply || 'I understand. Let me coordinate with the team on this.',
        timestamp: new Date(),
        metadata: {
          command: command?.command,
          respondingMember: leader?.specialization,
          processingTime,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: `fallback_${Date.now()}`,
        role: 'assistant',
        content: `I'm coordinating with the team. The ${leader?.specialization || 'lead'} is reviewing your request.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, agency]);

  // Handle keyboard
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
    <div className={cn("flex flex-col h-full bg-black/40 rounded-lg border border-border/30", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{agency.name}</h3>
            <p className="text-xs text-muted-foreground">
              {agency.members.length} cognitive{agency.members.length !== 1 ? 's' : ''} online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="gap-1 text-xs"
          >
            <HelpCircle className="w-3 h-3" />
            /help
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-3",
                msg.role === 'user' && "flex-row-reverse"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' 
                  ? "bg-cyan-500/20" 
                  : msg.role === 'system'
                    ? "bg-amber-500/20"
                    : "bg-fuchsia-500/20"
              )}>
                {msg.role === 'user' ? (
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <Bot className={cn(
                    "w-3.5 h-3.5",
                    msg.role === 'system' ? "text-amber-400" : "text-fuchsia-400"
                  )} />
                )}
              </div>
              <div className={cn(
                "flex-1 max-w-[80%] rounded-lg px-3 py-2",
                msg.role === 'user' 
                  ? "bg-cyan-500/10 border border-cyan-500/20" 
                  : msg.role === 'system'
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-muted/30 border border-border/30"
              )}>
                <div 
                  className="text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none
                    [&_strong]:text-foreground [&_strong]:font-semibold
                    [&_em]:text-muted-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMessageContent(msg.content)
                  }}
                />
                {msg.metadata?.command && (
                  <Badge variant="outline" className="mt-2 text-[10px] h-4">
                    {msg.metadata.command}
                  </Badge>
                )}
                <span className="block text-[10px] text-muted-foreground mt-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 text-fuchsia-400 animate-spin" />
              </div>
              <div className="bg-muted/30 border border-border/30 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-3 h-3" />
                  Team is thinking...
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Command Palette */}
      {showCommands && (
        <AgencyCommandPalette
          commands={availableCommands}
          onSelect={handleCommandSelect}
          onClose={() => setShowCommands(false)}
          filter={input.slice(1)}
        />
      )}

      {/* Help Panel */}
      {showHelp && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-auto">
          <div className="p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Command className="w-5 h-5 text-fuchsia-400" />
                Quick Commands
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowHelp(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Commands available based on your team composition ({agency.members.length} cognitives)
            </p>

            <div className="space-y-6">
              {Object.entries(commandsByCategory).map(([category, cmds]) => (
                <div key={category}>
                  <h3 className={cn("text-sm font-medium mb-3", CATEGORY_INFO[category]?.color)}>
                    {CATEGORY_INFO[category]?.label || category}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {cmds.map((cmd) => (
                      <button
                        key={cmd.id}
                        onClick={() => {
                          setShowHelp(false);
                          handleCommandSelect(cmd);
                        }}
                        className="text-left p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-fuchsia-500/30 hover:bg-fuchsia-500/5 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{cmd.icon}</span>
                          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded text-fuchsia-400">
                            {cmd.command}
                          </code>
                        </div>
                        <p className="text-sm font-medium">{cmd.label}</p>
                        <p className="text-xs text-muted-foreground">{cmd.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-sm">
                <strong>Tip:</strong> Type <code className="bg-black/30 px-1">/</code> in the chat to see quick command suggestions, 
                or start typing any message to talk directly with your team.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border/30">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message or / for commands..."
              className="min-h-[44px] max-h-32 resize-none pr-10 bg-black/30"
              disabled={isLoading}
            />
            {input.startsWith('/') && !showCommands && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-8 w-8"
                onClick={() => setShowCommands(true)}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            )}
          </div>
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="shrink-0 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500"
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
  );
}

// Helper to generate team status
function generateTeamStatus(agency: Agency): string {
  const lines = [
    `## ${agency.name} — Team Status`,
    '',
    `**Team Size:** ${agency.members.length} cognitives`,
    `**Cohesion Rating:** ${agency.cohesionRating}%`,
    `**Dream Pool:** ${agency.dreamPoolMode}`,
    '',
    '### Team Composition',
  ];

  for (const member of agency.members) {
    const roleIcon = member.role === 'leader' ? '👑' : '🤖';
    lines.push(`${roleIcon} **${member.specialization}** (${member.role})`);
  }

  lines.push('', '---', '*All systems operational. Ready for tasks.*');

  return lines.join('\n');
}

// Format message content with rich HTML
function formatMessageContent(content: string): string {
  // Replace ##text## with <strong>text</strong>
  let formatted = content.replace(/##([^#]+)##/g, '<strong>$1</strong>');
  
  // Replace **text** with <strong>text</strong>
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Replace *text* with <em>text</em>
  formatted = formatted.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  
  // Replace - at start of lines with bullet points
  formatted = formatted.replace(/^- /gm, '• ');
  
  // Convert ## headers
  formatted = formatted.replace(/^## (.+)$/gm, '<strong class="text-base block mt-2 mb-1">$1</strong>');
  formatted = formatted.replace(/^### (.+)$/gm, '<strong class="text-sm block mt-2 mb-1">$1</strong>');
  
  // Preserve line breaks
  formatted = formatted.replace(/\n/g, '<br />');
  
  return formatted;
}
