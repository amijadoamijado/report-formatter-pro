import mammoth from 'mammoth';
import fs from 'fs-extra';
import pdfParse from 'pdf-parse';
import path from 'path';

export interface DocumentContent {
  text: string;
  originalFilename: string;
  fileType: string;
  wordCount: number;
  extractedAt: string;
}

export interface ParseResult {
  success: boolean;
  content?: DocumentContent;
  error?: string;
}

export class DocumentParser {
  
  /**
   * ファイルタイプに応じて適切な解析メソッドを選択
   */
  public async parseDocument(filePath: string, originalFilename: string, mimetype: string): Promise<ParseResult> {
    try {
      console.log(`📄 文書解析開始: ${originalFilename} (${mimetype})`);
      
      let text: string;
      
      switch (mimetype) {
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          text = await this.parseWordDocument(filePath);
          break;
          
        case 'application/pdf':
          text = await this.parsePdfDocument(filePath);
          break;
          
        case 'text/plain':
          text = await this.parseTextDocument(filePath);
          break;
          
        default:
          return {
            success: false,
            error: `サポートされていないファイル形式: ${mimetype}`
          };
      }
      
      // テキストの基本的なクリーニング
      const cleanedText = this.cleanText(text);
      
      const content: DocumentContent = {
        text: cleanedText,
        originalFilename,
        fileType: mimetype,
        wordCount: this.countWords(cleanedText),
        extractedAt: new Date().toISOString()
      };
      
      console.log(`✅ 解析完了: ${content.wordCount}語 抽出`);
      
      return {
        success: true,
        content
      };
      
    } catch (error) {
      console.error('❌ 文書解析エラー:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '不明なエラーが発生しました'
      };
    }
  }
  
  /**
   * Word文書(.docx/.doc)の解析
   */
  private async parseWordDocument(filePath: string): Promise<string> {
    try {
      const buffer = await fs.readFile(filePath);
      const result = await mammoth.extractRawText({ buffer });
      
      if (result.messages.length > 0) {
        console.warn('⚠️ Word解析警告:', result.messages);
      }
      
      if (!result.value) {
        throw new Error('Word文書からテキストを抽出できませんでした');
      }
      
      return result.value;
      
    } catch (error) {
      throw new Error(`Word文書解析エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * PDF文書の解析
   */
  private async parsePdfDocument(filePath: string): Promise<string> {
    try {
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);
      
      if (!data.text) {
        throw new Error('PDF文書からテキストを抽出できませんでした');
      }
      
      console.log(`📊 PDF情報: ${data.numpages}ページ`);
      
      return data.text;
      
    } catch (error) {
      throw new Error(`PDF解析エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * プレーンテキストファイルの解析
   */
  private async parseTextDocument(filePath: string): Promise<string> {
    try {
      const text = await fs.readFile(filePath, 'utf-8');
      
      if (!text) {
        throw new Error('テキストファイルが空です');
      }
      
      return text;
      
    } catch (error) {
      throw new Error(`テキストファイル読み込みエラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * テキストのクリーニング処理
   */
  private cleanText(text: string): string {
    return text
      // 連続する空白を単一スペースに統一
      .replace(/\s+/g, ' ')
      // 連続する改行を最大2つまでに制限
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      // 先頭末尾の空白を削除
      .trim();
  }
  
  /**
   * 単語数をカウント（日本語対応）
   */
  private countWords(text: string): number {
    // 日本語・英語混在対応の単語カウント
    const japaneseChars = text.replace(/[a-zA-Z0-9\s\p{P}]/gu, '').length;
    const englishWords = text.match(/[a-zA-Z]+/g)?.length || 0;
    
    return japaneseChars + englishWords;
  }
}