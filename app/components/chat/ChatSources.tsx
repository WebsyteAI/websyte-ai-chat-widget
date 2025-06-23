import { FileText, Search } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { MessageSource } from "./types";

interface ChatSourcesProps {
  sources: MessageSource[];
  title?: string;
  className?: string;
}

export function ChatSources({ sources, title = "Retrieved Sources", className = "" }: ChatSourcesProps) {
  const formatSimilarity = (similarity: number): string => {
    return `${Math.round(similarity * 100)}%`;
  };

  if (sources.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Search className="w-4 h-4" />
          {title}
          <Badge variant="secondary" className="text-xs">
            {sources.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {sources.map((source, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            {/* Source metadata */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FileText className="w-3 h-3" />
                {source.metadata.source ? (
                  <span className="font-medium truncate" title={source.metadata.source}>
                    {source.metadata.source}
                  </span>
                ) : (
                  <span className="text-gray-400">Unknown source</span>
                )}
                <span className="text-gray-400">•</span>
                <span>Chunk #{source.metadata.chunkIndex + 1}</span>
              </div>
              
              <Badge 
                variant={source.similarity > 0.8 ? "default" : source.similarity > 0.6 ? "secondary" : "outline"}
                className="text-xs"
              >
                {formatSimilarity(source.similarity)}
              </Badge>
            </div>
            
            {/* Source content */}
            <div className="text-sm text-gray-700 leading-relaxed">
              {source.chunk.length > 300 ? (
                <details>
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    {source.chunk.substring(0, 300)}...
                    <span className="ml-1 text-xs">(click to expand)</span>
                  </summary>
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    {source.chunk}
                  </div>
                </details>
              ) : (
                source.chunk
              )}
            </div>
            
            {/* Additional metadata */}
            {source.metadata.fileId && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  File ID: {source.metadata.fileId}
                </span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}