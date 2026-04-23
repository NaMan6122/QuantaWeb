import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code?: string;
  children?: string;
  language: string;
  title?: string;
  showLineNumbers?: boolean;
}

const languageLabels: Record<string, string> = {
  kotlin: "Kotlin",
  cpp: "C++",
  aidl: "AIDL",
  gradle: "Gradle",
  bash: "Bash",
  json: "JSON",
  xml: "XML",
};

export default function CodeBlock({
  code: codeProp,
  children,
  language,
  title,
  showLineNumbers = true,
}: CodeBlockProps) {
  const code = (codeProp ?? children ?? '').trim();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <div className="rounded-lg border border-[var(--outline-variant)] overflow-hidden my-4">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface-container)] border-b border-[var(--outline-variant)]">
          <span className="text-sm font-medium text-[var(--on-surface-variant)] font-headline">
            {title}
          </span>
        </div>
      )}

      <div className="relative bg-[var(--surface-container-low)]">
        {/* Language badge */}
        <span className="absolute top-2 right-12 text-xs px-2 py-0.5 rounded bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)] font-mono select-none">
          {languageLabels[language] ?? language}
        </span>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-[var(--surface-container-highest)] text-[var(--on-surface-variant)] transition-colors"
          aria-label="Copy code"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>

        <div className="overflow-x-auto p-4 pt-10">
          <table className="border-collapse w-full">
            <tbody>
              {lines.map((line, i) => (
                <tr key={i} className="leading-relaxed">
                  {showLineNumbers && (
                    <td className="pr-4 text-right select-none text-[var(--on-surface-variant)]/40 font-mono text-sm align-top w-[1%] whitespace-nowrap">
                      {i + 1}
                    </td>
                  )}
                  <td className="font-mono text-sm text-white whitespace-pre">
                    {line}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
