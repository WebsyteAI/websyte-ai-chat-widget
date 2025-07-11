import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../../app/test-utils';
import userEvent from '@testing-library/user-event';
import { WidgetForm } from '../../../../../app/components/widgets/WidgetForm';
import { useUIStore, type Widget } from '../../../../../app/stores';
import { toast } from '../../../../../app/lib/use-toast';

// Mock dependencies
vi.mock('../../../../../app/stores');
vi.mock('../../../../../app/lib/use-toast');
vi.mock('../../../../../app/components/widgets/EmbedCodeGenerator', () => ({
  EmbedCodeGenerator: () => <div>Embed Code Generator</div>
}));

const mockWidget: Widget = {
  id: 'widget-1',
  userId: 'user-1',
  name: 'Test Widget',
  description: 'Test description',
  url: 'https://example.com',
  logoUrl: 'https://example.com/logo.png',
  isPublic: false,
  crawlUrl: 'https://example.com/crawl',
  crawlStatus: 'completed',
  crawlPageCount: 10,
  workflowId: 'workflow-1',
  files: [
    {
      id: 'file-1',
      filename: 'test.pdf',
      fileType: 'application/pdf',
      fileSize: 1024,
      createdAt: new Date()
    }
  ],
  recommendations: [
    { text: 'How to get started?', response: 'Follow these steps...' }
  ],
  links: [
    { url: 'https://example.com/docs', text: 'Documentation', importance: 'high', category: 'docs' }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('WidgetForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnWidgetUpdated = vi.fn();

  const mockStore = {
    widgetFormData: {
      name: '',
      description: '',
      url: '',
      logoUrl: '',
      content: '',
      files: [],
      dragActive: false
    },
    updateWidgetFormField: vi.fn(),
    addFiles: vi.fn(),
    removeFile: vi.fn(),
    setDragActive: vi.fn(),
    resetWidgetForm: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useUIStore as any).mockReturnValue(mockStore);
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render create mode when no widget provided', () => {
      render(
        <WidgetForm 
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Create New Widget')).toBeInTheDocument();
      expect(screen.queryByText('Delete Widget')).not.toBeInTheDocument();
    });

    it('should render edit mode when widget provided', () => {
      render(
        <WidgetForm 
          widget={mockWidget}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Edit Widget')).toBeInTheDocument();
      expect(screen.getByText('Delete Widget')).toBeInTheDocument();
    });

    it('should render all tabs', () => {
      render(
        <WidgetForm 
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Basic Info')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  describe('Form Data Initialization', () => {
    it('should initialize form with widget data in edit mode', () => {
      render(
        <WidgetForm 
          widget={mockWidget}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(mockStore.updateWidgetFormField).toHaveBeenCalledWith('name', mockWidget.name);
      expect(mockStore.updateWidgetFormField).toHaveBeenCalledWith('description', mockWidget.description);
      expect(mockStore.updateWidgetFormField).toHaveBeenCalledWith('url', mockWidget.url);
      expect(mockStore.updateWidgetFormField).toHaveBeenCalledWith('logoUrl', mockWidget.logoUrl);
    });

    it('should reset form when switching from edit to create mode', () => {
      const { rerender } = render(
        <WidgetForm 
          widget={mockWidget}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      rerender(
        <WidgetForm 
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(mockStore.resetWidgetForm).toHaveBeenCalled();
    });
  });

  describe('File Upload', () => {
    it('should handle file drag and drop', async () => {
      render(
        <WidgetForm 
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const dropZone = screen.getByText(/Drag & drop files here/i).closest('div');
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      fireEvent.dragEnter(dropZone!);
      expect(mockStore.setDragActive).toHaveBeenCalledWith(true);

      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [file]
        }
      });

      expect(mockStore.setDragActive).toHaveBeenCalledWith(false);
      expect(mockStore.addFiles).toHaveBeenCalledWith([file]);
    });

    it('should handle file selection via input', async () => {
      render(
        <WidgetForm 
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
      const input = screen.getByLabelText(/Select files/i);

      await userEvent.upload(input, file);

      expect(mockStore.addFiles).toHaveBeenCalledWith([file]);
    });

    it('should delete existing files', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(
        <WidgetForm 
          widget={mockWidget}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const deleteButton = screen.getByLabelText('Delete test.pdf');
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/widgets/${mockWidget.id}/files/${mockWidget.files[0].id}`,
          expect.objectContaining({
            method: 'DELETE'
          })
        );
      });
    });
  });

  describe('Crawl Functionality', () => {
    it('should start crawl with valid URL', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      render(
        <WidgetForm 
          widget={mockWidget}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const crawlUrlInput = screen.getByPlaceholderText('https://example.com');
      await userEvent.type(crawlUrlInput, 'https://newsite.com');

      const startCrawlButton = screen.getByText('Start Crawl');
      await userEvent.click(startCrawlButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/widgets/${mockWidget.id}/crawl`,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ crawlUrl: 'https://newsite.com' })
          })
        );
      });
    });

    it('should show crawl status', () => {
      render(
        <WidgetForm 
          widget={{
            ...mockWidget,
            crawlStatus: 'crawling'
          }}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText(/Currently crawling/i)).toBeInTheDocument();
    });

    it('should allow refresh crawl when completed', () => {
      render(
        <WidgetForm 
          widget={{
            ...mockWidget,
            crawlStatus: 'completed'
          }}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Refresh Crawl')).toBeInTheDocument();
    });
  });

  describe('Recommendations', () => {
    it('should generate recommendations', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          recommendations: [
            { text: 'New question?', response: 'New answer' }
          ]
        })
      });

      render(
        <WidgetForm 
          widget={mockWidget}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onWidgetUpdated={mockOnWidgetUpdated}
        />
      );

      const generateButton = screen.getByText('Generate Recommendations');
      await userEvent.click(generateButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/widgets/${mockWidget.id}/recommendations/generate`,
          expect.objectContaining({
            method: 'POST'
          })
        );
      });

      expect(toast.success).toHaveBeenCalledWith('Recommendations generated successfully');
    });
  });

  describe('Form Submission', () => {
    it('should validate required fields', async () => {
      mockStore.widgetFormData = {
        ...mockStore.widgetFormData,
        name: '' // Empty name
      };

      render(
        <WidgetForm 
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByText('Create Widget');
      await userEvent.click(saveButton);

      expect(toast.error).toHaveBeenCalledWith('Please enter a widget name');
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit form with valid data', async () => {
      mockStore.widgetFormData = {
        ...mockStore.widgetFormData,
        name: 'Test Widget',
        description: 'Test description',
        url: 'https://example.com'
      };

      render(
        <WidgetForm 
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByText('Create Widget');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.any(FormData));
      });
    });

    it('should handle submission errors', async () => {
      mockOnSubmit.mockRejectedValueOnce(new Error('Submission failed'));

      mockStore.widgetFormData = {
        ...mockStore.widgetFormData,
        name: 'Test Widget'
      };

      render(
        <WidgetForm 
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const saveButton = screen.getByText('Create Widget');
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save widget. Please try again.');
      });
    });
  });

  describe('Widget Visibility', () => {
    it('should toggle widget visibility', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ widget: { ...mockWidget, isPublic: true } })
      });

      render(
        <WidgetForm 
          widget={mockWidget}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const visibilityToggle = screen.getByRole('checkbox');
      await userEvent.click(visibilityToggle);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/widgets/${mockWidget.id}/visibility`,
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ isPublic: true })
          })
        );
      });
    });
  });

  describe('Navigation', () => {
    it('should call onCancel when back button clicked', async () => {
      render(
        <WidgetForm 
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const backButton = screen.getByText('Back to Widgets');
      await userEvent.click(backButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should call onDelete when delete button clicked', async () => {
      render(
        <WidgetForm 
          widget={mockWidget}
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByText('Delete Widget');
      await userEvent.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalled();
    });
  });
});