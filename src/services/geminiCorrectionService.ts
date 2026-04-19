import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor(apiKey: string) {
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  updateKey(apiKey: string) {
    if (apiKey) {
        this.ai = new GoogleGenAI({ apiKey });
    }
  }

  private extractImages(markdown: string): { cleanText: string; imageMap: Map<string, string> } {
    const imageMap = new Map<string, string>();
    let counter = 0;
    
    const cleanText = markdown.replace(/!\[(.*?)\]\((data:image\/[^)]+)\)/g, (match, alt, dataUri) => {
      const placeholder = `{{__IMG_${counter}__}}`;
      imageMap.set(placeholder, match); 
      counter++;
      return placeholder; 
    });

    return { cleanText, imageMap };
  }

  private restoreImages(text: string, imageMap: Map<string, string>): string {
    let restoredText = text;
    imageMap.forEach((originalImageTag, placeholder) => {
      restoredText = restoredText.split(placeholder).join(originalImageTag);
    });
    return restoredText;
  }

  async correctTextStream(text: string, onChunk: (text: string) => void): Promise<string> {
    if (!this.ai) {
        if (process.env.GEMINI_API_KEY) {
             this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        } else {
             throw new Error("API Key not configured");
        }
    }

    const { cleanText, imageMap } = this.extractImages(text);

    const prompt = `
      Bạn là chuyên gia biên tập tiếng Việt. Nhiệm vụ của bạn là sửa lỗi chính tả và ngữ pháp cho văn bản OCR sau đây.
      
      Yêu cầu QUAN TRỌNG:
      1. GIỮ NGUYÊN cấu trúc Markdown (tiêu đề, danh sách, bảng biểu, in đậm, in nghiêng).
      2. GIỮ NGUYÊN các placeholder hình ảnh dạng {{__IMG_x__}}. TUYỆT ĐỐI KHÔNG XOÁ HOẶC SỬA CHÚNG.
      3. GIỮ NGUYÊN các công thức LaTeX (dạng $...$ hoặc $$...$$).
      4. Chỉ sửa các từ bị sai chính tả, dấu câu sai, hoặc ngữ pháp lủng củng do quá trình OCR.
      5. KHÔNG thêm lời dẫn, KHÔNG giải thích. Chỉ trả về văn bản đã sửa.

      Văn bản gốc:
      ${cleanText}
    `;

    try {
      const response = await this.ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.1,
        }
      });

      let fullResponseText = '';
      
      for await (const chunk of response) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullResponseText += chunkText;
          onChunk(chunkText);
        }
      }

      const finalText = this.restoreImages(fullResponseText, imageMap);
      return finalText;

    } catch (error) {
      console.error("Gemini correction error:", error);
      throw error;
    }
  }
}
