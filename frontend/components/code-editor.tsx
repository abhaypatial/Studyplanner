"use client";

import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-44 rounded-md border bg-muted p-3 font-mono text-sm">Loading editor...</div>,
});

type CodeEditorProps = {
  language: "python" | "sql";
  value: string;
  onChange: (value: string) => void;
};

export function CodeEditor({ language, value, onChange }: CodeEditorProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-md border">
      <MonacoEditor
        height="220px"
        language={language}
        theme="vs-dark"
        value={value}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
        onChange={(next) => onChange(next ?? "")}
      />
    </div>
  );
}
