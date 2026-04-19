import { OCRResult } from '../types';

export const uploadToGAS = async (file: File, endpoint: string): Promise<OCRResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Raw = reader.result as string;
        
        const payload = {
          action: 'ocr',
          base64Data: base64Raw, 
          fileName: file.name,
          useGemini: false, 
          returnDocx: false 
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'text/plain', 
          },
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          if (data.ocrResult) {
             resolve(data.ocrResult as OCRResult);
          } else {
             resolve(data as OCRResult);
          }
        } else {
          const errMsg = data.error || (data.result === 'error' ? data.message : "OCR failed on backend");
          reject(new Error(errMsg));
        }
      } catch (error: any) {
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            reject(new Error('Failed to fetch: Không thể kết nối. Vui lòng kiểm tra lại URL Script hoặc quyền truy cập (Anyone).'));
        } else {
            reject(error);
        }
      }
    };
    reader.onerror = (error) => reject(new Error("Lỗi đọc file: " + error));
  });
};
