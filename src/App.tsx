/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import SimilarProblemsTab from './components/SimilarProblemsTab';
import ExamGeneratorTab from './components/ExamGeneratorTab';
import { GasOcrTab } from './components/GasOcrTab';
import { GeminiOcrTab } from './components/GeminiOcrTab';
import { GeoGebraTab } from './components/GeoGebraTab';
import { TikzTab } from './components/TikzTab';
import { SkknTab } from './components/skkn/SkknTab';
import { AiLessonPlanTab } from './components/ai_lesson_plan/AiLessonPlanTab';
import { NlsTab } from './components/nls/NlsTab';
import { Sparkles, FileText, Server, Zap, Compass, PenTool, Edit3, BrainCircuit, Keyboard } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('similar');

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-teal-100 to-cyan-100 text-slate-800 font-sans p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-400 text-white p-6 md:p-8 rounded-3xl mb-8 text-center shadow-lg shadow-teal-500/30 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3 md:mb-4 drop-shadow-md flex items-center justify-center gap-3">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10" />
              AI Thông Minh
            </h1>
            <p className="text-sm md:text-xl opacity-95 drop-shadow-sm">
              Bộ công cụ trợ giảng: Tạo bài tương tự, Đề thi, OCR, GeoGebra, LaTeX, SKKN, Giáo án, NLS.
            </p>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white blur-3xl"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex justify-center mb-8 flex-wrap gap-2">
          <div className="bg-white/60 backdrop-blur-md p-1.5 rounded-2xl flex flex-wrap shadow-sm border border-white/50 justify-center">
            <button
              onClick={() => setActiveTab('similar')}
              className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                activeTab === 'similar'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-teal-700 hover:bg-teal-50'
              }`}
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 hidden sm:block" />
              Bài tương tự
            </button>
            <button
              onClick={() => setActiveTab('exam')}
              className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                activeTab === 'exam'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-teal-700 hover:bg-teal-50'
              }`}
            >
              <FileText className="w-4 h-4 md:w-5 md:h-5 hidden sm:block" />
              Đề thi
            </button>
            <button
              onClick={() => setActiveTab('gas_ocr')}
              className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                activeTab === 'gas_ocr'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-teal-700 hover:bg-teal-50'
              }`}
            >
              <Server className="w-4 h-4 md:w-5 md:h-5 hidden sm:block" />
              OCR (GAS)
            </button>
            <button
              onClick={() => setActiveTab('gemini_ocr')}
              className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                activeTab === 'gemini_ocr'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-orange-700 hover:bg-orange-50'
              }`}
            >
              <Zap className="w-4 h-4 md:w-5 md:h-5 hidden sm:block" />
              OCR (Gemini)
            </button>
            <button
              onClick={() => setActiveTab('geogebra')}
              className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                activeTab === 'geogebra'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Compass className="w-4 h-4 md:w-5 md:h-5 hidden sm:block" />
              GeoGebra
            </button>
            <button
              onClick={() => setActiveTab('tikz')}
              className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                activeTab === 'tikz'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'text-pink-700 hover:bg-pink-50'
              }`}
            >
              <PenTool className="w-4 h-4 md:w-5 md:h-5 hidden sm:block" />
              LaTeX
            </button>
            <button
              onClick={() => setActiveTab('skkn')}
              className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                activeTab === 'skkn'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Edit3 className="w-4 h-4 md:w-5 md:h-5 hidden sm:block" />
              SKKN
            </button>
            <button
              onClick={() => setActiveTab('lesson_plan')}
              className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                activeTab === 'lesson_plan'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-cyan-700 hover:bg-cyan-50'
              }`}
            >
              <BrainCircuit className="w-4 h-4 md:w-5 md:h-5 hidden sm:block" />
              Giáo án AI
            </button>
            <button
              onClick={() => setActiveTab('nls')}
              className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                activeTab === 'nls'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <Keyboard className="w-4 h-4 md:w-5 md:h-5 hidden sm:block" />
              Tích hợp NLS
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <main>
          {activeTab === 'similar' && <SimilarProblemsTab />}
          {activeTab === 'exam' && <ExamGeneratorTab />}
          {activeTab === 'gas_ocr' && <GasOcrTab />}
          {activeTab === 'gemini_ocr' && <GeminiOcrTab />}
          {activeTab === 'geogebra' && <GeoGebraTab />}
          {activeTab === 'tikz' && <TikzTab />}
          {activeTab === 'skkn' && <SkknTab />}
          {activeTab === 'lesson_plan' && <AiLessonPlanTab />}
          {activeTab === 'nls' && <NlsTab />}
        </main>
      </div>
    </div>
  );
}
