import React, { useState } from 'react';
import { NlsAppState, GradeLevel } from '../../types';
import { NLS_DATA, NLS_SUBJECTS } from '../../nlsData';
import { integrateNLS } from '../../services/nlsService';
import { FileUpload } from './FileUpload';
import { ResultView } from './ResultView';

export const NlsTab: React.FC = () => {
  const [state, setState] = useState<NlsAppState>({
    subject: NLS_SUBJECTS[0],
    gradeLevel: GradeLevel.G6_7,
    content: '',
    isLoading: false,
    result: null,
    error: null
  });

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(prev => ({ ...prev, subject: e.target.value, result: null, error: null }));
  };

  const handleGradeLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState(prev => ({ ...prev, gradeLevel: e.target.value as GradeLevel, result: null, error: null }));
  };

  const handleContentLoad = (content: string) => {
    setState(prev => ({ ...prev, content: content.substring(0, 10000), result: null, error: null }));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState(prev => ({ ...prev, content: e.target.value, result: null, error: null }));
  };

  const handleProcess = async () => {
    if (!state.content.trim()) {
      setState(prev => ({ ...prev, error: "Vui lòng nhập định hướng hoặc chuẩn bị file chương trình để phân tích." }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null, result: null }));

    try {
      const results = await integrateNLS(
        state.content.substring(0, 15000),
        state.subject,
        state.gradeLevel,
        NLS_DATA
      );
      setState(prev => ({ ...prev, isLoading: false, result: results }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isLoading: false, error: err.message || "Đã xảy ra lỗi." }));
    }
  };

  return (
    <div className="w-full">
      {/* Header section identical to AiLessonPlanTab style */}
      <div className="bg-gradient-to-r from-teal-700 to-cyan-700 text-white shadow-xl rounded-t-3xl -mt-6 -mx-4 md:-mx-6 lg:-mx-8 mb-8">
        <div className="px-6 py-10 md:px-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Tích hợp Năng lực số</h1>
              <p className="text-teal-50 font-medium">
                Sử dụng AI phân tích chương trình học để gợi ý tích hợp năng lực số (NLS)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Môn học</label>
            <select
              value={state.subject}
              onChange={handleSubjectChange}
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 bg-white"
            >
              {NLS_SUBJECTS.map(subj => (
                <option key={subj} value={subj}>{subj}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Cấp độ NLS</label>
            <select
              value={state.gradeLevel}
              onChange={handleGradeLevelChange}
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium text-slate-800 bg-white"
            >
              <option value={GradeLevel.G6_7}>Trọng số 1 (TC1) - Lớp 6, 7</option>
              <option value={GradeLevel.G8_9}>Trọng số 2 (TC2) - Lớp 8, 9</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">
            Nội dung Chương trình / Bài học
          </label>
          <div className="mb-4">
             <FileUpload onContentLoad={handleContentLoad} />
          </div>
          
          <textarea
            className="w-full h-64 p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all font-medium text-slate-800 bg-slate-50 placeholder:text-slate-400 custom-scrollbar"
            placeholder="Gõ hoặc dán nội dung văn bản trực tiếp ở đây, hoặc tải lên file ở nút phía trên..."
            value={state.content}
            onChange={handleContentChange}
          />
          <div className="mt-2 text-right">
             <span className={`text-xs font-semibold ${state.content.length > 8000 ? 'text-amber-500' : 'text-slate-400'}`}>
                {state.content.length.toLocaleString('vi-VN')} / 15,000 ký tự (khuyên dùng)
             </span>
          </div>
        </div>

        {state.error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{state.error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center py-4">
           <button
             onClick={handleProcess}
             disabled={state.isLoading || !state.content.trim()}
             className={`
               w-full md:w-auto px-12 py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg hover:-translate-y-0.5 transition-all
               ${state.isLoading || !state.content.trim() 
                 ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none' 
                 : 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-teal-500/30'}
             `}
           >
             {state.isLoading ? (
               <>
                 <svg className="animate-spin h-6 w-6 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 AI đang phân tích và tìm kiếm tích hợp...
               </>
             ) : (
               <>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
                 Phân tích & Tích hợp NLS
               </>
             )}
           </button>
        </div>

        {state.result && (
           <div className="pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <ResultView 
               results={state.result} 
               subject={state.subject} 
               gradeLevel={state.gradeLevel === GradeLevel.G6_7 ? 'Lớp 6-7' : 'Lớp 8-9'} 
             />
           </div>
        )}
      </div>
    </div>
  );
}
