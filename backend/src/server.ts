import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { DocumentParser } from './services/documentParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// サービス初期化
const documentParser = new DocumentParser();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// アップロードディレクトリの設定
const uploadsDir = path.join(__dirname, '..', '..', 'backend', 'uploads');

// ファイルアップロード設定
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB制限
  },
  fileFilter: (req, file, cb) => {
    // サポートされるファイル形式をチェック
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('サポートされていないファイル形式です'));
    }
  }
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ファイルアップロード・解析エンドポイント
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルが選択されていません' });
    }

    console.log(`📄 ファイル受信: ${req.file.originalname}`);
    
    // 文書解析実行
    const parseResult = await documentParser.parseDocument(
      req.file.path,
      req.file.originalname,
      req.file.mimetype
    );
    
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: '文書解析に失敗しました',
        details: parseResult.error
      });
    }

    res.json({
      message: 'ファイルアップロード・解析成功',
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
      },
      content: parseResult.content
    });
  } catch (error) {
    console.error('Upload/Parse error:', error);
    res.status(500).json({ error: 'ファイル処理に失敗しました' });
  }
});

// Error handling
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'ファイルサイズが大きすぎます（最大10MB）' });
    }
  }
  
  console.error(error);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📁 Upload directory: ${uploadsDir}`);
});