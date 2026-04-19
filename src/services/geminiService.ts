import { GoogleGenAI } from "@google/genai";
import { LessonPlan, AIConfig } from '../types';

export const SYSTEM_PROMPT_PLAN = `
Bạn là chuyên gia giáo dục. Nhiệm vụ: Soạn Kế hoạch bài dạy (Giáo án) tích hợp Giáo dục AI.
**QUAN TRỌNG NHẤT**: Phải tuân thủ tuyệt đối cấu trúc và phong cách của MẪU THAM KHẢO.

YÊU CẦU CẤU TRÚC JSON ĐẦU RA:
{
  "topic": "Tên bài học",
  "duration": "Số tiết",
  "gdpt_requirements": ["Yêu cầu 1 theo CT 2018", "Yêu cầu 2..."],
  "objectives": {
    "subject_competence": ["1. Về năng lực môn học..."],
    "qualities": ["2. Về phẩm chất..."],
    "ai_integration": ["*Tích hợp giáo dục AI...", "(Ghi rõ mã NLa, NLb, NLc, NLd)"]
  },
  "equipment": {
    "teacher": ["- GV: ..."],
    "student": ["- HS: ..."],
    "ai_tools_mode": {
       "no_ai": "Hướng 1: Không sử dụng AI thật (phổ biến)... [Mô tả cách dạy không cần máy]",
       "with_ai": "Hướng 2: Có sử dụng AI thật (khi đủ điều kiện)... [Mô tả công cụ và cách dùng]"
    }
  },
  "procedure": [
    {
      "name": "Hoạt động 1: [Tên hoạt động]",
      "time": "[Số] phút",
      "objective": "Mục tiêu: ... (Tích hợp NLa/NLb/NLc...)",
      "content": "Nội dung: ... ",
      "product": "Sản phẩm: ...",
      "organization": "Tổ chức thực hiện: 1. Giao nhiệm vụ... 2. Thực hiện... 3. Báo cáo... 4. Kết luận..."
    }
  ],
  "rubric": [],
  "appendices": [
    { "title": "Phiếu học tập/Phụ lục", "content": "Nội dung phiếu bài tập, câu hỏi..." }
  ]
}

LƯU Ý:
1. **Phong cách viết**: Dùng từ ngữ sư phạm, rõ ràng.
2. **Nội dung AI**: Phải có "Hướng 1" (không dùng máy) và "Hướng 2" (dùng máy).
`;

function repairTruncatedJson(jsonString: string): string {
  let s = jsonString.trim();

  s = s.replace(/,\s*$/, '');

  let braces = 0, brackets = 0, inString = false, escaped = false;

  for (const ch of s) {
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') braces++;
    if (ch === '}') braces--;
    if (ch === '[') brackets++;
    if (ch === ']') brackets--;
  }

  if (inString) s += '"';

  s = s.replace(/,\s*$/, '');

  while (brackets > 0) { s += ']'; brackets--; }
  while (braces > 0) { s += '}'; braces--; }

  return s;
}

function sanitizeJsonString(text: string): string {
  let result = text;

  result = result.replace(/[\x00-\x1F\x7F]/g, (match) => {
    switch (match) {
      case '\n': return '\\n';
      case '\r': return '\\r';
      case '\t': return '\\t';
      default: return '';
    }
  });

  return result;
}

export async function generateLessonPlan(
  config: AIConfig
): Promise<LessonPlan> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing Gemini API Key");

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
    Môn học: ${config.subject}
    Khối lớp: ${config.grade}
    CHỦ ĐỀ BÀI DẠY: "${config.topicInput}"
    
    Yêu cầu:
    1. Soạn giáo án CHI TIẾT.
    2. Đầy đủ các mục: Yêu cầu cần đạt GDPT 2018, Mục tiêu (tích hợp AI), Thiết bị (2 hướng), Tiến trình (Mục tiêu, Nội dung, Sản phẩm, Tổ chức).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT_PLAN,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      }
    });

    if (response.text) {
      let jsonString = response.text.trim();

      const markdownMatch = jsonString.match(/```json\s*([\s\S]*?)\s*```/);
      if (markdownMatch) {
        jsonString = markdownMatch[1];
      } else {
        jsonString = jsonString.replace(/^```(json)?/, '').replace(/```$/, '');
      }

      jsonString = jsonString.trim();

      let raw: any;
      try {
        raw = JSON.parse(jsonString);
      } catch (firstError) {
        try {
          let repaired = sanitizeJsonString(jsonString);
          repaired = repairTruncatedJson(repaired);
          raw = JSON.parse(repaired);
        } catch (repairError) {
          throw new Error(`AI trả về JSON không hợp lệ: ${(firstError as Error).message}`);
        }
      }

      return {
        topic: raw.topic || config.topicInput,
        duration: raw.duration || '45 phút',
        gdpt_requirements: Array.isArray(raw.gdpt_requirements) ? raw.gdpt_requirements : [],

        objectives: {
          subject_competence: Array.isArray(raw.objectives?.subject_competence) ? raw.objectives.subject_competence : [],
          qualities: Array.isArray(raw.objectives?.qualities) ? raw.objectives.qualities : [],
          ai_integration: Array.isArray(raw.objectives?.ai_integration) ? raw.objectives.ai_integration : []
        },

        equipment: {
          teacher: Array.isArray(raw.equipment?.teacher) ? raw.equipment.teacher : [],
          student: Array.isArray(raw.equipment?.student) ? raw.equipment.student : [],
          ai_tools_mode: {
            no_ai: raw.equipment?.ai_tools_mode?.no_ai || "Hướng 1: Không sử dụng AI thật...",
            with_ai: raw.equipment?.ai_tools_mode?.with_ai || "Hướng 2: Có sử dụng AI thật..."
          }
        },

        procedure: Array.isArray(raw.procedure) ? raw.procedure.map((p: any) => ({
          name: p.name || 'Hoạt động',
          time: p.time || '',
          objective: p.objective || '',
          content: p.content || '',
          product: p.product || '',
          organization: p.organization || ''
        })) : [],

        rubric: Array.isArray(raw.rubric) ? raw.rubric : [],
        appendices: Array.isArray(raw.appendices) ? raw.appendices : []
      };
    }

    throw new Error("AI không trả về dữ liệu.");
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
}
