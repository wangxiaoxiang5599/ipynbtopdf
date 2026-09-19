import { cellText, highlightCode, notebookLanguage, type Notebook } from "./ipynb";
import type { Script, ScriptOptions } from "./script-options";

export { defaultScriptOptions } from "./script-options";
export type { Script, ScriptOptions } from "./script-options";

/* Every kernel this site is likely to meet comments with `#`; anything else gets a generic
   extension and the same comment character, which is wrong for very few languages. */
const LANGUAGES: Record<string, { name: string; extension: string }> = {
  python: { name: "Python", extension: "py" },
  r: { name: "R", extension: "R" },
  julia: { name: "Julia", extension: "jl" },
  bash: { name: "Bash", extension: "sh" },
  sh: { name: "Shell", extension: "sh" },
};

/* IPython lines that are not the kernel language: `%matplotlib inline`, `%%time`, `!pip
   install`. nbconvert rewrites them into get_ipython() calls that fail outside IPython;
   here they are commented out by default so the script still runs. `?` help suffixes are
   left alone — they are rare and harmless-looking enough that rewriting them surprises. */
function isMagic(line: string): boolean {
  const t = line.trimStart();
  return t.startsWith("%") || t.startsWith("!");
}

function commentOut(block: string): string {
  return block
    .split("\n")
    .map((line) => (line.trim() ? `# ${line}` : "#"))
    .join("\n");
}

function processCode(code: string, magics: ScriptOptions["magics"], language: string): string {
  if (magics === "keep" || language !== "python") return code;
  return code
    .split("\n")
    .flatMap((line) => {
      if (!isMagic(line)) return [line];
      return magics === "remove" ? [] : [`# ${line}`];
    })
    .join("\n");
}

export function notebookToScript(
  nb: Notebook,
  fileName: string,
  options: ScriptOptions,
): Script {
  const language = notebookLanguage(nb).toLowerCase();
  const meta = LANGUAGES[language] ?? { name: language, extension: "txt" };
  const parts: string[] = [`# Converted from ${fileName} by ipynbtopdf.xyz`];

  for (const cell of nb.cells ?? []) {
    const source = cellText(cell.source).replace(/\s+$/, "");
    if (!source.trim()) continue;

    if (cell.cell_type === "markdown") {
      if (options.markdown === "drop") continue;
      const header = options.markers === "percent" ? "# %% [markdown]\n" : "";
      parts.push(header + commentOut(source));
      continue;
    }

    if (cell.cell_type !== "code") continue;

    const body = processCode(source, options.magics, language);
    if (!body.trim()) continue;

    let marker = "";
    if (options.markers === "percent") marker = "# %%\n";
    if (options.markers === "nbconvert") {
      const n = cell.execution_count;
      marker = `# In[${n == null ? " " : n}]:\n\n`;
    }
    parts.push(marker + body);
  }

  const code = parts.join("\n\n") + "\n";
  return {
    code,
    html: highlightCode(code, language),
    language,
    languageName: meta.name,
    extension: meta.extension,
  };
}
