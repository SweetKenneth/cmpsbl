/**
 * Activation snippet generator — run-aware, language-aware.
 * Produces post-export "what to do next" code for the user's actual ascended file.
 *
 * Design intent:
 *   - Snippets reference the user's real exported filename (e.g. cmpsbl_my_app.py).
 *   - One canonical execute() call per language — same shape as the wrapper exports.
 *   - When Mana layers were attached, append an attach() example so the user sees
 *     how to reach the additional capabilities.
 *
 * © CMPSBL® — All rights reserved.
 */

export interface ActivationSnippetInput {
  /** The actual exported filename (e.g. "cmpsbl_my_app.py"). */
  ascendedFileName: string;
  /** Language slug (typescript, python, javascript, ...). */
  language: string;
  /** True when the export was Mana-enhanced (selectedLayers > 0). */
  enhanced: boolean;
  /** Layer ids that auto-wired into the export (used for attach() examples). */
  attachedLayerIds?: string[];
}

export interface ActivationSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
}

const stripExt = (name: string) => name.replace(/\.[^.]+$/, '');

/** Normalize the language tag to one of our canonical buckets. */
function normalizeLang(lang: string): string {
  const l = lang.toLowerCase().replace(/\s+/g, '');
  if (l === 'ts' || l === 'tsx') return 'typescript';
  if (l === 'js' || l === 'jsx' || l === 'node') return 'javascript';
  if (l === 'py' || l === 'python3') return 'python';
  if (l === 'rb') return 'ruby';
  if (l === 'rs') return 'rust';
  if (l === 'cs' || l === 'c#') return 'csharp';
  if (l === 'kt') return 'kotlin';
  return l;
}

/** Build the run-aware import + execute snippet for the given language. */
function buildExecuteSnippet(input: ActivationSnippetInput): ActivationSnippet {
  const lang = normalizeLang(input.language);
  const fileBase = stripExt(input.ascendedFileName);

  switch (lang) {
    case 'typescript':
      return {
        id: 'execute-ts',
        title: 'Run your ascended code',
        language: 'typescript',
        code: `import { cmpsbl_execute } from './${fileBase}';

const result = await cmpsbl_execute({ /* your input */ });
console.log(result);`,
      };

    case 'javascript':
      return {
        id: 'execute-js',
        title: 'Run your ascended code',
        language: 'javascript',
        code: `const { cmpsbl_execute } = require('./${fileBase}');

(async () => {
  const result = await cmpsbl_execute({ /* your input */ });
  console.log(result);
})();`,
      };

    case 'python':
      return {
        id: 'execute-py',
        title: 'Run your ascended code',
        language: 'python',
        code: `from ${fileBase} import cmpsbl_execute

result = cmpsbl_execute({})  # your input here
print(result)`,
      };

    case 'go':
      return {
        id: 'execute-go',
        title: 'Run your ascended code',
        language: 'go',
        code: `// In your Go module, import the ascended package:
import "./${fileBase}"

func main() {
    result, _ := ${fileBase}.CmpsblExecute(map[string]any{})
    fmt.Println(result)
}`,
      };

    case 'rust':
      return {
        id: 'execute-rs',
        title: 'Run your ascended code',
        language: 'rust',
        code: `mod ${fileBase};

fn main() {
    let result = ${fileBase}::cmpsbl_execute(serde_json::json!({}));
    println!("{:?}", result);
}`,
      };

    case 'java':
      return {
        id: 'execute-java',
        title: 'Run your ascended code',
        language: 'java',
        code: `// Import the ascended class:
${fileBase} ascended = new ${fileBase}();
Object result = ascended.cmpsblExecute(Map.of());
System.out.println(result);`,
      };

    case 'csharp':
      return {
        id: 'execute-cs',
        title: 'Run your ascended code',
        language: 'csharp',
        code: `using ${fileBase};

var result = await Cmpsbl.Execute(new Dictionary<string, object>());
Console.WriteLine(result);`,
      };

    case 'kotlin':
      return {
        id: 'execute-kt',
        title: 'Run your ascended code',
        language: 'kotlin',
        code: `import ${fileBase}.cmpsblExecute

val result = cmpsblExecute(mapOf<String, Any>())
println(result)`,
      };

    case 'ruby':
      return {
        id: 'execute-rb',
        title: 'Run your ascended code',
        language: 'ruby',
        code: `require_relative '${fileBase}'

result = cmpsbl_execute({})
puts result`,
      };

    default:
      return {
        id: 'execute-generic',
        title: 'Run your ascended code',
        language: lang || 'text',
        code: `// Import ${input.ascendedFileName} into your project, then call:
//   cmpsbl_execute(input)
// The wrapper ships native bindings for TypeScript, Python, JavaScript,
// Go, Rust, Java, C#, Kotlin, and Ruby.`,
      };
  }
}

/**
 * Build the Mana attach() snippet — only emitted when enhanced=true.
 * Shows the user how to reach the layers that wired into their export.
 */
function buildAttachSnippet(input: ActivationSnippetInput): ActivationSnippet | null {
  if (!input.enhanced) return null;
  const lang = normalizeLang(input.language);
  const fileBase = stripExt(input.ascendedFileName);
  const layerHint = input.attachedLayerIds?.length
    ? ` // ${input.attachedLayerIds.length} layer(s) auto-wired`
    : '';

  switch (lang) {
    case 'typescript':
      return {
        id: 'attach-ts',
        title: 'Attach Mana layers',
        language: 'typescript',
        code: `import { attach } from './${fileBase}';

const session = attach({${layerHint}
  // layer config goes here — see USER-GUIDE.html
});
await session.run({ /* your input */ });`,
      };

    case 'javascript':
      return {
        id: 'attach-js',
        title: 'Attach Mana layers',
        language: 'javascript',
        code: `const { attach } = require('./${fileBase}');

const session = attach({${layerHint}});
session.run({ /* your input */ });`,
      };

    case 'python':
      return {
        id: 'attach-py',
        title: 'Attach Mana layers',
        language: 'python',
        code: `from ${fileBase} import attach

session = attach({})  ${layerHint}
session.run({})`,
      };

    default:
      return {
        id: 'attach-generic',
        title: 'Attach Mana layers',
        language: lang || 'text',
        code: `// Call attach() before cmpsbl_execute() to enable layer-aware mode.
// See USER-GUIDE.html in your export for language-specific syntax.`,
      };
  }
}

/** Public: produce all snippets for the activation guide. */
export function buildActivationSnippets(input: ActivationSnippetInput): ActivationSnippet[] {
  const out: ActivationSnippet[] = [buildExecuteSnippet(input)];
  const attach = buildAttachSnippet(input);
  if (attach) out.push(attach);
  return out;
}
