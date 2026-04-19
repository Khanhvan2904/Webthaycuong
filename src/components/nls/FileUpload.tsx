import React, { useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

const pdfjs = (pdfjsLib as any).default || pdfjsLib;

if (pdfjs && pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

interface FileUploadProps {
  onContentLoad: (content: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onContentLoad }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const readPdf = async (buffer: ArrayBuffer): Promise<string> => {
    try {
      const loadingTask = pdfjs.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .filter((str: string) => str.trim().length > 0)
          .join(' ');

        fullText += `--- Trang ${i} ---\n${pageText}\n\n`;
      }
      return fullText;
    } catch (e) {
      console.error("Error reading PDF", e);
      throw new Error("Không thể đọc file PDF. Vui lòng kiểm tra file.");
    }
  };

  const readDocx = async (buffer: ArrayBuffer): Promise<string> => {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value;
    } catch (e) {
      console.error("Error reading DOCX", e);
      throw new Error("Không thể đọc file Word. Vui lòng đảm bảo file không bị hỏng.");
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      
      if (fileType === 'pdf') {
        const buffer = await file.arrayBuffer();
        const text = await readPdf(buffer);
        onContentLoad(text);
      } else if (fileType === 'docx') {
        const buffer = await file.arrayBuffer();
        const text = await readDocx(buffer);
        onContentLoad(text);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result;
          if (typeof text === 'string') {
            onContentLoad(text);
          }
          setIsProcessing(false);
        };
        reader.onerror = () => setIsProcessing(false);
        reader.readAsText(file);
        return; 
      }
    } catch (error: any) {
      alert(error.message || "Lỗi khi đọc file. Vui lòng thử lại.");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".txt,.md,.docx,.pdf"
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="px-5 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xử lý...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Tải lên file (Word/PDF)
          </>
        )}
      </button>
      <div className="flex flex-col">
         <span className="text-xs text-slate-500 font-semibold">Hỗ trợ định dạng:</span>
         <span className="text-xs text-slate-400">.docx (Word), .pdf (Văn bản)</span>
      </div>
    </div>
  );
};
