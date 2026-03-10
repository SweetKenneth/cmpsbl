/**
 * S-Tier 098 — Terminal Command Parser
 * ID: S-118 | CJPI: 90 | Module: DECODE
 * 
 * Advanced terminal command parsing with autocomplete and validation.
 */

export interface CommandDefinition {
  name: string;
  aliases: string[];
  description: string;
  args: ArgDefinition[];
  flags: FlagDefinition[];
  handler?: string; // Capability ID to route to
}

export interface ArgDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description: string;
  choices?: string[];
}

export interface FlagDefinition {
  name: string;
  short?: string;
  type: 'string' | 'number' | 'boolean';
  default?: unknown;
  description: string;
}

export interface ParsedCommand {
  command: string;
  args: Record<string, unknown>;
  flags: Record<string, unknown>;
  raw: string;
  valid: boolean;
  errors: string[];
}

export interface AutocompleteResult {
  suggestions: string[];
  type: 'command' | 'arg' | 'flag' | 'value';
}

export class TerminalCommandParser {
  private commands: Map<string, CommandDefinition> = new Map();
  private aliasMap: Map<string, string> = new Map();

  register(cmd: CommandDefinition): void {
    this.commands.set(cmd.name, cmd);
    for (const alias of cmd.aliases) {
      this.aliasMap.set(alias, cmd.name);
    }
  }

  parse(input: string): ParsedCommand {
    const tokens = this.tokenize(input);
    const errors: string[] = [];
    
    if (tokens.length === 0) {
      return { command: '', args: {}, flags: {}, raw: input, valid: false, errors: ['Empty input'] };
    }

    const cmdName = this.aliasMap.get(tokens[0]) || tokens[0];
    const cmdDef = this.commands.get(cmdName);

    if (!cmdDef) {
      return { command: cmdName, args: {}, flags: {}, raw: input, valid: false, errors: [`Unknown command: ${tokens[0]}`] };
    }

    const args: Record<string, unknown> = {};
    const flags: Record<string, unknown> = {};
    let argIdx = 0;

    // Set flag defaults
    for (const flag of cmdDef.flags) {
      if (flag.default !== undefined) flags[flag.name] = flag.default;
    }

    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.startsWith('--')) {
        const [key, val] = token.slice(2).split('=');
        const flagDef = cmdDef.flags.find(f => f.name === key);
        if (flagDef) {
          flags[key] = flagDef.type === 'boolean' ? (val !== 'false') : (flagDef.type === 'number' ? Number(val) : val || true);
        } else {
          errors.push(`Unknown flag: --${key}`);
        }
      } else if (token.startsWith('-') && token.length === 2) {
        const flagDef = cmdDef.flags.find(f => f.short === token[1]);
        if (flagDef) {
          if (flagDef.type === 'boolean') { flags[flagDef.name] = true; }
          else if (i + 1 < tokens.length) { flags[flagDef.name] = tokens[++i]; }
        }
      } else if (argIdx < cmdDef.args.length) {
        const argDef = cmdDef.args[argIdx];
        if (argDef.choices && !argDef.choices.includes(token)) {
          errors.push(`Invalid value for ${argDef.name}: ${token}. Expected: ${argDef.choices.join(', ')}`);
        }
        args[argDef.name] = argDef.type === 'number' ? Number(token) : token;
        argIdx++;
      }
    }

    // Check required args
    for (let i = argIdx; i < cmdDef.args.length; i++) {
      if (cmdDef.args[i].required) {
        errors.push(`Missing required argument: ${cmdDef.args[i].name}`);
      }
    }

    return { command: cmdName, args, flags, raw: input, valid: errors.length === 0, errors };
  }

  autocomplete(partial: string): AutocompleteResult {
    const tokens = this.tokenize(partial);
    
    if (tokens.length <= 1) {
      const prefix = tokens[0] || '';
      const commands = [...this.commands.keys(), ...this.aliasMap.keys()]
        .filter(c => c.startsWith(prefix));
      return { suggestions: commands, type: 'command' };
    }

    const cmdName = this.aliasMap.get(tokens[0]) || tokens[0];
    const cmdDef = this.commands.get(cmdName);
    if (!cmdDef) return { suggestions: [], type: 'command' };

    const lastToken = tokens[tokens.length - 1];
    if (lastToken.startsWith('-')) {
      const flags = cmdDef.flags
        .map(f => `--${f.name}`)
        .filter(f => f.startsWith(lastToken));
      return { suggestions: flags, type: 'flag' };
    }

    return { suggestions: [], type: 'arg' };
  }

  private tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;
    let quoteChar = '';

    for (const ch of input) {
      if (inQuotes) {
        if (ch === quoteChar) { inQuotes = false; } else { current += ch; }
      } else if (ch === '"' || ch === "'") {
        inQuotes = true; quoteChar = ch;
      } else if (ch === ' ') {
        if (current) { tokens.push(current); current = ''; }
      } else {
        current += ch;
      }
    }
    if (current) tokens.push(current);
    return tokens;
  }

  getCommands(): CommandDefinition[] { return [...this.commands.values()]; }
}
