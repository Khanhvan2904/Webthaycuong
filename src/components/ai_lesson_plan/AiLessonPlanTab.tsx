import React, { useState } from 'react';
import { compileTikzToImage } from '../../utils/api';
import { DocxService } from '../../services/docxService';
import { generateLessonPlan } from '../../services/geminiService';
import { ProcessingState, SubjectType, GradeType } from '../../types';
import { SUBJECTS, GRADES, AI_COMPETENCIES } from '../../constants';
import { Settings, Sparkles, Loader2, BookOpen, BrainCircuit, Wand2, FileCheck, AlertCircle } from 'lucide-react';

const docxService = new DocxService();

const TIKZ_DENSITY = 300;
const WORD_DPI = 96;
const SCALE_FACTOR = WORD_DPI / TIKZ_DENSITY;

const getImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 400, height: 300 }); 
    img.src = `data:image/png;base64,${base64}`;
  });
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const AiLessonPlanTab: React.FC = () => {
  const [requirements, setRequirements] = useState<string>('');
  const [subject, setSubject] = useState<SubjectType>('');
  const [grade, setGrade] = useState<GradeType>('');
  
  const [processing, setProcessing] = useState<ProcessingState>({ 
    status: 'idle', 
    progress: 0, 
    message: '' 
  });

  const handleCreateLessonPlan = async () => {
    if (!requirements.trim() || !subject || !grade) {
        alert("Vui lòng nhập Tên bài/Chủ đề, chọn Môn học và Khối lớp.");
        return;
    }

    setProcessing({ status: 'generating_plan', progress: 10, message: 'Đang thiết kế giáo án tích hợp AI...' });

    try {
      const plan = await generateLessonPlan({
          subject,
          grade,
          topicInput: requirements
      });

      setProcessing({ status: 'rendering_images', progress: 60, message: 'Đang xử lý hình ảnh...' });

      const images = new Map<string, { base64: string; width: number; height: number }>();
      
      const processTikzMatch = async (content: string, key: string) => {
        const tikzMatch = content.match(/\\begin\s*\{\s*tikzpicture\s*\}[\s\S]*?\\end\s*\{\s*tikzpicture\s*\}/);
        if (tikzMatch) {
            const source = tikzMatch[0];
            
            const res = await compileTikzToImage(source);

            if (res.success && res.image) {
                const dims = await getImageDimensions(res.image);
                images.set(key, {
                    base64: res.image,
                    width: Math.round(dims.width * SCALE_FACTOR),
                    height: Math.round(dims.height * SCALE_FACTOR)
                });
            }
        }
      };

      for (let i = 0; i < plan.procedure.length; i++) {
        setProcessing(prev => ({ ...prev, message: `Đang xử lý hình ảnh hoạt động ${i + 1}...` }));
        await processTikzMatch(plan.procedure[i].content, `activity_${i}`);
      }

      if (plan.appendices) {
        for (let i = 0; i < plan.appendices.length; i++) {
            setProcessing(prev => ({ ...prev, message: `Đang xử lý hình ảnh phụ lục ${i + 1}...` }));
            await processTikzMatch(plan.appendices[i].content, `appendix_${i}`);
        }
      }

      setProcessing({ status: 'generating_docx', progress: 80, message: 'Đang tạo file Word...' });

      const blob = await docxService.generateLessonPlanDocx(
          plan,
          images,
          { subject, grade, topicInput: requirements }
      );
      
      downloadBlob(blob, `GiaoAn_AI_${subject}_Lop${grade}.docx`);
      
      setProcessing({ status: 'completed', progress: 100, message: 'Hoàn tất! Đã tải xuống.' });
      setTimeout(() => setProcessing({ status: 'idle', progress: 0, message: '' }), 4000);

    } catch (error) {
      console.error(error);
      setProcessing({ 
        status: 'error', 
        progress: 0, 
        message: 'Có lỗi xảy ra. Vui lòng thử lại.' 
      });
    }
  };

  return (
    <div className="w-full font-sans">
      <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white shadow-xl rounded-t-3xl -mt-6 -mx-4 md:-mx-6 lg:-mx-8 mb-8">
        <div className="px-6 py-10 md:px-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">AI Lesson Planner</h1>
              <p className="text-teal-50 font-medium">
                Tạo Kế hoạch bài dạy tích hợp Năng lực AI (Tư duy - Đạo đức - Kĩ thuật)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="space-y-5">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                      <Settings className="w-5 h-5 text-teal-600" /> Thiết lập chung
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Môn học</label>
                          <select 
                              className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white outline-none transition-all"
                              value={subject}
                              onChange={(e) => setSubject(e.target.value as SubjectType)}
                          >
                              <option value="" className="text-slate-400">-- Chọn môn --</option>
                              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Khối lớp</label>
                          <select 
                              className="w-full p-3.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white outline-none transition-all"
                              value={grade}
                              onChange={(e) => setGrade(e.target.value as GradeType)}
                          >
                              <option value="" className="text-slate-400">-- Chọn khối --</option>
                              {GRADES.map(g => <option key={g} value={g}>Lớp {g}</option>)}
                          </select>
                      </div>
                  </div>
              </div>

              <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-100">
                  <h3 className="font-bold text-teal-900 flex items-center gap-2 mb-4 text-lg">
                      <BookOpen className="w-5 h-5 text-teal-600" /> Khung Năng lực AI
                  </h3>
                  <div className="space-y-4 h-32 overflow-y-auto custom-scrollbar pr-3">
                      {Object.entries(AI_COMPETENCIES).map(([key, val]) => (
                          <div key={key} className="text-sm">
                              <span className="font-bold text-teal-800 block mb-0.5">{val.title}</span>
                              <span className="text-teal-700/80 leading-relaxed block">{val.desc}</span>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          <div className="mb-8">
              <label className="text-sm font-bold text-slate-700 block mb-3 uppercase tracking-wide">
                   Tên bài học / Chủ đề cần soạn
              </label>
              <textarea
                  className="w-full h-36 p-5 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white transition-all font-medium text-slate-800 bg-slate-50 resize-y placeholder:text-slate-400 outline-none"
                  placeholder="Ví dụ: Hai tam giác bằng nhau. HS nhận biết được khái niệm, lập luận và chứng minh..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
              />
          </div>

          <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
              <button
                  onClick={handleCreateLessonPlan}
                  disabled={processing.status !== 'idle' && processing.status !== 'completed' && processing.status !== 'error'}
                  className={`
                      w-full px-8 py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]
                      ${processing.status === 'idle' || processing.status === 'completed' || processing.status === 'error'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white shadow-teal-500/25 border-none' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border-none shadow-none'}
                  `}
              >
                  {processing.status === 'idle' || processing.status === 'completed' || processing.status === 'error' ? (
                      <>
                      <Wand2 className="w-6 h-6" />
                      Tạo Giáo Án AI Ngay
                      </>
                  ) : (
                      <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {processing.message}
                      </>
                  )}
              </button>

              {processing.status !== 'idle' && processing.status !== 'completed' && processing.status !== 'error' && (
                  <div className="w-full space-y-2 animate-in fade-in duration-300">
                      <div className="flex justify-between text-xs font-bold text-teal-700 uppercase tracking-wider">
                          <span>{processing.message}</span>
                          <span>{processing.progress}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                              className="h-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-500 rounded-full"
                              style={{ width: `${processing.progress}%` }}
                          />
                      </div>
                  </div>
              )}

              {processing.status === 'completed' && (
                  <div className="w-full p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-green-100 p-2 rounded-full">
                          <FileCheck className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                          <p className="font-bold">Thành công!</p>
                          <p className="text-sm">File Word đã được tải xuống máy của bạn.</p>
                      </div>
                  </div>
              )}

              {processing.status === 'error' && (
                  <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 animate-in slide-in-from-bottom-2 duration-300">
                       <AlertCircle className="w-6 h-6 text-red-600" />
                       <div>
                          <p className="font-bold">Lỗi</p>
                          <p className="text-sm">{processing.message}</p>
                      </div>
                  </div>
              )}
          </div>

      </div>
    </div>
  );
}
