import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function getLanguage(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase();

  switch (extension) {
    case "css":
      return "css";
    case "html":
      return "html";
    case "js":
    case "jsx":
      return "javascript";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "php":
      return "php";
    case "ts":
    case "tsx":
      return "typescript";
    case "yaml":
    case "yml":
      return "yaml";
    default:
      return "text";
  }
}

interface CodeViewerProps {
  filename: string;
  content: string;
}

export function CodeViewer({ filename, content }: CodeViewerProps) {
  return (
    <div className="max-h-[70vh] overflow-auto text-sm">
      <SyntaxHighlighter
        language={getLanguage(filename)}
        style={oneDark}
        customStyle={{
          margin: 0,
          minHeight: "70vh",
          padding: "1rem",
        }}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}
