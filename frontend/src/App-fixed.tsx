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
  content?: {
    text: string;
    originalFilename: string;
    fileType: string;
    wordCount: number;
    extractedAt: string;
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
      formData.append('document', file);

      // 正しいバックエンドエンドポイント使用
      const response = await fetch('http://localhost:5000/api/upload', {
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
            <div className="max-w-4xl mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <div className="text-green-500 mr-3">✅</div>
                <div className="flex-1">
                  <h3 className="text-green-800 font-medium mb-3">アップロード・解析成功</h3>
                  
                  {/* ファイル情報 */}
                  <div className="text-green-700 text-sm mb-4">
                    <p><strong>ファイル名:</strong> {uploadResult.file.originalName}</p>
                    <p><strong>サイズ:</strong> {(uploadResult.file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p><strong>形式:</strong> {uploadResult.file.mimetype}</p>
                  </div>
                  
                  {/* 解析結果 */}
                  {uploadResult.content && (
                    <div className="border-t border-green-200 pt-4">
                      <h4 className="text-green-800 font-medium mb-2">文書解析結果</h4>
                      <div className="text-green-700 text-sm mb-3">
                        <p><strong>文字数:</strong> {uploadResult.content.wordCount.toLocaleString()}文字</p>
                        <p><strong>解析日時:</strong> {new Date(uploadResult.content.extractedAt).toLocaleString('ja-JP')}</p>
                      </div>
                      
                      {/* テキストプレビュー */}
                      <div className="bg-white p-4 rounded border border-green-200">
                        <h5 className="text-green-800 font-medium mb-2">テキストプレビュー</h5>
                        <div className="text-gray-700 text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
                          {uploadResult.content.text.length > 500 
                            ? uploadResult.content.text.substring(0, 500) + '...'
                            : uploadResult.content.text
                          }
                        </div>
                        {uploadResult.content.text.length > 500 && (
                          <p className="text-green-600 text-xs mt-2">…さらに {uploadResult.content.text.length - 500} 文字</p>
                        )}
                      </div>
                    </div>
                  )}
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