import { GradeType, SubjectType } from '../types';

export const SUBJECTS: SubjectType[] = [
  'Toán', 'Vật lý', 'Hóa học', 'Sinh học', 'Tin học', 'Công nghệ', 'KHTN'
];

export const GRADES: GradeType[] = ['6', '7', '8', '9', '10', '11', '12'];

export const AI_COMPETENCIES = {
  'NLa': {
    title: 'NLa. Tư duy lấy con người làm trung tâm',
    desc: 'Hiểu vai trò con người trong thiết kế/sử dụng AI; nhận diện AI hỗ trợ chứ không thay thế con người.'
  },
  'NLb': {
    title: 'NLb. Đạo đức AI',
    desc: 'Nguyên tắc đạo đức, công bằng, minh bạch; không gian lận; tôn trọng quyền riêng tư.'
  },
  'NLc': {
    title: 'NLc. Các kĩ thuật và ứng dụng AI',
    desc: 'Hiểu khái niệm dữ liệu, thuật toán; dùng công cụ AI tạo sản phẩm số.'
  },
  'NLd': {
    title: 'NLd. Thiết kế hệ thống AI',
    desc: 'Xác định tình huống ứng dụng AI; mô phỏng hoạt động với công cụ có sẵn.'
  }
};

export const STEPS_INFO = {
  [0]: { label: "Thông tin", description: "Thiết lập thông tin cơ bản" },
  [1]: { label: "Lập Dàn Ý", description: "Xây dựng khung sườn cho SKKN" },
  [2]: { label: "Phần I & II", description: "Đặt vấn đề & Cơ sở lý luận" },
  [3]: { label: "Phần III", description: "Thực trạng vấn đề" },
  [4]: { label: "Giải pháp 1", description: "Chi tiết giải pháp trọng tâm 1" },
  [5]: { label: "Giải pháp 2-3", description: "Chi tiết các giải pháp tiếp theo" },
  [6]: { label: "Phần V, VI & Phụ lục", description: "Hiệu quả & Kết luận" },
  [7]: { label: "Hoàn tất", description: "Xuất bản tài liệu" },
  [8]: { label: "Hoàn tất", description: "Đã xong" }
};
