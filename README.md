# ReportFormatter Pro

**プロコンサルティング会社レベルのレポート自動レイアウト変換システム**

## 📋 プロジェクト概要

完成済み文章を McKinsey/BCG 標準のプロフェッショナルなレイアウト・タイポグラフィに瞬時に変換する単機能特化システム

### 🎯 主要機能
- Word/PDF/テキストファイルの読み込み
- プロコンサル標準レイアウト自動適用
- 高品質PDF出力（A4・300DPI）
- シンプルなワンクリック変換

## 🏗️ 技術スタック

### フロントエンド
- React 18 + TypeScript
- Vite（開発環境）
- Tailwind CSS（最小限スタイリング）

### バックエンド
- Node.js + Express
- TypeScript
- Puppeteer（PDF生成）
- mammoth.js（Word文書解析）
- pdf-parse（PDF文書解析）

## 📁 プロジェクト構成

```
report-formatter-pro/
├── frontend/                 # React フロントエンド
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── backend/                  # Node.js バックエンド
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── styles/                   # プロフェッショナルレイアウトCSS
└── tests/                    # テスト・検証ツール
```

## 🚀 開発方針

### ユニット分割開発
- **12ユニット構成**で段階的実装
- 各ユニット完成時に動作確認・品質検証
- エラーゼロまで次のユニットに進まない

### 品質保証
- McKinsey/BCGレベルの見た目品質
- 300DPI高品質PDF出力
- 包括的エラーハンドリング

## 📊 開発進捗

### ✅ 完了済み
- [x] Phase 1: 仕様策定フェーズ
- [x] Phase 2: 計画・準備フェーズ  
- [x] ユニット1: プロジェクト基盤作成

### 🔄 進行中
- [ ] ユニット2: ファイルアップロード基盤

### 📋 今後の予定
- [ ] ユニット3-12: 段階的機能実装
- [ ] 品質チェック・最終統合

## 💾 開発環境

### ローカル保存先
```
C:\Users\a-odajima\Desktop\claudecode\report-formatter-pro\
```

### 開発ツール
- **MCP Claude Code**: ローカルファイル操作
- **MCP GitHub**: バージョン管理
- **MCP分析ツール**: コード検証・テスト

## 📈 品質基準

- フォント: 游ゴシック系（24pt/18pt/14pt/11pt階層）
- 余白: 上下2.5cm、左右2cm
- 行間: 1.15倍
- PDF品質: A4・300DPI・フォント埋め込み

---

**開発開始**: 2025/06/15  
**目標**: プロフェッショナル品質の自動レイアウト変換システム