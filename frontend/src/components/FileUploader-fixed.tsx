import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  onFileProcessed: (document: {
    filename: string;
    type: string;
    text: string;
    wordCount: number;
    metadata?: any;
  }) => void;
  onProcessingStart: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileProcessed, onProcessingStart }) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError(null);
    setIsUploading(true);
    onProcessingStart();

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('document', file);

      // Upload file to backend (修正済みエンドポイント)
      const uploadResponse = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const result = await uploadResponse.json();
      
      // For now, return a simulated result
      const processedDoc = {
        filename: file.name,
        type: file.type,
        text: result.message || `Processed ${file.name}`,
        wordCount: Math.floor(file.size / 5), // Rough estimate
        metadata: { 
          size: file.size,
          uploadedAt: new Date().toISOString(),
          ...result 
        }
      };
      
      onFileProcessed(processedDoc);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please check your file and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const containerStyle = {
    width: '100%',
    border: `2px dashed ${dragOver ? '#3b82f6' : '#d1d5db'}`,
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center' as const,
    cursor: isUploading ? 'not-allowed' : 'pointer',
    backgroundColor: dragOver ? '#eff6ff' : '#f9fafb',
    transition: 'all 0.3s ease',
    opacity: isUploading ? 0.5 : 1
  };

  return (
    <div style={{ width: '100%' }}>
      <div
        style={containerStyle}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          accept=".docx,.pdf,.txt"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div>
            <div style={{
              width: '48px',
              height: '48px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: '#6b7280' }}>Processing your document...</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📎</div>
            <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '10px' }}>
              <span style={{ fontWeight: '600' }}>Click to upload</span> or drag and drop your document
            </p>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
              Supported formats: .docx, .pdf, .txt (Max 10MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '6px'
        }}>
          <strong style={{ color: '#dc2626' }}>Error:</strong> 
          <span style={{ color: '#b91c1c', marginLeft: '10px' }}>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileUploader;