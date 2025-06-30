-- Add workflowId column to widget table
ALTER TABLE widget ADD COLUMN workflow_id TEXT;

-- Add index for workflowId for faster lookups
CREATE INDEX widget_workflow_id_idx ON widget(workflow_id);