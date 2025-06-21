import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Search, FileText, ExternalLink } from 'lucide-react';
import { marked } from 'marked';
import { useSearchStore } from '../../stores';


interface SearchWidgetProps {
  widgetId?: string; // If provided, search within specific widget; otherwise search all
  placeholder?: string;
  className?: string;
}

export function SearchWidget({ widgetId, placeholder = "Search your content...", className }: SearchWidgetProps) {
  const { 
    query, 
    results, 
    loading, 
    hasSearched, 
    setQuery, 
    searchWidget, 
    searchAllWidgets 
  } = useSearchStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (widgetId) {
      await searchWidget(widgetId, query);
    } else {
      await searchAllWidgets(query);
    }
  };

  const formatSimilarity = (similarity: number): string => {
    return `${Math.round(similarity * 100)}%`;
  };

  const truncateText = (text: string, maxLength: number = 200): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderMarkdown = (text: string): string => {
    try {
      const result = marked(text, { breaks: true, gfm: true });
      return typeof result === 'string' ? result : text;
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return text;
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            {widgetId ? 'Search Widget Content' : 'Search All Widgets'}
          </CardTitle>
          <CardDescription>
            {widgetId 
              ? 'Search within this widget\'s content and files'
              : 'Search across all your widgets using vector similarity'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !query.trim()}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </form>

          {/* Results */}
          {hasSearched && (
            <div className="space-y-4">
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600">
                    Try different keywords or add more content to your widgets.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      Found {results.length} results
                    </h4>
                    <Badge variant="secondary">
                      Vector Search
                    </Badge>
                  </div>

                  {results.map((result, index) => (
                    <Card key={index} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {/* Content */}
                          <div 
                            className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none prose-headings:mb-2 prose-headings:mt-0 prose-p:mb-2 prose-ul:mb-2 prose-ol:mb-2"
                            dangerouslySetInnerHTML={{ 
                              __html: renderMarkdown(result.chunk) 
                            }}
                          />

                          {/* Metadata */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-4">
                              {result.metadata.source && (
                                <div className="flex items-center gap-1">
                                  <FileText className="w-3 h-3" />
                                  <span>{result.metadata.source}</span>
                                </div>
                              )}
                              <span>Chunk #{result.metadata.chunkIndex + 1}</span>
                              {!widgetId && (
                                <span>Widget #{result.widgetId}</span>
                              )}
                            </div>
                            <Badge 
                              variant={result.similarity > 0.8 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {formatSimilarity(result.similarity)} match
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}