import { useState, useRef, DragEvent, ChangeEvent, ClipboardEvent } from 'react';
import { 
  Edit3, Keyboard, Image as ImageIcon, UploadCloud, X, 
  Settings, Calculator, FlaskConical, Languages, Hash, TrendingUp, 
  Shapes, Lightbulb, List, Brain, Wand2, FileText, Copy
} from 'lucide-react';
import { extractTextFromImage, generateSimilar, solveProblem } from '../services/examService';

export default function SimilarProblemsTab() {
  const [problemText, setProblemText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subject, setSubject] = useState('toán');
  const [numProblems, setNumProblems] = useState(3);
  const [difficulty, setDifficulty] = useState('tương đương');
  const [problemType, setProblemType] = useState('tự luận phát hiện');
  const [includeSolutions, setIncludeSolutions] = useState(true);
  const [specificRequirements, setSpecificRequirements] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) handleImageFile(file);
        break;
      }
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh (JPG, PNG)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
      setProblemText(''); // Clear text when image is uploaded
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSolve = async () => {
    if (!problemText.trim() && !imagePreview) {
      alert('Vui lòng nhập đề bài hoặc tải ảnh lên');
      return;
    }
    setIsProcessing(true);
    setStatusMsg('Đang giải bài gốc...');
    setResult('');
    try {
      let textToProcess = problemText;
      if (!textToProcess && imagePreview) {
         setStatusMsg('Đang trích xuất văn bản từ ảnh...');
         textToProcess = await extractTextFromImage(imagePreview);
         setProblemText(textToProcess);
      }

      setStatusMsg('Đang giải bài...');
      const res = await solveProblem({ originalProblem: textToProcess, subject });
      setResult(res);
    } catch (error: any) {
      setResult('❌ Lỗi: ' + error.message);
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  const handleGenerate = async () => {
    if (!problemText.trim() && !imagePreview) {
      alert('Vui lòng nhập đề bài hoặc tải ảnh lên');
      return;
    }
    setIsProcessing(true);
    setStatusMsg('Đang tạo bài tương tự...');
    setResult('');
    try {
      let textToProcess = problemText;
      if (!textToProcess && imagePreview) {
         setStatusMsg('Đang trích xuất văn bản từ ảnh...');
         textToProcess = await extractTextFromImage(imagePreview);
         setProblemText(textToProcess);
      }

      setStatusMsg('Đang tạo bài...');
      const res = await generateSimilar({
        originalProblem: textToProcess,
        numProblems,
        difficulty,
        problemType,
        includeSolutions,
        specificRequirements,
        subject
      });
      setResult(res);
    } catch (error: any) {
      setResult('❌ Lỗi: ' + error.message);
    } finally {
      setIsProcessing(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up" onPaste={handlePaste}>
      {/* Card 1: Nhập đề bài gốc */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/20">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-5 text-white font-bold text-xl flex items-center gap-3">
          <Edit3 className="w-6 h-6" />
          Nhập đề bài gốc
        </div>
        <div className="p-6 space-y-6">
          {/* Text Input */}
          <div className="bg-teal-50/50 border-2 border-teal-100 rounded-2xl p-5 transition-all duration-300 focus-within:border-teal-500 focus-within:bg-white">
            <label className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
              <Keyboard className="w-5 h-5 text-teal-600" />
              Nhập đề bài dạng văn bản
            </label>
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 resize-none text-slate-700 placeholder:text-slate-400 outline-none"
              rows={5}
              placeholder="Nhập nội dung đề bài ở đây...&#10;&#10;Ví dụ:&#10;Câu 1: Tìm x biết: 2x + 3 = 7&#10;A. x = 2    B. x = 3    C. x = 4    D. x = 5"
              value={problemText}
              onChange={(e) => {
                setProblemText(e.target.value);
                if (e.target.value.trim() && imagePreview) clearImage();
              }}
            />
          </div>

          {/* Image Upload */}
          <div className="bg-teal-50/50 border-2 border-teal-100 rounded-2xl p-5 transition-all duration-300 hover:border-teal-400">
            <label className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
              <ImageIcon className="w-5 h-5 text-teal-600" />
              Hoặc tải lên ảnh đề bài
            </label>
            
            {!imagePreview ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
                  isDragging ? 'border-teal-500 bg-teal-100' : 'border-teal-300 hover:border-teal-500 hover:bg-teal-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${isDragging ? 'text-teal-600' : 'text-teal-400'}`} />
                <div className="text-xl font-bold text-slate-700 mb-2">Kéo thả ảnh vào đây</div>
                <div className="text-slate-500">Click để chọn file • Dán ảnh (Ctrl+V) • Hỗ trợ JPG, PNG</div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            ) : (
              <div className="mt-4 relative inline-block">
                <img src={imagePreview} alt="Preview" className="max-w-full max-h-64 rounded-xl border-2 border-teal-200 shadow-md" />
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={clearImage}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-teal-600 text-teal-700 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                  >
                    <X className="w-4 h-4" /> Xóa ảnh
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Tùy chọn */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/20">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-5 text-white font-bold text-xl flex items-center gap-3">
          <Settings className="w-6 h-6" />
          Tùy chọn
        </div>
        <div className="p-6">
          {/* Subject Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { id: 'toán', icon: Calculator, label: 'Toán' },
              { id: 'hóa', icon: FlaskConical, label: 'Hóa' },
              { id: 'anh', icon: Languages, label: 'Anh' }
            ].map((subj) => (
              <button
                key={subj.id}
                onClick={() => setSubject(subj.id)}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 border-2 ${
                  subject === subj.id
                    ? 'bg-gradient-to-r from-teal-600 to-teal-400 text-white border-transparent shadow-lg shadow-teal-500/40 scale-105'
                    : 'bg-white text-teal-600 border-teal-200 hover:bg-teal-50 hover:border-teal-400'
                }`}
              >
                <subj.icon className="w-5 h-5" />
                {subj.label}
              </button>
            ))}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Number of problems */}
            <div className="bg-white border-2 border-teal-100 rounded-2xl p-5 hover:border-teal-400 transition-colors">
              <label className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
                <Hash className="w-5 h-5 text-teal-600" />
                Số câu muốn tạo
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={numProblems}
                onChange={(e) => setNumProblems(parseInt(e.target.value) || 1)}
                className="w-full border-2 border-teal-100 rounded-xl px-4 py-2 focus:border-teal-500 focus:ring-0 outline-none transition-colors"
              />
              <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                <Lightbulb className="w-4 h-4" /> Khuyến nghị: 3-5 câu
              </p>
            </div>

            {/* Difficulty */}
            <div className="bg-white border-2 border-teal-100 rounded-2xl p-5 hover:border-teal-400 transition-colors">
              <label className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Độ khó
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border-2 border-teal-100 rounded-xl px-4 py-2 focus:border-teal-500 focus:ring-0 outline-none transition-colors bg-white"
              >
                <option value="dễ hơn">Dễ hơn đề gốc</option>
                <option value="tương đương">Tương đương</option>
                <option value="khó hơn">Khó hơn đề gốc</option>
                <option value="nâng cao">Nâng cao</option>
              </select>
            </div>

            {/* Problem Type */}
            <div className="bg-white border-2 border-teal-100 rounded-2xl p-5 hover:border-teal-400 transition-colors">
              <label className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
                <Shapes className="w-5 h-5 text-teal-600" />
                Dạng bài
              </label>
              <select
                value={problemType}
                onChange={(e) => setProblemType(e.target.value)}
                className="w-full border-2 border-teal-100 rounded-xl px-4 py-2 focus:border-teal-500 focus:ring-0 outline-none transition-colors bg-white"
              >
                <option value="tự luận phát hiện">Tự luận phát hiện</option>
                <option value="trắc nghiệm">Trắc nghiệm</option>
                <option value="tự luận">Tự luận</option>
                <option value="giải phương trình">Giải phương trình</option>
                <option value="hình học">Hình học</option>
                <option value="đại số">Đại số</option>
                <option value="tính toán">Tính toán</option>
              </select>
            </div>

            {/* Include Solutions Toggle */}
            <div className="bg-white border-2 border-teal-100 rounded-2xl p-5 hover:border-teal-400 transition-colors flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={includeSolutions}
                    onChange={(e) => setIncludeSolutions(e.target.checked)}
                  />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${includeSolutions ? 'bg-teal-500' : 'bg-slate-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${includeSolutions ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <div className="font-semibold text-slate-700 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-teal-600" />
                  Tạo kèm lời giải
                </div>
              </label>
              <p className="text-sm text-slate-500 mt-2 ml-17">Bao gồm hướng dẫn giải chi tiết</p>
            </div>
          </div>

          {/* Specific Requirements */}
          <div className="bg-white border-2 border-teal-100 rounded-2xl p-5 hover:border-teal-400 transition-colors">
            <label className="flex items-center gap-2 font-semibold text-slate-700 mb-3">
              <List className="w-5 h-5 text-teal-600" />
              Yêu cầu cụ thể (tùy chọn)
            </label>
            <textarea
              className="w-full border-2 border-teal-100 rounded-xl px-4 py-3 focus:border-teal-500 focus:ring-0 outline-none transition-colors resize-none"
              rows={3}
              placeholder="Mô tả yêu cầu cụ thể cho bài tập muốn tạo...&#10;Ví dụ: Thay đổi bối cảnh từ hình học sang thực tế"
              value={specificRequirements}
              onChange={(e) => setSpecificRequirements(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <button
          onClick={handleSolve}
          disabled={isProcessing}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:transform-none"
        >
          <Brain className="w-6 h-6" />
          Giải bài gốc
        </button>
        <button
          onClick={handleGenerate}
          disabled={isProcessing}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:transform-none"
        >
          <Wand2 className="w-6 h-6" />
          Tạo bài tương tự
        </button>
      </div>

      {/* Output Area */}
      {(result || isProcessing) && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 mt-8">
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-5 text-white font-bold text-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              Kết quả
            </div>
            <div className="flex gap-2">
               <button 
                 onClick={() => navigator.clipboard.writeText(result)} 
                 disabled={!result}
                 className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50" 
                 title="Copy"
               >
                 <Copy className="w-5 h-5" />
               </button>
            </div>
          </div>
          <div className="p-6">
            {isProcessing && (
              <div className="flex items-center gap-3 text-teal-600 font-medium mb-4 animate-pulse">
                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                {statusMsg}
              </div>
            )}
            {result && (
              <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto">
                <pre className="text-teal-300 font-mono text-sm whitespace-pre-wrap font-inter">
                  {result}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
