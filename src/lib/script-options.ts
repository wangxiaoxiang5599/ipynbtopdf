/* Kept apart from script.ts so the Converter can import the defaults and types without
   pulling ipynb.ts (and DOMPurify, which needs a window) into the server render. */

export type ScriptOptions = {
  /* "percent" is the `# %%` convention VS Code, Spyder and Jupytext all read as a cell
     boundary; "nbconvert" reproduces `jupyter nbconvert --to script`. */
  markers: "percent" | "nbconvert" | "none";
  markdown: "comment" | "drop";
  magics: "comment" | "remove" | "keep";
};

export const defaultScriptOptions: ScriptOptions = {
  markers: "percent",
  markdown: "comment",
  magics: "comment",
};

export type Script = {
  code: string;
  /** Highlighted HTML of `code`, for the preview. */
  html: string;
  language: string;
  /** Human name for the sidebar: "Python". */
  languageName: string;
  extension: string;
};
