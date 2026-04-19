export interface OCRImage {
  id: string;
  caption: string;
  mime: string;
  base64: string;
  dataUri: string;
}

export interface OCRPage {
  pageNumber: number;
  text: string;
  markdown: string;
  markdownDataUri: string;
  images: OCRImage[];
  charCount: number;
}

export interface OCRResult {
  success: boolean;
  pages: OCRPage[];
  pageCount: number;
  pagesWithText: number;
  totalChars: number;
  totalImages: number;
  fileId?: string;
  fileName?: string;
  allMarkdownDataUri?: string;
  logs?: string[];
  processedAt?: string;
  error?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING_OCR = 'UPLOADING_OCR',
  OCR_COMPLETE = 'OCR_COMPLETE',
  CORRECTING = 'CORRECTING',
  ERROR = 'ERROR'
}

export enum FunctionType {
  LINEAR = 'bac_nhat',
  QUADRATIC = 'bac_hai',
  CUBIC = 'bac_ba',
  QUARTIC = 'trung_phuong',
  RATIONAL_1_1 = 'mot_mot',
  RATIONAL_2_1 = 'hai_mot',
}

export enum GeometryType {
  TETRAHEDRON = 'tu_dien',
  CONE = 'khoi_non',
  CYLINDER = 'khoi_tru',
  SPHERE = 'khoi_cau',
  PRISM = 'lang_tru_dung',
  RECTANGULAR_PRISM = 'hinh_hop'
}

export enum AppTab {
  BBT = 'bbt',
  GRAPH = 'graph',
  GEOMETRY = 'geometry',
  CUSTOM_GRAPH = 'custom_graph',
  AI_DRAW = 'ai_draw',
  CHEMISTRY = 'chemistry',
  SIMILAR = 'similar',
  EXAM = 'exam',
  GAS_OCR = 'gas_ocr',
  GEMINI_OCR = 'gemini_ocr',
  GEOGEBRA = 'geogebra',
  TIKZ = 'tikz'
}

export interface Coefficients {
  a: number;
  b: number;
  c: number;
  d: number;
  m: number;
  n: number;
}

export interface GeoParams {
  A: string; B: string; C: string; D: string; 
  S: string; M: string; N: string; P: string; Q: string;
  R: number; h: number;
}

export interface UserInfo {
  topic: string;
  subject: string;
  grade: string;
  school: string;
  textbook: string;
}

export enum GenerationStep {
  INPUT_FORM = 0,
  OUTLINE = 1,
  PART_I_II = 2,
  PART_III = 3,
  PART_IV_SOL1 = 4,
  PART_IV_SOL2 = 5,
  PART_V_VI = 6,
  APPENDIX = 7,
  COMPLETED = 8
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GenerationState {
  step: GenerationStep;
  messages: ChatMessage[];
  fullDocument: string;
  isStreaming: boolean;
  error: string | null;
}

export interface Settings {
  gasEndpoint: string;
  geminiApiKey: string;
}

export type SubjectType = 'Toán' | 'Vật lý' | 'Hóa học' | 'Sinh học' | 'Tin học' | 'Công nghệ' | 'KHTN' | '';
export type GradeType = '6' | '7' | '8' | '9' | '10' | '11' | '12' | '';

export interface AIConfig {
  subject: SubjectType;
  grade: GradeType;
  topicInput: string;
}

export interface LessonActivity {
  name: string;
  time: string;
  objective: string;
  content: string;
  product: string;
  organization: string;
}

export interface LessonPlan {
  topic: string;
  duration: string;
  gdpt_requirements: string[];
  
  objectives: {
    subject_competence: string[];
    qualities: string[];
    ai_integration: string[];
  };
  
  equipment: {
    teacher: string[];
    student: string[];
    ai_tools_mode: {
        no_ai: string;
        with_ai: string;
    };
  };
  
  procedure: LessonActivity[];
  
  rubric?: {
    criteria: string;
    level1: string;
    level2: string;
    level3: string;
  }[];
  
  appendices?: {
    title: string;
    content: string;
  }[];
}

export interface ProcessingState {
  status: 'idle' | 'generating_plan' | 'rendering_images' | 'generating_docx' | 'completed' | 'error';
  progress: number;
  message: string;
  error?: string;
}

export interface NLSStandard {
  domain: string;
  component: string;
  indicator: string;
  code: string;
  level: 'TC1' | 'TC2';
}

export interface IntegratedItem {
  originalContent: string;
  suggestion: string;
  nlsCode: string;
  nlsIndicator: string;
  reasoning: string;
}

export enum GradeLevel {
  G6_7 = 'TC1',
  G8_9 = 'TC2'
}

export interface NlsAppState {
  subject: string;
  gradeLevel: GradeLevel;
  content: string;
  isLoading: boolean;
  result: IntegratedItem[] | null;
  error: string | null;
}

export interface LogMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'error' | 'command' | 'warning';
  timestamp: number;
}

export interface ExampleProblem {
  id: number;
  title: string;
  prompt: string;
  icon: string;
}

export interface GeoGebraApplet {
  reset: () => void;
  evalCommand: (cmd: string) => boolean;
  setVisible: (obj: string, visible: boolean) => void;
  setColor: (obj: string, r: number, g: number, b: number) => void;
  setLabelVisible: (obj: string, visible: boolean) => void;
  setLabelStyle: (obj: string, style: number) => void;
  setCaption: (obj: string, caption: string) => void;
  setPointSize: (obj: string, style: number) => void;
  getAllObjectNames: (type?: string) => string[];
  setGridVisible: (visible: boolean) => void;
  setAxesVisible: (xAxis: boolean, yAxis: boolean) => void;
  setFilling: (obj: string, alpha: number) => void;
}

declare global {
  interface Window {
    marked: {
      parse: (text: string) => string;
    };
    GGBApplet: any;
    ggbApplet: GeoGebraApplet;
  }
}
