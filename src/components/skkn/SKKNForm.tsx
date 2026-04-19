import React from 'react';
import { UserInfo } from '../../types';
import { Button } from '../ui/Button';
import { BookOpen, School, GraduationCap, Book, PenTool } from 'lucide-react';

interface Props {
  userInfo: UserInfo;
  onChange: (field: keyof UserInfo, value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const SKKNForm: React.FC<Props> = ({ userInfo, onChange, onSubmit, isSubmitting }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.name as keyof UserInfo, e.target.value);
  };

  const isFormValid = Object.values(userInfo).every(val => (val as string).trim() !== '');

  return (
    <div className="w-full bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-teal-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-teal-800 mb-2">Thông tin Sáng kiến</h2>
        <p className="text-slate-500 text-sm">Cung cấp thông tin cơ bản để AI thiết lập ngữ cảnh chuyên gia</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5 focus:text-teal-600 transition-colors">Tên đề tài SKKN</label>
          <div className="relative rounded-xl shadow-sm group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PenTool className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
            </div>
            <input
              type="text"
              name="topic"
              value={userInfo.topic}
              onChange={handleChange}
              className="bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl p-3 border transition-all text-slate-800 placeholder:text-slate-400 outline-none"
              placeholder="VD: Một số biện pháp giúp học sinh lớp 5 học tốt môn Tiếng Việt..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 focus:text-teal-600 transition-colors">Môn học</label>
            <div className="relative rounded-xl shadow-sm group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Book className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              </div>
              <input
                type="text"
                name="subject"
                value={userInfo.subject}
                onChange={handleChange}
                className="bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl p-3 border transition-all text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder="VD: Toán, Ngữ Văn"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 focus:text-teal-600 transition-colors">Khối lớp / Cấp học</label>
            <div className="relative rounded-xl shadow-sm group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GraduationCap className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              </div>
              <input
                type="text"
                name="grade"
                value={userInfo.grade}
                onChange={handleChange}
                className="bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl p-3 border transition-all text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder="VD: Lớp 4, THCS"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 focus:text-teal-600 transition-colors">Trường công tác</label>
            <div className="relative rounded-xl shadow-sm group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <School className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              </div>
              <input
                type="text"
                name="school"
                value={userInfo.school}
                onChange={handleChange}
                className="bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl p-3 border transition-all text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder="VD: Tiểu học Nguyễn Du"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 focus:text-teal-600 transition-colors">Bộ sách giáo khoa</label>
            <div className="relative rounded-xl shadow-sm group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
              </div>
              <input
                type="text"
                name="textbook"
                value={userInfo.textbook}
                onChange={handleChange}
                className="bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl p-3 border transition-all text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder="VD: Cánh Diều, KNTT"
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={onSubmit} 
            disabled={!isFormValid || isSubmitting} 
            className="w-full py-4 text-base font-bold shadow-teal-500/20 shadow-lg rounded-xl"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Đang khởi tạo chuyên gia...
              </span>
            ) : "Bắt đầu lập dàn ý chi tiết"}
          </Button>
        </div>
      </div>
    </div>
  );
};
