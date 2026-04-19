import { useState, useRef } from 'react';
import { 
  GraduationCap, Sliders, Bolt, Crown, Code, FileText, 
  TableProperties, Plus, Trash2, Wand2, Eraser, 
  Copy, Download 
} from 'lucide-react';
import { generateFullExam7791, TopicSpec, ExamParams } from '../services/examService';

export default function ExamGeneratorTab() {
  const [model, setModel] = useState<'flash' | 'pro'>('flash');
  const [format, setFormat] = useState<'latex' | 'word'>('latex');
  const [subject, setSubject] = useState('Toán');
  const [grade, setGrade] = useState('THCS/THPT');
  const [examTitle, setExamTitle] = useState('KIỂM TRA GIỮA KỲ');
  const [examDuration, setExamDuration] = useState('90 phút');
  const [extraTopics, setExtraTopics] = useState('');
  
  const [topicRows, setTopicRows] = useState<TopicSpec[]>([
    { id: 1, topic: 'Hằng đẳng thức đáng nhớ', type: 'MCQ', level: 'NB', count: 4 },
    { id: 2, topic: 'Phương trình bậc hai', type: 'SA', level: 'VD', count: 2 }
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [resultContent, setResultContent] = useState('');
  const [counts, setCounts] = useState({ MCQ: 0, TF: 0, SA: 0, OTHER: 0 });
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [metaInfo, setMetaInfo] = useState('');

  const outputRef = useRef<HTMLPreElement>(null);

  const addRow = () => {
    setTopicRows([
      ...topicRows,
      { id: Date.now(), topic: '', type: 'MCQ', level: 'NB', count: 1 }
    ]);
  };

  const removeRow = (id: number) => {
    setTopicRows(topicRows.filter(row => row.id !== id));
  };

  const updateRow = (id: number, field: keyof TopicSpec, value: any) => {
    setTopicRows(topicRows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleClear = () => {
    if (isGenerating) return;
    setExamTitle('KIỂM TRA GIỮA KỲ');
    setExamDuration('90 phút');
    setExtraTopics('');
    setTopicRows([
      { id: 1, topic: 'Hằng đẳng thức đáng nhớ', type: 'MCQ', level: 'NB', count: 4 },
      { id: 2, topic: 'Phương trình bậc hai', type: 'SA', level: 'VD', count: 2 }
    ]);
    setResultContent('');
    setCounts({ MCQ: 0, TF: 0, SA: 0, OTHER: 0 });
    setTotalBlocks(0);
    setMetaInfo('');
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setStatusText(`Đang sinh đề 7991 bằng Gemini ${model === 'pro' ? 'Pro' : 'Flash'}...`);
    setResultContent('');

    const params: ExamParams = {
      subject,
      grade,
      topics: extraTopics,
      examTitle,
      examDuration,
      outputFormat: format,
      model,
      topicSpecs: topicRows
    };

    try {
      const res = await generateFullExam7791(params, (msg) => setStatusText(msg));
      
      if (res.success) {
        setResultContent(res.content);
        setCounts(res.counts as any);
        setTotalBlocks(res.totalBlocks);
        setMetaInfo(`[${res.format.toUpperCase()}] ${new Date().toLocaleString('vi-VN')}`);
      } else {
        setResultContent('❌ Sinh đề thất bại.');
      }
    } catch (error: any) {
      setResultContent('❌ Lỗi sinh đề: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!resultContent) return;
    try {
      await navigator.clipboard.writeText(resultContent);
      setMetaInfo('📋 Đã sao chép vào clipboard');
    } catch (e) {
      setMetaInfo('Hãy dùng Ctrl+C để sao chép');
    }
  };

  const handleDownload = () => {
    if (!resultContent) return;
    const ext = format === 'latex' ? 'tex' : 'txt';
    const blob = new Blob([resultContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `de_7991_${new Date().toISOString().slice(0,10)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMetaInfo('📥 Đã tải xuống');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-400 rounded-2xl p-6 text-white shadow-lg shadow-teal-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2 m-0">
              <GraduationCap className="w-8 h-8" />
              Hệ thống tạo đề thi 7991
            </h2>
            <div className="opacity-90 mt-2">
              Gemini 2.5 • 22 câu (12 TNKQ • 4 Đ/S • 6 TL ngắn) • LaTeX ex_test (không TikZ)
            </div>
            <div className="text-sm opacity-90 mt-1">
              Ma trận chủ đề linh hoạt: GV chọn <strong>chủ đề – loại câu – mức độ – số câu</strong>. Hệ thống sẽ bám sát số lượng câu hỏi được khai báo.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config */}
        <div className="lg:col-span-7">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-teal-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 text-white font-bold text-lg flex items-center gap-2">
              <Sliders className="w-5 h-5" />
              Cấu hình đề thi
            </div>
            
            <div className="p-5 space-y-6">
              {/* Top Config Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Model */}
                <div>
                  <label className="block font-bold text-teal-700 mb-2">Model AI</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setModel('flash')}
                      disabled={isGenerating}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                        model === 'flash' 
                          ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white border-transparent shadow-md' 
                          : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold"><Bolt className="w-4 h-4" /> Flash</div>
                      <span className={`text-xs ${model === 'flash' ? 'text-teal-100' : 'text-slate-500'}`}>Nhanh • Hiệu quả</span>
                    </button>
                    <button 
                      onClick={() => setModel('pro')}
                      disabled={isGenerating}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                        model === 'pro' 
                          ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white border-transparent shadow-md' 
                          : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold"><Crown className="w-4 h-4" /> Pro</div>
                      <span className={`text-xs ${model === 'pro' ? 'text-teal-100' : 'text-slate-500'}`}>Chi tiết • Chính xác</span>
                    </button>
                  </div>
                </div>

                {/* Format */}
                <div>
                  <label className="block font-bold text-teal-700 mb-2">Định dạng xuất</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setFormat('latex')}
                      disabled={isGenerating}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                        format === 'latex' 
                          ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white border-transparent shadow-md' 
                          : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold"><Code className="w-4 h-4" /> LaTeX</div>
                      <span className={`text-xs ${format === 'latex' ? 'text-teal-100' : 'text-slate-500'}`}>Chuẩn ex_test</span>
                    </button>
                    <button 
                      onClick={() => setFormat('word')}
                      disabled={isGenerating}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                        format === 'word' 
                          ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white border-transparent shadow-md' 
                          : 'bg-white text-teal-700 border-teal-200 hover:bg-teal-50'
                      }`}
                    >
                      <div className="flex items-center gap-1 font-bold"><FileText className="w-4 h-4" /> Word</div>
                      <span className={`text-xs ${format === 'word' ? 'text-teal-100' : 'text-slate-500'}`}>Text thuần</span>
                    </button>
                  </div>
                </div>

                {/* Basic Info */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Môn học</label>
                  <select 
                    value={subject} 
                    onChange={e => setSubject(e.target.value)}
                    className="w-full border-2 border-teal-100 rounded-xl px-3 py-2 focus:border-teal-500 outline-none bg-white"
                  >
                    <option value="Toán">Toán học</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cấp học</label>
                  <select 
                    value={grade} 
                    onChange={e => setGrade(e.target.value)}
                    className="w-full border-2 border-teal-100 rounded-xl px-3 py-2 focus:border-teal-500 outline-none bg-white"
                  >
                    <option value="THCS/THPT">THCS/THPT</option>
                    <option value="THCS">THCS</option>
                    <option value="THPT">THPT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên đề thi</label>
                  <input 
                    type="text" 
                    value={examTitle} 
                    onChange={e => setExamTitle(e.target.value)}
                    className="w-full border-2 border-teal-100 rounded-xl px-3 py-2 focus:border-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thời gian</label>
                  <input 
                    type="text" 
                    value={examDuration} 
                    onChange={e => setExamDuration(e.target.value)}
                    className="w-full border-2 border-teal-100 rounded-xl px-3 py-2 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <hr className="border-teal-100" />

              {/* Topic Matrix */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-teal-700 flex items-center gap-2">
                    <TableProperties className="w-5 h-5" />
                    Ma trận chủ đề 7991 (GV tự chọn)
                  </label>
                  <button 
                    onClick={addRow}
                    disabled={isGenerating}
                    className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Thêm dòng
                  </button>
                </div>
                <div className="text-sm text-slate-500 mb-3">
                  Mỗi dòng là một cấu hình <strong>Chủ đề – Loại câu – Mức độ – Số câu</strong>. Hệ thống sẽ tạo đúng số lượng câu hỏi theo cấu hình. (Chuẩn 7991: 12 TNKQ, 4 Đ/S, 6 TL ngắn).
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 bg-teal-50 uppercase">
                      <tr>
                        <th className="px-3 py-2 rounded-tl-lg w-10 text-center">#</th>
                        <th className="px-3 py-2">Chủ đề</th>
                        <th className="px-3 py-2 w-32">Loại câu</th>
                        <th className="px-3 py-2 w-36">Mức độ</th>
                        <th className="px-3 py-2 w-24">Số câu</th>
                        <th className="px-3 py-2 rounded-tr-lg w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {topicRows.map((row, idx) => (
                        <tr key={row.id} className="border-b border-teal-50">
                          <td className="px-3 py-2 text-center font-medium text-slate-500">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <input 
                              type="text" 
                              value={row.topic}
                              onChange={e => updateRow(row.id!, 'topic', e.target.value)}
                              placeholder="VD: Hằng đẳng thức..."
                              className="w-full border border-teal-200 rounded-md px-2 py-1 focus:border-teal-500 outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select 
                              value={row.type}
                              onChange={e => updateRow(row.id!, 'type', e.target.value)}
                              className="w-full border border-teal-200 rounded-md px-2 py-1 focus:border-teal-500 outline-none bg-white"
                            >
                              <option value="MCQ">TNKQ</option>
                              <option value="TF">Đúng/Sai</option>
                              <option value="SA">TL ngắn</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <select 
                              value={row.level}
                              onChange={e => updateRow(row.id!, 'level', e.target.value)}
                              className="w-full border border-teal-200 rounded-md px-2 py-1 focus:border-teal-500 outline-none bg-white"
                            >
                              <option value="NB">Nhận biết (NB)</option>
                              <option value="TH">Thông hiểu (TH)</option>
                              <option value="VD">Vận dụng (VD)</option>
                              <option value="VDC">Vận dụng cao (VDC)</option>
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input 
                              type="number" 
                              min="1"
                              value={row.count}
                              onChange={e => updateRow(row.id!, 'count', parseInt(e.target.value) || 1)}
                              className="w-full border border-teal-200 rounded-md px-2 py-1 focus:border-teal-500 outline-none"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button 
                              onClick={() => removeRow(row.id!)}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <label className="block font-semibold text-slate-700 mb-1 text-sm">Chủ đề bổ sung (mô tả chung, tùy chọn)</label>
                  <textarea 
                    value={extraTopics}
                    onChange={e => setExtraTopics(e.target.value)}
                    rows={2} 
                    className="w-full border-2 border-teal-100 rounded-xl px-3 py-2 focus:border-teal-500 outline-none resize-none text-sm"
                    placeholder="Ghi thêm mô tả chương, bài, trọng tâm…; dùng để gợi ý thêm cho AI."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isGenerating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Wand2 className="w-5 h-5" />
                  )}
                  {isGenerating ? 'Đang xử lý...' : 'Sinh đề 7991'}
                </button>
                <button 
                  onClick={handleClear}
                  disabled={isGenerating}
                  className="flex items-center justify-center gap-2 bg-white text-teal-700 border-2 border-teal-200 font-bold py-3 px-6 rounded-xl hover:bg-teal-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Eraser className="w-5 h-5" />
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-5">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-teal-100 overflow-hidden h-full flex flex-col">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 text-white font-bold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Kết quả
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              {/* Status */}
              {isGenerating && (
                <div className="flex items-center gap-3 bg-cyan-50 border-2 border-cyan-200 rounded-xl p-3 mb-4 text-cyan-800 font-medium animate-pulse">
                  <div className="w-3 h-3 rounded-full bg-cyan-500 animate-ping" />
                  {statusText}
                </div>
              )}

              {/* Format Badge */}
              <div className="flex justify-end mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-teal-600 to-teal-400 text-white text-xs font-bold shadow-sm">
                  {format === 'latex' ? <Code className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                  {format === 'latex' ? 'LaTeX' : 'Word'}
                </span>
              </div>

              {/* Output Area */}
              <div className="flex-1 bg-slate-900 rounded-xl border-2 border-teal-300 p-4 overflow-hidden flex flex-col min-h-[300px] max-h-[600px]">
                {resultContent ? (
                  <pre 
                    ref={outputRef}
                    className="text-teal-300 font-mono text-sm whitespace-pre-wrap overflow-y-auto flex-1 custom-scrollbar"
                  >
                    {resultContent}
                  </pre>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                    Kết quả sẽ hiển thị ở đây...
                  </div>
                )}
              </div>

              {/* Counters */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold border border-cyan-200">
                  MCQ: {counts.MCQ}
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold border border-cyan-200">
                  Đ/S: {counts.TF}
                </span>
                <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold border border-cyan-200">
                  TL: {counts.SA}
                </span>
                <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-bold shadow-sm">
                  Tổng: {totalBlocks}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={handleCopy}
                  disabled={!resultContent || isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border-2 border-slate-200 font-semibold py-2 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={!resultContent || isGenerating}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 border-2 border-slate-200 font-semibold py-2 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" /> Tải xuống
                </button>
              </div>

              {/* Meta */}
              {metaInfo && (
                <div className="text-xs text-slate-500 mt-3 text-center">
                  {metaInfo}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
