# RF001 Claude Code実装指示書【緊急修正依頼】

## 🚨 現在の状況

### Playwrightテスト診断結果
- **バックエンド**: ✅ 正常稼働中（localhost:5000）
- **フロントエンド**: ⚠️ 表示されるが、修正版コード未反映
- **エラー**: ❌ 「Conversion failed」HTTP 500エラー継続

### 問題の本質
```
❌ 修正版ファイル作成済みだが、実際の稼働環境に反映されていない
❌ 複雑なキャッシュ・ビルド・バージョン管理問題
❌ 動作中アプリケーション ≠ ローカル修正ファイル
```

---

## 📋 実行済み修正内容

### 1. server.ts修正 (バックエンド)
**場所**: `C:\Users\a-odajima\Desktop\claudecode\report-formatter-pro\backend\src\server.ts`

**修正内容**:
- DocumentParser呼び出し修正（mimetypeパラメータ追加）
- 存在しないcreateSampleDocumentメソッド削除
- サンプルドキュメント生成を実際のオブジェクトに変更
- レスポンス処理修正

### 2. App.tsx修正 (フロントエンド)
**場所**: `C:\Users\a-odajima\Desktop\claudecode\report-formatter-pro\frontend\src\App.tsx`

**修正内容**:
- GitHub最新版に同期
- エンドポイント修正：`localhost:3001` → `localhost:5000`
- FormDataフィールド名修正：`'file'` → `'document'`

### 3. FileUploader.tsx修正 (フロントエンド)
**場所**: `C:\Users\a-odajima\Desktop\claudecode\report-formatter-pro\frontend\src\components\FileUploader.tsx`

**修正内容**:
- APIエンドポイント修正：`/api/upload` → `http://localhost:5000/api/upload`
- FormDataフィールド名修正：`'file'` → `'document'`

---

## 🎯 Claude Code実装依頼

### 緊急修正タスク

#### Task 1: 実際の稼働コード特定
```bash
# 現在稼働中のアプリケーション構造確認
cd C:\Users\a-odajima\Desktop\claudecode\report-formatter-pro
find . -name "*.tsx" -o -name "*.ts" | head -20

# 実際にビルドされているファイル確認
ls -la frontend/build/ 2>/dev/null || echo "No build directory"
ls -la frontend/dist/ 2>/dev/null || echo "No dist directory"
```

#### Task 2: ビルド環境完全クリーンアップ
```bash
# 全プロセス終了
pkill -f "node.*3001"
pkill -f "node.*5000"

# キャッシュ・ビルド削除
cd frontend
rm -rf node_modules/.cache
rm -rf build dist .next
npm cache clean --force

cd ../backend  
rm -rf node_modules/.cache
rm -rf dist build
npm cache clean --force
```

#### Task 3: 修正版強制適用
```bash
# 依存関係再インストール
cd frontend && npm ci
cd ../backend && npm ci

# 修正版ファイルの確実適用
# - 修正されたファイルの内容確認
# - 実際のビルドプロセスでの反映確認
```

#### Task 4: エラー根本原因特定・修正
```javascript
// バックエンドログ確認
console.log("=== SERVER ERROR DEBUGGING ===");

// DocumentParser呼び出し確認
// ファイルアップロード処理の詳細トレース
// API レスポンス形式の確認
```

#### Task 5: 完全動作テスト
```bash
# 修正版システム起動
cd backend && npm run dev &
cd frontend && npm start &

# 動作確認
curl http://localhost:5000/health
curl http://localhost:5000/api/templates
```

---

## 📁 重要ファイル情報

### プロジェクト構造
```
C:\Users\a-odajima\Desktop\claudecode\report-formatter-pro\
├── backend\
│   ├── src\
│   │   ├── server.ts          ← 修正済み（要確認）
│   │   └── services\
│   │       ├── documentParser.ts
│   │       ├── layoutEngine.ts
│   │       └── pdfGenerator.ts
├── frontend\
│   ├── src\
│   │   ├── App.tsx           ← 修正済み（要確認）
│   │   └── components\
│   │       └── FileUploader.tsx ← 修正済み（要確認）
└── test-sample.txt           ← テスト用ファイル
```

### GitHub状況
- **リポジトリ**: https://github.com/amijadoamijado/report-formatter-pro
- **最新コミット**: 修正前の状態
- **必要**: 修正版コミット・プッシュ

---

## 🔍 詳細エラー情報

### Playwrightで確認されたエラー
```
HTTP 500: Internal Server Error
Error: Conversion failed
JSON Parse Error: Unexpected token 'T'
Rate limiting: HTTP 429 (解決済み)
```

### 期待される動作
```
✅ ファイルアップロード成功
✅ DocumentParser正常実行
✅ PDF生成・ダウンロード成功
✅ エラーログクリーン
```

---

## 📊 成功基準

### 必須達成項目
- [ ] ファイルアップロード時にエラーなし
- [ ] 「Conversion failed」エラー解消
- [ ] HTTP 500エラー解消
- [ ] test-sample.txtの正常処理
- [ ] PDF生成・ダウンロード成功

### 品質基準
- [ ] TypeScript エラーなし
- [ ] ESLint 警告なし
- [ ] Console.log にエラーなし
- [ ] 全APIエンドポイント正常動作

---

## 🚀 最終目標

**ReportFormatter Pro完全動作システム**
1. ファイルアップロード → 文書解析 → PDF生成 → ダウンロード
2. エラーなし・プロフェッショナル品質
3. 企業グレードの信頼性

---

## 📝 作業報告形式

### 進捗報告
```markdown
## [時刻] 作業状況報告
### 実行内容
- [具体的作業]

### 発見事項
- [問題・発見]

### 次のアクション
- [次の作業]
```

### 完了報告
```markdown
## RF001 修正完了報告
### 修正内容
- [修正詳細]

### テスト結果
- [動作確認結果]

### GitHub状況
- [コミット状況]
```

---

## ⚠️ 重要な注意事項

1. **バックアップ**: 重要ファイルの変更前バックアップ
2. **段階的確認**: 各修正後の動作確認
3. **ログ記録**: 詳細なエラーログ・修正ログ保持
4. **GitHub同期**: 修正完了時の確実なコミット・プッシュ

---

**この指示書に従い、RF001システムを完全動作状態にしてください。**