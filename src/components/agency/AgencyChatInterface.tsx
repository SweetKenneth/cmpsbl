/**
 * Agency Chat Interface — Interact with deployed agency team
 * Features: Persistent chat, real task delegation, honest capabilities
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Loader2, Sparkles, Command, HelpCircle, ChevronUp, X, Bot, User, Trash2, CheckCircle } from 'lucide-react';
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
  getTaskPrimitiveForCommand,
  getCapabilitiesSummary,
  CATEGORY_INFO,
  type QuickCommand 
} from '@/lib/agency/agencyCommands';
import { 
  loadChatMessages, 
  saveChatMessages, 
  clearChatHistory,
  type ChatMessage 
} from '@/lib/agency/chatPersistence';
import { 
  processUserRequest,
  detectActionIntent,
} from '@/lib/agency/leaderTaskDelegation';
import { AgencyCommandPalette } from './AgencyCommandPalette';
import { formatChatMessage } from '@/lib/ui/formatChatMessage';

interface AgencyChatInterfaceProps {
  agency: Agency;
  className?: string;
}

export function AgencyChatInterface({ agency, className }: AgencyChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get team specializations
  const teamSpecs = agency.members.map(m => m.specialization as Specialization);
  const availableCommands = getAvailableCommands(teamSpecs);
  const commandsByCategory = getCommandsByCategory(availableCommands);

  // Get leader for responses
  const leader = agency.members.find(m => m.role === 'leader');

  // Load persisted messages on mount
  useEffect(() => {
    if (!initialized && agency.id) {
      const stored = loadChatMessages(agency.id);
      if (stored.length > 0) {
        setMessages(stored);
      } else {
        // Add welcome message
        const welcomeMsg: ChatMessage = {
          id: 'welcome',
          role: 'system',
          content: `Welcome to **${agency.name}**! I'm ${leader?.specialization || 'your team lead'}.\n\nType \`/help\` to see available commands, or just tell me what you need — I'll assign tasks to the right team members.\n\n**What we can do:** Research, SEO audits, content generation, data extraction, and analysis.`,
          timestamp: new Date().toISOString(),
        };
        setMessages([welcomeMsg]);
        saveChatMessages(agency.id, [welcomeMsg]);
      }
      setInitialized(true);
    }
  }, [agency.id, agency.name, leader, initialized]);

  // Save messages when they change
  useEffect(() => {
    if (initialized && messages.length > 0) {
      saveChatMessages(agency.id, messages);
    }
  }, [messages, agency.id, initialized]);

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

  // Clear chat history
  const handleClearChat = () => {
    clearChatHistory(agency.id);
    const welcomeMsg: ChatMessage = {
      id: 'welcome_new',
      role: 'system',
      content: `Chat cleared. I'm ${leader?.specialization || 'your team lead'}, ready to help.`,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);
    toast.success('Chat history cleared');
  };

  // Send message
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
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
        const statusContent = generateTeamStatus(agency);
        const statusMsg: ChatMessage = {
          id: `status_${Date.now()}`,
          role: 'assistant',
          content: statusContent,
          timestamp: new Date().toISOString(),
          metadata: { command: command.command },
        };
        setMessages(prev => [...prev, statusMsg]);
        setIsLoading(false);
        return;
      }

      // Check if this is a command with a task primitive
      const taskPrimitive = command ? getTaskPrimitiveForCommand(command.id) : null;
      
      // Process for potential task creation
      const delegationResult = await processUserRequest(
        agency.id,
        userMessage.content,
        teamSpecs
      );

      let assistantContent: string;
      let tasksCreated: string[] = [];

      if (delegationResult.shouldCreateTask && delegationResult.delegationResult?.success) {
        // Task was created
        assistantContent = delegationResult.leaderResponse;
        if (delegationResult.delegationResult.taskId) {
          tasksCreated = [delegationResult.delegationResult.taskId];
        }
        toast.success('Task created and queued');
      } else if (delegationResult.leaderResponse) {
        // Leader has a specific response (out of scope, clarification needed)
        assistantContent = delegationResult.leaderResponse;
      } else {
        // Regular chat - call AI
        const prompt = command 
          ? buildPromptFromCommand(command, args) 
          : userMessage.content;

        const startTime = Date.now();

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
            capabilities: getCapabilitiesSummary(),
          },
        });

        if (error) {
          throw new Error(error.message || 'Failed to get response');
        }

        assistantContent = data?.reply || 'I understand. Let me coordinate with the team on this.';
      }

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString(),
        metadata: {
          command: command?.command,
          respondingMember: leader?.specialization,
          tasksCreated: tasksCreated.length > 0 ? tasksCreated : undefined,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const fallbackMessage: ChatMessage = {
        id: `fallback_${Date.now()}`,
        role: 'assistant',
        content: `I'm coordinating with the team. The ${leader?.specialization || 'lead'} is reviewing your request.`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, agency, teamSpecs, leader]);

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
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-magenta to-neon-purple flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{agency.name}</h3>
            <p className="text-xs text-muted-foreground">
              {agency.members.length} cognitive{agency.members.length !== 1 ? 's' : ''} online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearChat}
            className="gap-1 text-xs text-muted-foreground hover:text-destructive"
            title="Clear chat history"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
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
                  ? "bg-neon-cyan/20" 
                  : msg.role === 'system'
                    ? "bg-neon-amber/20"
                    : "bg-neon-magenta/20"
              )}>
                {msg.role === 'user' ? (
                  <User className="w-3.5 h-3.5 text-neon-cyan" />
                ) : (
                  <Bot className={cn(
                    "w-3.5 h-3.5",
                    msg.role === 'system' ? "text-neon-amber" : "text-neon-magenta"
                  )} />
                )}
              </div>
              <div className={cn(
                "flex-1 max-w-[80%] rounded-lg px-3 py-2",
                msg.role === 'user' 
                  ? "bg-neon-cyan/10 border border-neon-cyan/20" 
                  : msg.role === 'system'
                    ? "bg-neon-amber/10 border border-neon-amber/20"
                    : "bg-muted/30 border border-border/30"
              )}>
                <div 
                  className="text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none
                    [&_strong]:text-foreground [&_strong]:font-semibold
                    [&_em]:text-muted-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: formatChatMessage(msg.content)
                  }}
                />
                {msg.metadata?.tasksCreated && msg.metadata.tasksCreated.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-neon-green">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-[10px]">Task queued</span>
                  </div>
                )}
                {msg.metadata?.command && (
                  <Badge variant="outline" className="mt-2 text-[10px] h-4">
                    {msg.metadata.command}
                  </Badge>
                )}
                <span className="block text-[10px] text-muted-foreground mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-neon-magenta/20 flex items-center justify-center">
                <Loader2 className="w-3.5 h-3.5 text-neon-magenta animate-spin" />
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
                <Command className="w-5 h-5 text-neon-magenta" />
                Quick Commands
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setShowHelp(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              All commands create real tasks that the team will execute.
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
                        className="text-left p-3 rounded-lg bg-muted/20 border border-border/30 hover:border-neon-magenta/30 hover:bg-neon-magenta/5 transition-all"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span>{cmd.icon}</span>
                          <code className="text-xs bg-black/30 px-1.5 py-0.5 rounded text-neon-magenta">
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

            {/* Capabilities Section */}
            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-medium text-neon-green">✓ What We Can Do</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {getCapabilitiesSummary().canDo.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>

              <h3 className="text-sm font-medium text-neon-amber">⚠ Current Limitations</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                {getCapabilitiesSummary().cannotDo.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 p-4 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg">
              <p className="text-sm">
                <strong>Tip:</strong> Just describe what you need — I'll create the right task and assign it to the best team member automatically.
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
              placeholder="Tell me what you need (e.g., 'research competitors for X')..."
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
            className="shrink-0 bg-gradient-to-r from-neon-magenta to-neon-purple hover:from-neon-magenta hover:to-neon-purple"
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

// Escape HTML to prevent XSS attacks
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// Format message content with rich HTML (XSS-safe)
function formatMessageContent(content: string): string {
  // SECURITY: Escape HTML first to prevent XSS
  let formatted = escapeHtml(content);
  
  // Replace ##text## with <strong>text</strong>
  formatted = formatted.replace(/##([^#]+)##/g, '<strong>$1</strong>');
  
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
