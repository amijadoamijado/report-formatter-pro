import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { DocumentParser } from './services/documentParser';
import { LayoutEngine, MCKINSEY_TEMPLATE, BCG_TEMPLATE, ACADEMIC_TEMPLATE } from './services/layoutEngine';
import { ProfessionalPdfGenerator } from './services/pdfGenerator';

const app = express();
const PORT = process.env.PORT || 5000;

// サービス初期化
const documentParser = new DocumentParser();
const layoutEngine = new LayoutEngine();
const pdfGenerator = new ProfessionalPdfGenerator();

// アップロードディレクトリ確保
const uploadsDir = path.join(__dirname, 'uploads');
const generatedDir = path.join(__dirname, '../../generated');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// Multer設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.docx', '.doc', '.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('サポートされていないファイル形式です。.docx, .doc, .pdf, .txt ファイルのみ対応しています。'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ヘルスチェック
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ReportFormatter Pro Backend is running',
    timestamp: new Date().toISOString(),
    services: {
      documentParser: 'ready',
      layoutEngine: 'ready',
      pdfGenerator: 'ready'
    }
  });
});

// 利用可能テンプレート一覧
app.get('/api/templates', (req, res) => {
  try {
    const templates = layoutEngine.getAvailableTemplates();
    res.json({
      success: true,
      templates: templates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        previewColor: t.colors.primary
      }))
    });
  } catch (error) {
    console.error('Templates fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'テンプレート情報の取得に失敗しました'
    });
  }
});

// ファイルアップロード＋解析
app.post('/api/upload', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'ファイルがアップロードされていません'
      });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    
    console.log(`📄 解析開始: ${originalName}`);

    // ファイル解析実行
    const parsedDocument = await documentParser.parseDocument(filePath, originalName);
    
    console.log(`✅ 解析完了: ${parsedDocument.metadata.wordCount} words`);

    // アップロードファイル削除（セキュリティのため）
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: '文書解析が完了しました',
      document: {
        id: parsedDocument.id,
        title: parsedDocument.metadata.title,
        wordCount: parsedDocument.metadata.wordCount,
        language: parsedDocument.metadata.language,
        extractedAt: parsedDocument.metadata.extractedAt,
        preview: parsedDocument.elements.slice(0, 3).map(el => ({
          type: el.type,
          content: el.content.substring(0, 100) + (el.content.length > 100 ? '...' : '')
        }))
      }
    });
  } catch (error) {
    console.error('Upload/Parse error:', error);
    
    // アップロードファイル削除（エラー時も実行）
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'ファイルの解析に失敗しました'
    });
  }
});

// レイアウト変換＋PDF生成
app.post('/api/convert', async (req, res) => {
  try {
    const { documentId, templateId } = req.body;

    if (!documentId || !templateId) {
      return res.status(400).json({
        success: false,
        error: 'documentId と templateId が必要です'
      });
    }

    console.log(`🔄 変換開始: Document ${documentId} → Template ${templateId}`);

    // 文書データを取得（実際の実装では、解析済み文書をDBやメモリから取得）
    // 現在は簡易的にサンプルデータを使用
    const sampleDocument = documentParser.createSampleDocument();
    
    // テンプレート取得
    const template = layoutEngine.getTemplate(templateId);
    if (!template) {
      return res.status(400).json({
        success: false,
        error: '指定されたテンプレートが見つかりません'
      });
    }

    // レイアウト適用
    const layoutedDocument = await layoutEngine.applyLayout(sampleDocument, template);
    
    console.log(`📄 レイアウト適用完了: ${layoutedDocument.totalPages} pages`);

    // PDF生成
    const timestamp = Date.now();
    const pdfFileName = `report_${templateId}_${timestamp}.pdf`;
    const pdfFilePath = path.join(generatedDir, pdfFileName);

    await pdfGenerator.generatePdf(layoutedDocument, pdfFilePath);
    
    console.log(`📊 PDF生成完了: ${pdfFileName}`);

    res.json({
      success: true,
      message: 'プロフェッショナルレポートの生成が完了しました',
      result: {
        documentId: layoutedDocument.originalDocument.id,
        templateId: template.id,
        templateName: template.name,
        pages: layoutedDocument.totalPages,
        wordCount: layoutedDocument.metadata.wordCount,
        pdfFileName,
        downloadUrl: `/api/download/${pdfFileName}`,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Convert error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'レポート生成に失敗しました'
    });
  }
});

// PDF ダウンロード
app.get('/api/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(generatedDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'ファイルが見つかりません'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    console.log(`📥 PDF ダウンロード: ${filename}`);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'ファイルのダウンロードに失敗しました'
    });
  }
});

// ステータス情報
app.get('/api/status', (req, res) => {
  const uploadsCount = fs.readdirSync(uploadsDir).length;
  const generatedCount = fs.readdirSync(generatedDir).length;
  
  res.json({ 
    service: 'ReportFormatter Pro',
    version: '1.0.0',
    status: 'running',
    statistics: {
      uploadsDirectory: uploadsCount,
      generatedReports: generatedCount
    },
    templates: layoutEngine.getAvailableTemplates().map(t => t.name),
    uptime: process.uptime()
  });
});

// エラーハンドリングミドルウェア
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server Error:', err.stack);
  
  // Multerエラーの特別処理
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'ファイルサイズが大きすぎます（最大10MB）'
      });
    }
  }
  
  res.status(500).json({ 
    success: false,
    error: 'サーバーエラーが発生しました'
  });
});

// 404 ハンドラ
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'API エンドポイントが見つかりません'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 ReportFormatter Pro Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📄 Templates: http://localhost:${PORT}/api/templates`);
  console.log(`📁 Upload directory: ${uploadsDir}`);
  console.log(`📊 Generated directory: ${generatedDir}`);
});
