# RF001 動作確認・修正指示書【Claude Code実行用】

## 🎯 ミッション概要

**RF001 ReportFormatter Pro の実際動作確認・必要修正実行**

### 現在状況
- ✅ 完全実装済み（フロントエンド・バックエンド）
- ❌ 実際起動未確認
- ❌ 発見済み問題未修正

### 目標
- 🚀 実際にサーバー起動・動作確認
- 🔧 発見問題の即座修正
- ✅ 真の100%動作システム達成

---

## 🚨 発見済み問題【要修正】

### Problem 1: ポート設定不整合
**現在:**
- Backend: `PORT = 5000` (server.ts)
- Frontend: `http://localhost:3001` (App.tsx)

**修正必要:**
- Frontend → Backend接続先を5000に変更

### Problem 2: FormDataフィールド名不整合
**現在:**
- Backend: `upload.single('document')` 期待
- Frontend: `formData.append('file', file)` 送信

**修正必要:**
- Frontend → 'document'フィールド名に変更

---

## 🔧 修正手順【必須実行】

### Step 1: フロントエンド修正

#### ファイル: `frontend/src/App.tsx`
```typescript
// 修正前
fetch('http://localhost:3001/api/health')

// 修正後
fetch('http://localhost:5000/api/health')
```

#### ファイル: `frontend/src/components/FileUploader.tsx`
```typescript
// 修正前  
formData.append('file', file);

// 修正後
formData.append('document', file);

// 修正前
const uploadResponse = await fetch('/api/upload', {

// 修正後  
const uploadResponse = await fetch('http://localhost:5000/api/upload', {
```

### Step 2: パッケージ確認・インストール

#### Backend依存関係確認
```bash
cd C:\Users\a-odajima\Desktop\claudecode\report-formatter-pro\backend
npm install
```

#### Frontend依存関係確認
```bash
cd C:\Users\a-odajima\Desktop\claudecode\report-formatter-pro\frontend
npm install
```

---

## 🚀 起動・動作確認手順【必須実行】

### Phase 1: バックエンド起動確認

#### 起動コマンド
```bash
cd C:\Users\a-odajima\Desktop\claudecode\report-formatter-pro\backend
npm run dev
```

#### 成功確認項目
- [ ] サーバー起動メッセージ表示
- [ ] ポート5000でlistening確認
- [ ] エラーログなし

#### ヘルスチェック確認
```bash
curl http://localhost:5000/api/health
# または
# ブラウザで http://localhost:5000/api/health 確認
```

**期待レスポンス:**
```json
{
  "status": "OK",
  "message": "ReportFormatter Pro Backend is running",
  "services": {
    "documentParser": "ready",
    "layoutEngine": "ready", 
    "pdfGenerator": "ready"
  }
}
```

### Phase 2: フロントエンド起動確認

#### 起動コマンド（新しいターミナル）
```bash
cd C:\Users\a-odajima\Desktop\claudecode\report-formatter-pro\frontend
npm run dev
```

#### 成功確認項目
- [ ] Vite dev server起動
- [ ] ブラウザ自動オープン（通常 http://localhost:5173）
- [ ] エラーログなし

### Phase 3: 統合動作確認

#### UI確認項目
- [ ] ReportFormatter Pro ページ表示
- [ ] システム状況: "✅ ReportFormatter Pro Backend is running"
- [ ] ファイルアップロード領域表示

#### 機能テスト
**テストファイル作成:**
```bash
echo "これはテスト文書です。プロフェッショナルなレイアウトに変換されます。" > test-document.txt
```

**アップロードテスト:**
1. test-document.txt をドラッグ&ドロップ
2. アップロード成功確認
3. 処理完了メッセージ確認

---

## 🔍 トラブルシューティング

### Backend起動失敗時
```bash
# TypeScript コンパイルエラー確認
cd backend
npm run build

# 依存関係再インストール
npm install

# Node.js版確認
node --version  # 18.0.0以上必要
```

### Frontend起動失敗時
```bash
# 依存関係確認
cd frontend
npm install

# Vite設定確認
npm run dev -- --port 3000 --host
```

### API接続エラー時
1. **CORS設定確認**: server.ts の cors() 設定
2. **ポート確認**: フロントエンドから正しいポート(5000)に接続
3. **ネットワーク確認**: ファイアウォール・セキュリティソフト

---

## 📊 成功判定基準

### 最低動作基準 (Bronze)
- [ ] Backend: ヘルスチェック成功
- [ ] Frontend: UI表示成功
- [ ] 統合: API接続成功

### 標準動作基準 (Silver)  
- [ ] ファイルアップロード成功
- [ ] エラーハンドリング動作確認
- [ ] レスポンス時間 <5秒

### 完璧動作基準 (Gold)
- [ ] 全API エンドポイント動作
- [ ] テンプレート一覧取得成功
- [ ] PDF生成・ダウンロード成功
- [ ] エラー0・警告0

---

## 📋 完了報告テンプレート

### 成功時報告
```markdown
## ✅ RF001 動作確認完了報告

### 修正実行結果
- [x] ポート設定修正完了
- [x] FormDataフィールド名修正完了

### 起動確認結果
- [x] Backend起動成功 (Port: 5000)
- [x] Frontend起動成功 (Port: XXXX)
- [x] API接続成功

### 動作テスト結果
- [x] ヘルスチェック: ✅ 正常
- [x] ファイルアップロード: ✅ 成功
- [x] レスポンス時間: XXXms

### 品質レベル
🏆 Gold/🥈 Silver/🥉 Bronze: [達成レベル]

### 証拠
- スクリーンショット: [必要に応じて]
- ログ出力: [重要なログメッセージ]

Status: ✅ 完全動作確認完了
```

### 問題発生時報告
```markdown
## ⚠️ RF001 動作確認問題報告

### 発生問題
1. **問題内容**: [具体的問題]
2. **エラーメッセージ**: [正確なエラー]
3. **発生タイミング**: [いつ発生したか]

### 実行済み対処
- [x] 対処1: [結果]
- [x] 対処2: [結果]

### 解決策提案
1. [提案1]
2. [提案2]

### 必要サポート
- [Claude Chatからの追加指示要求]

Status: 🔄 問題解決中
```

---

## ⚡ 緊急対応

### 重大問題時
1. **即座停止**: Ctrl+C でサーバー停止
2. **ログ保存**: エラーメッセージをコピー・保存
3. **報告**: 問題内容をClaude Chatに報告

### 軽微問題時
1. **再起動試行**: サーバー再起動
2. **キャッシュクリア**: npm cache clean --force
3. **段階的確認**: Step by Step で問題箇所特定

---

## 🎯 最終目標

**RF001 ReportFormatter Pro の完全動作システム達成**

- 🚀 実際に動作するWebアプリケーション
- 📄 ファイルアップロード → PDF生成の完全フロー
- 🏆 Enterprise Grade の動作品質

**この指示書に従い、真の100%完成を実現してください！**

---

**Claude Code実行開始**: 即座実行
**完了期限**: 速やかに  
**品質基準**: Gold Level 必達