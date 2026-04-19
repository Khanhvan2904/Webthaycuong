import React, { useState } from 'react';
import { IntegratedItem } from '../../types';
import { exportToWord } from '../../services/nlsExportService';

interface ResultViewProps {
  results: IntegratedItem[];
  subject: string;
  gradeLevel: string;
}

export const ResultView: React.FC<ResultViewProps> = ({ results, subject, gradeLevel }) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!results || results.length === 0) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToWord(results, subject, gradeLevel);
    } catch (error) {
      console.error("Export failed", error);
      alert("Xuất file thất bại. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl shadow-xl shadow-teal-100/50 border border-teal-100 bg-white">
      <div className="bg-gradient-to-r from-teal-500 to-teal-400 px-6 py-5 flex items-center justify-between flex-wrap gap-4">
        <div>
            <h3 className="text-xl font-black text-white flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Kết quả Tích hợp Năng lực số
            </h3>
            <p className="text-teal-50 text-sm mt-1 opacity-90 pl-10">
            Tìm thấy {results.length} đề xuất tích hợp phù hợp
            </p>
        </div>
        
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-white text-teal-600 rounded-lg font-bold text-sm shadow-md hover:bg-teal-50 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
            {isExporting ? (
                <svg className="animate-spin h-4 w-4 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            )}
            Xuất file Word
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-sm uppercase tracking-wider font-bold">
              <th className="p-4 w-1/4">Nội dung gốc</th>
              <th className="p-4 w-1/3">Hoạt động đề xuất</th>
              <th className="p-4 w-1/6 text-center">Mã NLS</th>
              <th className="p-4 w-1/4">Lý do & Chỉ báo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {results.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 align-top">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-700 italic">
                    "{item.originalContent}"
                  </div>
                </td>
                <td className="p-4 align-top text-sm text-slate-700 leading-relaxed">
                  {item.suggestion}
                </td>
                <td className="p-4 align-top text-center">
                  <span className="inline-block px-2 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-md whitespace-nowrap">
                    {item.nlsCode}
                  </span>
                </td>
                <td className="p-4 align-top space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Chỉ báo</span>
                    <p className="text-sm text-slate-700">{item.nlsIndicator}</p>
                  </div>
                  <div>
                     <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Lý giải</span>
                     <p className="text-xs text-slate-600 bg-amber-50 p-2 rounded border border-amber-100">
                       {item.reasoning}
                     </p>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
