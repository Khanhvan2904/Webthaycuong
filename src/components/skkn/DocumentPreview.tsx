import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
}

export const DocumentPreview: React.FC<Props> = ({ content }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white shadow-sm rounded-xl border border-teal-100 flex flex-col h-full overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex justify-between items-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <span className="text-slate-500 text-sm font-medium">Bản thảo SKKN.docx</span>
        <div className="w-8"></div> 
      </div>
      
      <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar">
        {content ? (
          <article className="prose prose-teal max-w-none prose-headings:font-bold prose-h1:text-teal-800 prose-a:text-teal-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
            <div ref={bottomRef} className="h-20" />
          </article>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 min-h-[300px]">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-teal-500 rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Đang chờ nội dung từ chuyên gia AI...</p>
          </div>
        )}
      </div>
    </div>
  );
};
