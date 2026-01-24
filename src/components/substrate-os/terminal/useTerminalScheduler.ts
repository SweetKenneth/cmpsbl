/**
 * Terminal Scheduled Execution
 * Schedule commands to run at specific times
 */

export interface ScheduledCommand {
  id: string;
  command: string;
  scheduleType: 'delay' | 'at' | 'cron';
  executeAt: Date;
  createdAt: Date;
  status: 'pending' | 'executed' | 'cancelled' | 'failed';
  result?: { success: boolean; output: string };
}

const scheduledCommands: Map<string, ScheduledCommand> = new Map();
const timers: Map<string, NodeJS.Timeout> = new Map();

export function parseDelay(delay: string): number | null {
  const match = delay.match(/^(\d+)(s|m|h|d)?$/i);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = (match[2] || 's').toLowerCase();
  
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return value * 1000;
  }
}

export function scheduleCommand(
  command: string,
  delay: string | Date,
  onExecute: (cmd: string) => Promise<{ success: boolean; output: string }>
): string {
  const id = `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  let executeAt: Date;
  let delayMs: number;
  
  if (delay instanceof Date) {
    executeAt = delay;
    delayMs = delay.getTime() - Date.now();
  } else {
    const parsed = parseDelay(delay);
    if (!parsed) {
      throw new Error(`Invalid delay format: ${delay}`);
    }
    delayMs = parsed;
    executeAt = new Date(Date.now() + delayMs);
  }
  
  if (delayMs <= 0) {
    throw new Error('Delay must be positive');
  }
  
  const scheduled: ScheduledCommand = {
    id,
    command,
    scheduleType: delay instanceof Date ? 'at' : 'delay',
    executeAt,
    createdAt: new Date(),
    status: 'pending',
  };
  
  scheduledCommands.set(id, scheduled);
  
  const timer = setTimeout(async () => {
    const cmd = scheduledCommands.get(id);
    if (!cmd || cmd.status !== 'pending') return;
    
    try {
      const result = await onExecute(command);
      cmd.status = 'executed';
      cmd.result = result;
    } catch (error) {
      cmd.status = 'failed';
      cmd.result = { success: false, output: String(error) };
    }
    
    timers.delete(id);
  }, delayMs);
  
  timers.set(id, timer);
  
  return id;
}

export function cancelScheduled(id: string): boolean {
  const timer = timers.get(id);
  const cmd = scheduledCommands.get(id);
  
  if (!timer || !cmd) return false;
  
  clearTimeout(timer);
  timers.delete(id);
  cmd.status = 'cancelled';
  
  return true;
}

export function getScheduledCommands(): ScheduledCommand[] {
  return Array.from(scheduledCommands.values());
}

export function getPendingCommands(): ScheduledCommand[] {
  return getScheduledCommands().filter(c => c.status === 'pending');
}

export function clearScheduled(): number {
  let count = 0;
  timers.forEach((timer, id) => {
    clearTimeout(timer);
    const cmd = scheduledCommands.get(id);
    if (cmd && cmd.status === 'pending') {
      cmd.status = 'cancelled';
      count++;
    }
  });
  timers.clear();
  return count;
}

export function formatScheduledList(): string {
  const pending = getPendingCommands();
  
  if (pending.length === 0) {
    return '◉ No scheduled commands.';
  }
  
  let output = `
┌─ SCHEDULED COMMANDS ─────────────────────────────────────────
│
`;

  pending.forEach((cmd, i) => {
    const shortId = cmd.id.slice(0, 10);
    const timeLeft = Math.max(0, Math.floor((cmd.executeAt.getTime() - Date.now()) / 1000));
    const timeStr = timeLeft > 3600 
      ? `${Math.floor(timeLeft / 3600)}h ${Math.floor((timeLeft % 3600) / 60)}m`
      : timeLeft > 60 
        ? `${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s`
        : `${timeLeft}s`;
    
    output += `│  ${i + 1}. [${shortId}] in ${timeStr.padStart(8)}\n`;
    output += `│     ${cmd.command}\n`;
  });

  output += `│
│  schedule cancel <id>  to cancel
│  schedule clear        to cancel all
└──────────────────────────────────────────────────────────────`;

  return output;
}

export function formatScheduleConfirmation(id: string, command: string, executeAt: Date): string {
  const delayMs = executeAt.getTime() - Date.now();
  const timeStr = delayMs > 3600000
    ? `${Math.floor(delayMs / 3600000)} hour(s)`
    : delayMs > 60000
      ? `${Math.floor(delayMs / 60000)} minute(s)`
      : `${Math.floor(delayMs / 1000)} second(s)`;
  
  return `◉ Command scheduled successfully
  
  ID:      ${id.slice(0, 12)}
  Command: ${command}
  Execute: ${executeAt.toLocaleTimeString()} (in ${timeStr})
  
  Use 'schedule list' to view all scheduled commands
  Use 'schedule cancel ${id.slice(0, 10)}' to cancel`;
}
