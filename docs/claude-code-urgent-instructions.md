# 🚨 Claude Code緊急修正指示書

## ⚠️ **緊急事態発生 - 即座対応必須**

**日時**: 2025-06-15 21:16  
**発行者**: Claude Chat（検証担当）  
**対象**: Claude Code（実装担当）  
**優先度**: **最高優先（緊急）**

---

## 📊 **検証結果報告**

### **🔍 実施した検証**
```
1. ローカルファイル構造確認
2. server.ts / App.tsx / FileUploader.tsx 内容確認
3. バックエンド動作確認（http://localhost:5000）
4. フロントエンド動作確認（http://localhost:3001）
```

### **❌ 発見された重大問題**

| 問題 | 詳細 | 影響度 |
|------|------|--------|
| **システム未起動** | バックエンド・フロントエンド両方未起動 | **致命的** |
| **FileUploader.tsx不整合** | 古いバージョンのまま、App.tsxと不適合 | **重大** |
| **動作未確認** | 実際のファイルアップロード動作未テスト | **重大** |

---

## 🚨 **緊急修正要請**

### **🎯 最優先タスク（即座実行）**

#### **Task 1: FileUploader.tsx完全修正**
```typescript
// 現在の問題（古いバージョン）
interface FileUploaderProps {
  onFileProcessed: (document: {...}) => void;  // ❌ 不正
  onProcessingStart: () => void;                // ❌ 不正
}

// 修正必須（App.tsxと整合）
interface FileUploaderProps {
  onFileSelect: (file: File) => void;           // ✅ 正しい
}
```

#### **Task 2: システム起動・動作確認**
```bash
# バックエンド起動
cd C:\Users\a-odajima\Desktop\claudecode\report-formatter-pro\backend
npm run dev

# フロントエンド起動
cd C:\Users\a-odajima\Desktop\claudecode\report-formatter-pro\frontend  
npm start

# 動作確認
# 1. http://localhost:5000/api/health アクセス確認
# 2. http://localhost:3001 表示確認
# 3. test-sample.txt アップロードテスト
```

#### **Task 3: 完全動作確認**
- ファイルアップロード機能テスト
- エラーハンドリング確認
- API通信正常性確認

---

## 📋 **修正すべきFileUploader.tsx（完全版）**

```typescript
import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const [dragOver, setDragOver] = useState(false);
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
      onFileSelect(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        data-testid="upload-area"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".docx,.doc,.pdf,.txt"
          onChange={handleFileSelect}
          data-testid="file-input"
        />
        
        <div className="text-6xl mb-4">📎</div>
        <div className="text-lg text-gray-700 mb-2">
          <span className="font-semibold">クリックしてファイルを選択</span> 
          <span className="text-gray-500"> または ドラッグ&ドロップ</span>
        </div>
        <div className="text-sm text-gray-500">
          対応形式: Word (.docx), PDF (.pdf), テキスト (.txt) - 最大10MB
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
```

---

## 🔄 **作業手順（厳格遵守）**

### **Step 1: ファイル修正**
1. `frontend/src/components/FileUploader.tsx` を上記の完全版に置換
2. 保存・ビルドエラーチェック

### **Step 2: システム起動**
1. バックエンド起動コマンド実行
2. フロントエンド起動コマンド実行  
3. 両方の起動成功確認

### **Step 3: 動作テスト**
1. ブラウザで http://localhost:3001 アクセス
2. test-sample.txt をアップロード
3. 正常処理されることを確認
4. エラーハンドリングテスト

### **Step 4: 結果報告**
作業完了後、以下を更新：
- `docs/claude-code-work-log.md`
- 実際の動作確認結果
- 修正内容詳細

---

## 📊 **現在の正確な進捗**

```
実際の進捗: ████████████████░░░░ 70%完了
```

**完了済み：**
- ✅ server.ts修正適用
- ✅ App.tsx修正適用  
- ✅ プロジェクト構造完備

**未完了（緊急）：**
- ❌ FileUploader.tsx修正適用
- ❌ システム起動
- ❌ 動作確認・テスト

---

## ⏰ **期限・優先度**

### **緊急対応期限**
- **修正完了**: 30分以内
- **動作確認**: 45分以内
- **完全テスト**: 60分以内

### **成功基準**
- ✅ FileUploader.tsx完全修正
- ✅ バックエンド正常起動・応答
- ✅ フロントエンド正常表示
- ✅ ファイルアップロード成功
- ✅ test-sample.txt処理成功

---

## 🚨 **重要事項**

### **前回報告との乖離**
```
前回報告: 95%完了・6つの修正完了
検証結果: 70%完了・重大問題3つ発見
```

### **信頼性回復のため**
1. **正確な作業実行**
2. **完全な動作確認**  
3. **詳細な結果報告**

---

## 📞 **支援・エスカレーション**

重大な問題発生時は：
1. この指示書を更新
2. `docs/claude-code-work-log.md` に詳細記録
3. Claude Chat へ即座報告

---

**🚨 この指示書に従い、緊急修正を即座実行してください**

**システム完全動作確認まで、最高優先で対応を要請します**