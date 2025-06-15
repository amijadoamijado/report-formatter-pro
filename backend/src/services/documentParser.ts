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
  structure?: DocumentStructure;
  metadata?: DocumentMetadata;
}

export interface DocumentStructure {
  headings: Heading[];
  paragraphs: string[];
  lists: List[];
  tables?: string[][];
}

export interface Heading {
  level: number;
  text: string;
  position: number;
}

export interface List {
  type: 'bullet' | 'numbered';
  items: string[];
  position: number;
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  createdDate?: string;
  modifiedDate?: string;
  pageCount?: number;
  language?: string;
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
      
      let parseResult: { text: string; metadata: DocumentMetadata; structure: DocumentStructure };
      
      switch (mimetype) {
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          parseResult = await this.parseWordDocument(filePath);
          break;
          
        case 'application/pdf':
          parseResult = await this.parsePdfDocument(filePath);
          break;
          
        case 'text/plain':
          parseResult = await this.parseTextDocument(filePath);
          break;
          
        default:
          return {
            success: false,
            error: `サポートされていないファイル形式: ${mimetype}`
          };
      }
      
      // テキストの基本的なクリーニング
      const cleanedText = this.cleanText(parseResult.text);
      
      const content: DocumentContent = {
        text: cleanedText,
        originalFilename,
        fileType: mimetype,
        wordCount: this.countWords(cleanedText),
        extractedAt: new Date().toISOString(),
        structure: parseResult.structure,
        metadata: parseResult.metadata
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
   * Word文書(.docx/.doc)の解析（強化版）
   */
  private async parseWordDocument(filePath: string): Promise<{ text: string; metadata: DocumentMetadata; structure: DocumentStructure }> {
    try {
      const buffer = await fs.readFile(filePath);
      
      // HTML形式で抽出（構造情報保持）
      const htmlResult = await mammoth.convertToHtml({ buffer }, {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='見出し 1'] => h1:fresh",
          "p[style-name='見出し 2'] => h2:fresh",
          "p[style-name='見出し 3'] => h3:fresh"
        ],
        transformDocument: mammoth.transforms.paragraph(function(paragraph) {
          return paragraph;
        })
      });
      
      // プレーンテキストも取得
      const textResult = await mammoth.extractRawText({ buffer });
      
      if (htmlResult.messages.length > 0) {
        console.warn('⚠️ Word解析警告:', htmlResult.messages);
      }
      
      if (!textResult.value) {
        throw new Error('Word文書からテキストを抽出できませんでした');
      }
      
      // HTMLから構造情報を解析
      const structure = this.parseHtmlStructure(htmlResult.value);
      
      // メタデータを抽出（基本的な推測）
      const metadata: DocumentMetadata = {
        title: this.extractTitleFromText(textResult.value),
        language: this.detectLanguage(textResult.value)
      };
      
      return {
        text: textResult.value,
        metadata,
        structure
      };
      
    } catch (error) {
      throw new Error(`Word文書解析エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * PDF文書の解析（強化版）
   */
  private async parsePdfDocument(filePath: string): Promise<{ text: string; metadata: DocumentMetadata; structure: DocumentStructure }> {
    try {
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer, {
        // PDF解析オプションを最適化
        max: 0, // ページ数制限なし
        version: 'v1.10.100' // 精度向上
      });
      
      if (!data.text) {
        throw new Error('PDF文書からテキストを抽出できませんでした');
      }
      
      console.log(`📊 PDF情報: ${data.numpages}ページ`);
      
      // PDF固有のテキストクリーニング
      const cleanedText = this.cleanPdfText(data.text);
      
      // メタデータを抽出
      const metadata: DocumentMetadata = {
        title: data.info?.Title || this.extractTitleFromText(cleanedText),
        author: data.info?.Author,
        createdDate: data.info?.CreationDate,
        modifiedDate: data.info?.ModDate,
        pageCount: data.numpages,
        language: this.detectLanguage(cleanedText)
      };
      
      // 構造情報を解析（PDFの場合はテキストベース）
      const structure = this.parseTextStructure(cleanedText);
      
      return {
        text: cleanedText,
        metadata,
        structure
      };
      
    } catch (error) {
      throw new Error(`PDF解析エラー: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * プレーンテキストファイルの解析（強化版）
   */
  private async parseTextDocument(filePath: string): Promise<{ text: string; metadata: DocumentMetadata; structure: DocumentStructure }> {
    try {
      const text = await fs.readFile(filePath, 'utf-8');
      
      if (!text) {
        throw new Error('テキストファイルが空です');
      }
      
      // メタデータを抽出
      const metadata: DocumentMetadata = {
        title: this.extractTitleFromText(text),
        language: this.detectLanguage(text)
      };
      
      // 構造情報を解析
      const structure = this.parseTextStructure(text);
      
      return {
        text,
        metadata,
        structure
      };
      
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

  /**
   * HTMLから文書構造を解析
   */
  private parseHtmlStructure(html: string): DocumentStructure {
    const headings: Heading[] = [];
    const paragraphs: string[] = [];
    const lists: List[] = [];
    
    // 簡単なHTMLパーシング（正規表現使用）
    
    // 見出しを抽出
    const headingMatches = html.matchAll(/<h([1-6])[^>]*>([^<]+)<\/h[1-6]>/gi);
    let position = 0;
    for (const match of headingMatches) {
      headings.push({
        level: parseInt(match[1]),
        text: match[2].trim(),
        position: position++
      });
    }
    
    // 段落を抽出
    const paragraphMatches = html.matchAll(/<p[^>]*>([^<]+)<\/p>/gi);
    for (const match of paragraphMatches) {
      const text = match[1].trim();
      if (text.length > 0) {
        paragraphs.push(text);
      }
    }
    
    // リストを抽出
    const ulMatches = html.matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/gi);
    for (const match of ulMatches) {
      const items = this.extractListItems(match[1]);
      if (items.length > 0) {
        lists.push({
          type: 'bullet',
          items,
          position: position++
        });
      }
    }
    
    const olMatches = html.matchAll(/<ol[^>]*>([\s\S]*?)<\/ol>/gi);
    for (const match of olMatches) {
      const items = this.extractListItems(match[1]);
      if (items.length > 0) {
        lists.push({
          type: 'numbered',
          items,
          position: position++
        });
      }
    }
    
    return { headings, paragraphs, lists };
  }
  
  /**
   * テキストから文書構造を解析
   */
  private parseTextStructure(text: string): DocumentStructure {
    const lines = text.split('\n');
    const headings: Heading[] = [];
    const paragraphs: string[] = [];
    const lists: List[] = [];
    
    let currentList: { type: 'bullet' | 'numbered'; items: string[] } | null = null;
    let position = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // マークダウン形式の見出しを検出
      const mdHeadingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (mdHeadingMatch) {
        headings.push({
          level: mdHeadingMatch[1].length,
          text: mdHeadingMatch[2],
          position: position++
        });
        continue;
      }
      
      // ブレットリストを検出
      const bulletMatch = trimmedLine.match(/^[-\u2022\*]\s+(.+)$/);
      if (bulletMatch) {
        if (!currentList || currentList.type !== 'bullet') {
          if (currentList) {
            lists.push({ ...currentList, position: position++ });
          }
          currentList = { type: 'bullet', items: [] };
        }
        currentList.items.push(bulletMatch[1]);
        continue;
      }
      
      // 番号付きリストを検出
      const numberedMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (numberedMatch) {
        if (!currentList || currentList.type !== 'numbered') {
          if (currentList) {
            lists.push({ ...currentList, position: position++ });
          }
          currentList = { type: 'numbered', items: [] };
        }
        currentList.items.push(numberedMatch[1]);
        continue;
      }
      
      // 現在のリストを終了
      if (currentList) {
        lists.push({ ...currentList, position: position++ });
        currentList = null;
      }
      
      // 通常の段落
      if (trimmedLine.length > 10) { // 短すぎる行をフィルタリング
        paragraphs.push(trimmedLine);
      }
    }
    
    // 最後のリストを処理
    if (currentList) {
      lists.push({ ...currentList, position: position++ });
    }
    
    return { headings, paragraphs, lists };
  }
  
  /**
   * リストアイテムを抽出
   */
  private extractListItems(listHtml: string): string[] {
    const items: string[] = [];
    const itemMatches = listHtml.matchAll(/<li[^>]*>([^<]+)<\/li>/gi);
    for (const match of itemMatches) {
      const text = match[1].trim();
      if (text.length > 0) {
        items.push(text);
      }
    }
    return items;
  }
  
  /**
   * テキストからタイトルを抽出
   */
  private extractTitleFromText(text: string): string {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) return 'Untitled Document';
    
    // 最初の空でない行をタイトルとして使用
    const firstLine = lines[0];
    
    // マークダウン形式のヘッダをクリーンアップ
    const cleanTitle = firstLine.replace(/^#+\s*/, '').trim();
    
    // タイトルが长すぎる場合は短縮
    return cleanTitle.length > 100 ? cleanTitle.substring(0, 100) + '...' : cleanTitle;
  }
  
  /**
   * 言語を検出
   */
  private detectLanguage(text: string): string {
    // 簡単な言語検出（日本語、英語）
    const japaneseCharCount = (text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []).length;
    const totalCharCount = text.replace(/\s/g, '').length;
    
    if (japaneseCharCount > totalCharCount * 0.1) {
      return 'ja';
    } else {
      return 'en';
    }
  }
  
  /**
   * PDFテキストのクリーニング
   */
  private cleanPdfText(text: string): string {
    return text
      // ページ号を除去
      .replace(/\n\s*\d+\s*\n/g, '\n')
      // ヘッダー・フッターらしき繰り返しを除去
      .replace(/(.{10,})\n[\s\S]*?\1/g, '$1\n')
      // 連続するスペースを整理
      .replace(/\s+/g, ' ')
      // 連続する改行を整理
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }
}