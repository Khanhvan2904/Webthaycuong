import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, ArrowRight, Wand2, Download, AlertCircle, CheckCircle2, Sparkles, Image as ImageIcon, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { OCRResult, AppState } from '../types';
import { uploadToGAS } from '../services/gasOcrService';
import { GeminiService } from '../services/geminiCorrectionService';

// ✅ THÊM IMPORT
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const DEPLOYED_GAS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzJWrbPV_IQ2eGFx6hUYo6ZBaSPkMg5FkggTks_C8nZG-8CvRCXXrOVvqOv4G8ixoYi/exec';

export const GasOcrTab: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [file, setFile] = useState<File | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [correctedText, setCorrectedText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const geminiServiceRef = useRef<GeminiService>(
    new GeminiService(process.env.GEMINI_API_KEY || '')
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setState(AppState.IDLE);
      setOcrResult(null);
      setCorrectedText('');
      setErrorMsg('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setState(AppState.UPLOADING_OCR);
    setErrorMsg('');
    try {
      const result = await uploadToGAS(file, DEPLOYED_GAS_SCRIPT_URL);
      setOcrResult(result);
      setState(AppState.OCR_COMPLETE);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi khi kết nối tới máy chủ OCR.');
      setState(AppState.ERROR);
    }
  };

  const handleCorrection = async () => {
    if (!ocrResult?.allMarkdownDataUri) return;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      setErrorMsg('Chưa tìm thấy Gemini API Key. Vui lòng cấu hình.');
      return;
    }
    setState(AppState.CORRECTING);
    setCorrectedText('');
    try {
      geminiServiceRef.current.updateKey(apiKey);
      const finalRestoredText = await geminiServiceRef.current.correctTextStream(
        ocrResult.allMarkdownDataUri,
        (chunk) => setCorrectedText((prev) => prev + chunk)
      );
      setCorrectedText(finalRestoredText);
      setState(AppState.OCR_COMPLETE);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Lỗi khi xử lý AI.');
      setState(AppState.ERROR);
    }
  };

  const handleDownloadMarkdown = () => {
    const textToSave = correctedText || ocrResult?.allMarkdownDataUri || '';
    if (!textToSave) return;
    const blob = new Blob([textToSave], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (file?.name.replace('.pdf', '') || 'document') + '_converted.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ✅ THÊM HÀM DOCX
  const handleDownloadDocx = async () => {
    const textToSave = correctedText || ocrResult?.allMarkdownDataUri || '';
    if (!textToSave) return;

    const lines = textToSave.split('\n');

    const paragraphs = lines.map(line =>
      new Paragraph({
        children: [new TextRun(line)],
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);

    saveAs(
      blob,
      (file?.name.replace('.pdf', '') || 'document') + '.docx'
    );
  };

  const currentDisplayMarkdown = correctedText || ocrResult?.allMarkdownDataUri || '';
  const isCorrecting = state === AppState.CORRECTING;
  const isProcessingOCR = state === AppState.UPLOADING_OCR;

  return (
    <div className="w-full">
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-700 font-medium">{errorMsg}</div>
        </div>
      )}

      {!ocrResult && !isProcessingOCR && (
        <div className="max-w-2xl mx-auto mt-10">
          <div className="bg-white rounded-3xl shadow-xl shadow-teal-900/5 border border-teal-100 overflow-hidden">
            <div className="p-8 md:p-12 text-center">
              <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6 relative group">
                <div className="absolute inset-0 bg-teal-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-110 blur-xl" />
                <UploadCloud className="w-10 h-10 text-teal-600 relative z-10" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Tải lên tài liệu PDF</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                Hỗ trợ nhận diện tiếng Việt chính xác, giữ nguyên định dạng.
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="flex items-center justify-center gap-3 mx-auto px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-teal-500/30">
                  <span>Chọn file PDF</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              {file && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium border border-teal-100">
                  <CheckCircle2 className="w-4 h-4" />
                  {file.name}
                </div>
              )}
            </div>
            {file && (
              <div className="bg-teal-50/50 p-6 border-t border-teal-100 flex justify-center">
                <button
                  onClick={handleUpload}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-4 h-4" />
                  Bắt đầu Xử lý OCR
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isProcessingOCR && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative w-20 h-20 mb-8">
            <div className="absolute inset-0 border-4 border-teal-100 rounded-full" />
            <div className="absolute inset-0 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <FileText className="absolute inset-0 m-auto w-8 h-8 text-teal-600 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Đang xử lý tài liệu...</h3>
        </div>
      )}

      {(ocrResult || isCorrecting) && !isProcessingOCR && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-6">
          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Xử lý hoàn tất</h3>
                <p className="text-xs text-slate-500">
                  {ocrResult?.pageCount} trang
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {!correctedText && !isCorrecting && (
                <button
                  onClick={handleCorrection}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold rounded-lg shadow-md shadow-yellow-500/20 flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Sửa lỗi bằng Gemini AI
                </button>
              )}

              {/* ✅ NÚT DOCX */}
              <button
                onClick={handleDownloadDocx}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Tải Word (.docx)
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Tải Markdown
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden min-h-[600px] flex flex-col">
            <div className="px-6 py-4 border-b border-teal-100 bg-teal-50/30 flex justify-between items-center">
              <span className="font-semibold text-slate-700 flex items-center gap-2">
                {correctedText ? (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    Kết quả đã sửa lỗi (AI)
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-teal-500" />
                    Kết quả OCR gốc
                  </>
                )}
              </span>
            </div>
            <div className="flex-1 p-8 overflow-auto max-h-[800px] markdown-body">
              <ReactMarkdown>{currentDisplayMarkdown}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
