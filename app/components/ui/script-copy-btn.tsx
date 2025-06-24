import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { codeToHtml } from "shiki";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface ScriptCopyBtnProps {
  code: string;
  codeLanguage?: string;
  lightTheme?: string;
  darkTheme?: string;
  className?: string;
  showIcon?: boolean;
  buttonText?: string;
  successText?: string;
}

export function ScriptCopyBtn({
  code,
  codeLanguage = "shell",
  lightTheme = "github-light",
  darkTheme = "github-dark",
  className,
  showIcon = true,
  buttonText = "Copy",
  successText = "Copied!",
}: ScriptCopyBtnProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const highlightCode = async () => {
      try {
        const html = await codeToHtml(code, {
          lang: codeLanguage,
          theme: darkTheme,
        });
        setHighlightedCode(html);
      } catch (error) {
        console.error("Failed to highlight code:", error);
        setHighlightedCode(`<pre><code>${code}</code></pre>`);
      }
    };

    if (mounted && code) {
      highlightCode();
    }
  }, [code, codeLanguage, darkTheme, mounted]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn("relative group", className)}>
      <div
        className="overflow-x-auto rounded-lg bg-gray-900 text-gray-100 p-4 [&_pre]:whitespace-pre-wrap [&_pre]:break-all [&_pre]:text-sm [&_pre]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
      <Button
        onClick={copyToClipboard}
        variant="secondary"
        size="sm"
        className={cn(
          "absolute top-4 right-4",
          "bg-gray-800 text-gray-100 opacity-0 group-hover:opacity-100",
          "hover:bg-gray-700",
          "border-gray-700"
        )}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5"
            >
              {showIcon && <Check className="w-3.5 h-3.5 text-green-400" />}
              <span className="text-green-400">{successText}</span>
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1.5"
            >
              {showIcon && <Copy className="w-3.5 h-3.5" />}
              <span>{buttonText}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}