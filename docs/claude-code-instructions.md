# RF001 Claude Code完全自己完結型実装指示書【WSL環境対応】

## 🚨 重要：WSL環境制約
- ❌ **mem0利用不可**：WSL環境のためmem0にアクセスできません
- ✅ **GitHub・ローカルファイルのみ利用**：この指示書で完全な情報を提供

---

## 📋 現在の状況（Playwright診断結果）

### 確認済み状況
- **バックエンド**: ✅ 正常稼働中（localhost:5000、766時間稼働）
- **フロントエンド**: ⚠️ 表示されるが、修正版コード未反映
- **エラー**: ❌ 「Conversion failed」HTTP 500エラー継続

### 根本問題
```
❌ 修正版ファイル作成済みだが、実際の稼働環境に反映されていない
❌ 複雑なキャッシュ・ビルド・バージョン管理問題
❌ 動作中アプリケーション ≠ ローカル修正ファイル
```

---

## 🔧 GitHub保存済み修正版ファイル

### 1. バックエンド修正版
**GitHub場所**: `backend/src/server-fixed.ts`
**適用先**: `backend/src/server.ts`

**主要修正点**:
- DocumentParser呼び出しにmimetypeパラメータ追加
- 存在しないcreateSampleDocumentメソッド削除
- サンプルドキュメント生成を実際のオブジェクトに変更
- レスポンス処理のプロパティアクセスエラー修正

### 2. フロントエンド修正版
**GitHub場所**: `frontend/src/App-fixed.tsx`
**適用先**: `frontend/src/App.tsx`

**主要修正点**:
- エンドポイント修正：`localhost:3001` → `localhost:5000`
- FormDataフィールド名修正：`'file'` → `'document'`

### 3. FileUploader修正版
**GitHub場所**: `frontend/src/components/FileUploader-fixed.tsx`
**適用先**: `frontend/src/components/FileUploader.tsx`

**主要修正点**:
- APIエンドポイント修正：`/api/upload` → `http://localhost:5000/api/upload`
- FormDataフィールド名修正：`'file'` → `'document'`

---

## 🎯 Claude Code実装タスク

### Task 1: プロジェクト状況確認
```bash
# プロジェクトディレクトリ移動
cd /mnt/c/Users/a-odajima/Desktop/claudecode/report-formatter-pro

# 現在のファイル構造確認
ls -la backend/src/
ls -la frontend/src/
ls -la frontend/src/components/

# 現在稼働中プロセス確認
ps aux | grep node
netstat -tulpn | grep :3001
netstat -tulpn | grep :5000
```

### Task 2: 修正版ファイル適用
```bash
# GitHubから修正版ファイルをダウンロード・適用
curl -o backend/src/server.ts https://raw.githubusercontent.com/amijadoamijado/report-formatter-pro/main/backend/src/server-fixed.ts

curl -o frontend/src/App.tsx https://raw.githubusercontent.com/amijadoamijado/report-formatter-pro/main/frontend/src/App-fixed.tsx

curl -o frontend/src/components/FileUploader.tsx https://raw.githubusercontent.com/amijadoamijado/report-formatter-pro/main/frontend/src/components/FileUploader-fixed.tsx

# ファイル適用確認
echo "=== 修正版ファイル適用確認 ==="
head -20 backend/src/server.ts
head -10 frontend/src/App.tsx
head -10 frontend/src/components/FileUploader.tsx
```

### Task 3: 完全クリーンビルド実行
```bash
# 全プロセス強制終了
pkill -f "node.*3001" 2>/dev/null
pkill -f "node.*5000" 2>/dev/null
sleep 3

# キャッシュ・ビルド完全削除
cd frontend
rm -rf node_modules/.cache build dist .next 2>/dev/null
npm cache clean --force

cd ../backend
rm -rf node_modules/.cache build dist 2>/dev/null
npm cache clean --force

# 依存関係再インストール
cd ../frontend && npm ci
cd ../backend && npm ci
```

### Task 4: 修正版システム起動
```bash
# バックエンド起動
cd backend
npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# 起動確認（8秒待機）
sleep 8
curl -s http://localhost:5000/health | jq .

# フロントエンド起動
cd ../frontend
npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# 起動確認（30秒待機）
sleep 30
curl -s http://localhost:3001 | head -10
```

