import { GoogleGenAI } from '@google/genai';

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash';

const OCR_PROMPT = `Convert this document page to Markdown. Follow ALL rules exactly.

TEXT RULES:
1. Extract ALL text accurately, preserving reading order and hierarchy.
2. CRITICAL: Convert ALL tables to Markdown table format (| col | col |). NEVER use HTML <table> tags.
3. CRITICAL: Use real newlines. NEVER use <br> or <br/> tags.
4. Use # heading levels based on visual prominence.
5. Use - for bullets, 1. 2. 3. for numbered lists.
6. Preserve **bold** and *italic* formatting.
7. Wrap math/formulas in $...$ (inline) or $$...$$ (block).
8. If there are figures, diagrams, or illustrations, write: *(hình vẽ)*
9. Output ONLY the Markdown content — no preamble, no commentary.`;

export interface GeminiOcrPageResult {
  pageNumber: number;
  markdown: string;
  figureCount: number;
  error?: string;
}

export async function ocrPageWithGemini(
  ai: GoogleGenAI,
  base64Image: string,
  onChunk: (text: string) => void
): Promise<{ markdown: string; figureCount: number }> {
  const match = base64Image.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid base64 image format');

  const mimeType = match[1] as 'image/jpeg' | 'image/png' | 'image/webp';
  const data = match[2];

  const tryModel = async (model: string): Promise<string> => {
    const response = await ai.models.generateContentStream({
      model,
      config: { temperature: 0.1 },
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data } },
            { text: OCR_PROMPT },
          ],
        }
      ],
    });
    let fullText = '';
    for await (const chunk of response) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(fullText);
      }
    }
    return fullText;
  };

  let markdown = '';
  try {
    markdown = await tryModel(PRIMARY_MODEL);
  } catch (primaryErr) {
    console.warn(`[GeminiOCR] ${PRIMARY_MODEL} failed, fallback to ${FALLBACK_MODEL}:`, primaryErr);
    markdown = await tryModel(FALLBACK_MODEL);
  }

  const figureCount = (markdown.match(/\*\(hình vẽ\)\*/g) || []).length;

  return { markdown, figureCount };
}

export async function ocrAllPages(
  apiKey: string,
  pageImages: string[],
  callbacks: {
    onPageStart: (pageNum: number) => void;
    onPageChunk: (pageNum: number, text: string) => void;
    onPageDone: (pageNum: number, markdown: string, figureCount: number) => void;
    onPageError: (pageNum: number, error: string) => void;
  }
): Promise<GeminiOcrPageResult[]> {
  const ai = new GoogleGenAI({ apiKey });
  const results: GeminiOcrPageResult[] = [];

  for (let i = 0; i < pageImages.length; i++) {
    const pageNum = i + 1;
    callbacks.onPageStart(pageNum);

    try {
      const { markdown, figureCount } = await ocrPageWithGemini(
        ai,
        pageImages[i],
        (text) => callbacks.onPageChunk(pageNum, text)
      );
      results.push({ pageNumber: pageNum, markdown, figureCount });
      callbacks.onPageDone(pageNum, markdown, figureCount);
    } catch (err: any) {
      const errorMsg = err?.message || 'Unknown error';
      results.push({ pageNumber: pageNum, markdown: '', figureCount: 0, error: errorMsg });
      callbacks.onPageError(pageNum, errorMsg);
    }
  }

  return results;
}

export function combinePageResults(results: GeminiOcrPageResult[]): string {
  return results
    .map((r) => {
      if (r.error) return `\n> ⚠️ **Trang ${r.pageNumber}**: Lỗi — ${r.error}\n`;
      return r.markdown.trim();
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
}
