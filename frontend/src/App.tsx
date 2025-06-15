import React, { useState } from 'react';
import FileUploader from './components/FileUploader';

interface UploadResponse {
  message: string;
  file: {
    originalName: string;
    filename: string;
    size: number;
    mimetype: string;
  };
}

function App() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    console.log('選択されたファイル:', file.name);
    
    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'アップロードに失敗しました');
      }

      setUploadResult(data);
      console.log('アップロード成功:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'アップロードエラー';
      setError(errorMessage);
      console.error('アップロードエラー:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Report Formatter Pro
          </h1>
          <p className="text-lg text-gray-600">
            PDFやWordファイルを美しいレポート形式に変換
          </p>
        </header>
        
        <main className="space-y-6">
          <FileUploader onFileSelect={handleFileSelect} />
          
          {/* アップロード中の表示 */}
          {isUploading && (
            <div className="max-w-2xl mx-auto p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-blue-700">ファイルをアップロード中...</span>
              </div>
            </div>
          )}
          
          {/* エラー表示 */}
          {error && (
            <div className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="text-red-500 mr-3">⚠️</div>
                <div>
                  <h3 className="text-red-800 font-medium">エラーが発生しました</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* アップロード成功表示 */}
          {uploadResult && (
            <div className="max-w-2xl mx-auto p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <div className="text-green-500 mr-3">✅</div>
                <div>
                  <h3 className="text-green-800 font-medium">アップロード成功</h3>
                  <div className="text-green-700 text-sm mt-1">
                    <p><strong>ファイル名:</strong> {uploadResult.file.originalName}</p>
                    <p><strong>サイズ:</strong> {(uploadResult.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>形式:</strong> {uploadResult.file.mimetype}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;