### Task 5: 動作確認テスト
```bash
# APIエンドポイントテスト
echo "=== API動作確認 ==="
curl -s http://localhost:5000/health | jq .status
curl -s http://localhost:5000/api/templates | jq .success

# test-sample.txtでアップロードテスト
echo "=== ファイルアップロードテスト ==="
if [ -f "test-sample.txt" ]; then
    curl -X POST -F "document=@test-sample.txt" http://localhost:5000/api/upload
else
    echo "test-sample.txt作成中..."
    echo "ReportFormatter Pro テスト用サンプルドキュメント

## エグゼクティブサマリー
本レポートは、ReportFormatter Proシステムのテスト用サンプルです。

## 主要な発見事項
1. ファイルアップロード機能の検証
2. 文書解析エンジンの動作確認
3. PDF生成機能のテスト

## 結論
システムの動作確認が完了しました。" > test-sample.txt
    
    curl -X POST -F "document=@test-sample.txt" http://localhost:5000/api/upload
fi
```

---

## 📊 期待される修正後の動作

### 成功パターン
```json
// アップロード成功レスポンス
{
  "success": true,
  "message": "文書解析が完了しました",
  "document": {
    "id": "1234567890",
    "title": "test-sample.txt",
    "wordCount": 150,
    "extractedAt": "2025-06-15T20:30:00.000Z"
  }
}
```

### エラー解消確認
- ❌ 「Conversion failed」→ ✅ 正常処理
- ❌ HTTP 500エラー → ✅ HTTP 200レスポンス
- ❌ JSON Parse Error → ✅ 正常JSONレスポンス

---

## 🔍 トラブルシューティング

### 問題1: ファイル適用されない
```bash
# ファイル内容確認
grep -n "parseDocument.*mimetype" backend/src/server.ts
grep -n "localhost:5000" frontend/src/App.tsx
grep -n "document.*formData" frontend/src/components/FileUploader.tsx
```

### 問題2: 起動エラー
```bash
# ログ確認
tail -50 ~/.npm/_logs/*.log
ps aux | grep node
```

### 問題3: ポート競合
```bash
# ポート使用状況確認
sudo netstat -tulpn | grep :3001
sudo netstat -tulpn | grep :5000

# 必要に応じてプロセス終了
sudo kill -9 $(lsof -ti:3001)
sudo kill -9 $(lsof -ti:5000)
```

---

## 📋 成功基準・検証方法

### 必須達成項目
- [ ] ファイルアップロード時にエラーなし
- [ ] 「Conversion failed」エラー解消
- [ ] HTTP 500エラー解消
- [ ] test-sample.txtの正常処理
- [ ] JSON正常レスポンス

### 検証コマンド
```bash
# 1. ヘルスチェック
curl -s http://localhost:5000/health | jq .status

# 2. テンプレート取得
curl -s http://localhost:5000/api/templates | jq .success

# 3. ファイルアップロード
curl -X POST -F "document=@test-sample.txt" http://localhost:5000/api/upload | jq .

# 4. フロントエンド表示確認
curl -s http://localhost:3001 | grep "ReportFormatter Pro"
```

---

## 🚀 最終目標

**ReportFormatter Pro完全動作システム**
1. ✅ ファイルアップロード → 文書解析 → 成功レスポンス
2. ✅ エラーなし・プロフェッショナル品質
3. ✅ 企業グレードの信頼性

---

## 📝 作業完了報告形式

### 完了報告テンプレート
```markdown
## RF001 修正完了報告

### 実行タスク
- [x] Task 1: プロジェクト状況確認
- [x] Task 2: 修正版ファイル適用
- [x] Task 3: 完全クリーンビルド実行
- [x] Task 4: 修正版システム起動
- [x] Task 5: 動作確認テスト

### 修正結果
- ファイルアップロード: ✅ 成功/❌ 失敗
- エラー解消: ✅ 解消/❌ 継続
- API動作: ✅ 正常/❌ エラー

### テスト結果
```bash
# 実際のテスト結果をここに貼り付け
```

### GitHub更新
- [ ] 修正完了コミット・プッシュ実行
- [ ] 最終動作確認スクリーンショット
```

---

**この指示書の内容で、mem0を使わずにRF001システムを完全動作状態にしてください。**