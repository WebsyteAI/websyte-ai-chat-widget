import { Button } from '../../ui/button';
import { FileText, Download, Trash2 } from 'lucide-react';
import type { ExistingFile } from '../types';

interface FileListProps {
  existingFiles: ExistingFile[];
  newFiles: File[];
  deletingFileId: string | null;
  uploadingFiles: Set<string>;
  formatFileSize: (bytes: number) => string;
  deleteExistingFile: (fileId: string) => void;
  downloadFile: (file: ExistingFile) => void;
  removeFile: (index: number) => void;
}

export function FileList({
  existingFiles,
  newFiles,
  deletingFileId,
  uploadingFiles,
  formatFileSize,
  deleteExistingFile,
  downloadFile,
  removeFile
}: FileListProps) {
  return (
    <>
      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files</h4>
          {existingFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{file.filename}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.fileSize)} • {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => downloadFile(file)}
                  disabled={uploadingFiles.has(file.id)}
                  aria-label={`Download ${file.filename}`}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteExistingFile(file.id)}
                  disabled={deletingFileId === file.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label={`Delete ${file.filename}`}
                >
                  {deletingFileId === file.id ? (
                    <span className="w-4 h-4 animate-spin">⟳</span>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Files to Upload */}
      {newFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Files to Upload</h4>
          {newFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}