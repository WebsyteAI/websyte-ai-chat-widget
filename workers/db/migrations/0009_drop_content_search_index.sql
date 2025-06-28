-- Drop the content search index that was causing btree size limit issues
DROP INDEX IF EXISTS widget_embedding_content_search_idx;