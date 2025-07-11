import { useRef } from 'react';
import { toast } from '../../../lib/use-toast';
import type { ExistingFile, Widget } from '../types';

export function useFileManagement(
  widget: Widget | undefined,
  existingFiles: ExistingFile[],
  setExistingFiles: (files: ExistingFile[]) => void,
  setDeletingFileId: (id: string | null) => void,
  uploadingFiles: Set<string>,
  setUploadingFiles: (files: Set<string>) => void,
  addFiles: (files: File[]) => void,
  removeFile: (index: number) => void,
  setDragActive: (active: boolean) => void
) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const deleteExistingFile = async (fileId: string) => {
    if (!widget?.id) return;

    setDeletingFileId(fileId);
    try {
      const response = await fetch(`/api/widgets/${widget.id}/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Remove from existing files list
      setExistingFiles(existingFiles.filter(f => f.id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    } finally {
      setDeletingFileId(null);
    }
  };

  const downloadFile = async (file: ExistingFile) => {
    if (!widget?.id) return;

    setUploadingFiles(new Set(uploadingFiles).add(file.id));
    try {
      const response = await fetch(`/api/widgets/${widget.id}/files/${file.id}/download`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    } finally {
      const newUploadingFiles = new Set(uploadingFiles);
      newUploadingFiles.delete(file.id);
      setUploadingFiles(newUploadingFiles);
    }
  };

  return {
    fileInputRef,
    handleDrag,
    handleDrop,
    handleFileSelect,
    formatFileSize,
    deleteExistingFile,
    downloadFile
  };
}