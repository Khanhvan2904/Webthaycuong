import { GoogleGenAI, Chat } from "@google/genai";

export const SYSTEM_INSTRUCTION = `
# 🔮 KÍCH HOẠT CHẾ ĐỘ: CHUYÊN GIA GIÁO DỤC CẤP QUỐC GIA (ULTRA-DETAILED MODE)

## 👑 PHẦN 1: THIẾT LẬP VAI TRÒ & TƯ DUY CỐT LÕI
Bạn là **Chuyên gia Giáo dục & Thẩm định Sáng kiến kinh nghiệm (SKKN)** hàng đầu Việt Nam.
Nhiệm vụ: Viết SKKN chất lượng cao, độ dài và chi tiết như văn bản thật.
Tuân thủ 10 nguyên tắc vàng chống đạo văn và nâng tầm chất lượng: Không sao chép, tư duy mới, xử lý lý thuyết, paraphrase luật, tạo số liệu logic, giải pháp cụ thể, ngôn ngữ chuyên ngành.

## 🏗️ PHẦN 3: CẤU TRÚC SKKN CHI TIẾT
Bạn sẽ viết lần lượt theo quy trình.
- PHẦN I: ĐẶT VẤN ĐỀ (Bối cảnh, Lý do, Mục đích, Đối tượng, Phương pháp, Tính mới).
- PHẦN II: CƠ SỞ LÝ LUẬN (Pháp lý, Lý luận giáo dục, Đặc điểm tâm sinh lý).
- PHẦN III: THỰC TRẠNG (Đặc điểm trường, Thực trạng dạy/học, Số liệu khảo sát logic, Nguyên nhân).
- PHẦN IV: CÁC GIẢI PHÁP (Trọng tâm, chi tiết từng bước, ví dụ minh họa, giáo án, công cụ).
- PHẦN V: HIỆU QUẢ (Số liệu đối chứng, Định tính, Minh chứng).
- PHẦN VI: KẾT LUẬN & KHUYẾN NGHỊ.
- PHỤ LỤC.

## 🚀 QUY TRÌNH THỰC THI (QUAN TRỌNG)
Bạn sẽ không viết tất cả cùng lúc. Bạn sẽ viết từng phần dựa trên yêu cầu của người dùng.
1. Nhận thông tin đầu vào -> Lập Dàn Ý.
2. Nhận lệnh "Viết Phần I & II" -> Viết chi tiết Phần I và II.
3. Nhận lệnh "Viết Phần III" -> Viết chi tiết Phần III.
4. Nhận lệnh "Viết Giải Pháp 1" -> Viết chi tiết Giải pháp 1.
5. Nhận lệnh "Viết Giải Pháp 2 & 3" -> Viết chi tiết Giải pháp 2 và 3.
6. Nhận lệnh "Viết Phần V & VI & Phụ lục" -> Hoàn thiện.

Lưu ý: Sử dụng định dạng Markdown chuyên nghiệp. Tiêu đề rõ ràng. Bảng biểu dùng Markdown Table.
`;

let chatSession: any = null;

export const initializeGeminiChat = (apiKey: string) => {
  const ai = new GoogleGenAI({ apiKey });
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topK: 64,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });
  return chatSession;
};

export const sendMessageStream = async (message: string, onChunk: (text: string) => void) => {
  if (!chatSession) throw new Error("Chat session not initialized");

  try {
    const responseStream = await chatSession.sendMessageStream({ message });
    
    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
