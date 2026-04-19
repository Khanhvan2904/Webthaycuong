const RENDER_API_URL = 'https://tikz-render-2026.onrender.com/compile';

export const extractTikzCode = (fullText: string): string | null => {
  console.log('🔍 [extractTikzCode] Đang trích xuất...');
  
  if (!fullText) {
    console.error('❌ [extractTikzCode] Input rỗng');
    return null;
  }
  
  const match = fullText.match(/\\begin\s*\{tikzpicture\}[\s\S]*?\\end\s*\{tikzpicture\}/);
  
  if (match) {
    console.log('✅ [extractTikzCode] Tìm thấy TikZ code!');
  } else {
    console.error('❌ [extractTikzCode] Không tìm thấy \\begin{tikzpicture}');
  }
  
  return match ? match[0] : null;
};

export interface CompileResult {
  success: boolean;
  image?: string;
  error?: string;
}

export const compileTikzToImage = async (source: string): Promise<CompileResult> => {
  console.log('🚀 [compileTikzToImage] BẮT ĐẦU BIÊN DỊCH');
  console.log('🌐 [compileTikzToImage] API URL:', RENDER_API_URL);
  
  const requestBody = {
    source: source,
    mode: 'auto',
    format: 'png',
    density: 300,
    transparent: true,
    return_log: true  
  };
  
  try {
    console.log('⏳ [compileTikzToImage] Đang gửi request...');
    
    const response = await fetch(RENDER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok || data.ok === false) {
      console.error('❌ [ERROR] Biên dịch thất bại');
      console.error('❌ [ERROR] Detail:', data.detail);
      
      let errorMessage = data.detail || 'Lỗi không xác định';
      
      if (data.log) {
        const errorMatch = data.log.match(/^!.*$/m);
        if (errorMatch) {
          errorMessage = errorMatch[0];
        }
      }
      
      return { 
        success: false, 
        error: `${errorMessage}\n\n💡 Xem Console (F12) để biết chi tiết.` 
      };
    }

    console.log('✅ [SUCCESS] Biên dịch thành công!');
    
    return { success: true, image: data.image_base64 };
    
  } catch (error: any) {
    console.error('💥 [EXCEPTION]:', error);
    return { 
      success: false, 
      error: `Lỗi kết nối: ${error.message}\n\n💡 Kiểm tra:\n- Server có đang chạy?\n- URL có đúng không?\n- Kết nối mạng?` 
    };
  }
};
