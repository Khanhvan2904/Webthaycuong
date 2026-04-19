import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TopicSpec {
  id?: number;
  topic: string;
  type: 'MCQ' | 'TF' | 'SA';
  level: 'NB' | 'TH' | 'VD' | 'VDC';
  count: number;
  auto?: boolean;
}

export interface ExamParams {
  subject: string;
  grade: string;
  topics: string;
  examTitle: string;
  examDuration: string;
  outputFormat: 'latex' | 'word';
  model: 'flash' | 'pro';
  topicSpecs: TopicSpec[];
}

function getTargetSpec7991() {
  return { MCQ: 12, TF: 4, SA: 6 };
}

function enforceInlineDollar(s: string) {
  if (!s) return '';
  let out = String(s);
  out = out.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  out = out.replace(/\\False\b/gi, '');
  return out;
}

function getExTestStructures() {
  return {
    multichoice:
`\\begin{ex}  %Câu X:[Chủ đề - Mức độ]
Nội dung câu hỏi với $công\\ thức$.
\\choice
{Đáp án A}
{Đáp án B}
{Đáp án C}
{\\True Đáp án D đúng}
\\loigiai{Lời giải ngắn gọn/chi tiết.\\\\}
\\end{ex}`,
    truefalse:
`\\begin{ex}  %Câu X:[Chủ đề - Mức độ]
Cho ... Xét đúng/sai 4 mệnh đề:
\\choiceTF
{\\True Mệnh đề đúng}
{Mệnh đề sai}
{\\True Mệnh đề đúng}
{Mệnh đề sai}
\\loigiai{Giải thích cho từng mệnh đề.\\\\}
\\end{ex}`,
    shortans:
`\\begin{ex}  %Câu X:[Chủ đề - Mức độ]
Câu hỏi trả lời ngắn (yêu cầu kết quả).
\\shortans{Đáp án ngắn gọn}
\\loigiai{Lời giải tóm tắt.\\\\}
\\end{ex}`
  };
}

function formatLatexExTest(content: string) {
  let s = (content || '').trim();
  s = enforceInlineDollar(s);
  s = s.replace(/```latex\s*/g, '').replace(/```\s*$/g, '');

  const first = s.indexOf('\\begin{ex}');
  const last = s.lastIndexOf('\\end{ex}');
  if (first !== -1 && last !== -1 && last >= first) {
    s = s.slice(first, last + '\\end{ex}'.length);
  }

  s = s.replace(/\\end\{ex\}\s*\\begin\{ex\}/g, '\\end{ex}\n\n\\begin{ex}');
  s = s.replace(/\\begin\{ex\}\s*\n\s*%Câu\s+(\d+):\s*\[(.*?)\]/g, '\\begin{ex}  %Câu $1:[$2]');
  s = s.replace(/\\begin\{ex\}\s*\n\s*%Câu\s+X:\s*\[(.*?)\]/g, '\\begin{ex}  %Câu X:[$1]');

  s = s.replace(/\\choice\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}/g,
    '\\choice\n{$1}\n{$2}\n{$3}\n{$4}');
  s = s.replace(/\\choiceTF\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}\s*\{([^}]*)\}/g,
    '\\choiceTF\n{$1}\n{$2}\n{$3}\n{$4}');

  s = s.replace(/\\begin\{center\}[\s\S]*?\\end\{center\}\s*/g, '');
  s = s.replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}\s*/g, '');

  return enforceInlineDollar(s);
}

function extractBlocks(s: string) {
  s = formatLatexExTest(s || '');
  const m = s.match(/\\begin\{ex\}[\s\S]*?\\end\{ex\}/g);
  return m || [];
}

function classifyBlock(block: string) {
  if (!block) return 'OTHER';
  if (block.indexOf('\\choiceTF') !== -1) return 'TF';
  if (block.indexOf('\\choice') !== -1) return 'MCQ';
  if (block.indexOf('\\shortans') !== -1) return 'SA';
  return 'OTHER';
}

function countByType(blocks: string[]) {
  const c = { MCQ: 0, TF: 0, SA: 0, OTHER: 0 };
  blocks.forEach(b => {
    const type = classifyBlock(b);
    if (type in c) c[type as keyof typeof c]++;
  });
  return c;
}

function validateBlockByType(block: string, type: string) {
  const errs: string[] = [];
  if (block.indexOf('\\end{ex}') === -1) {
    errs.push('Thiếu \\end{ex}');
    return { isValid: false, errors: errs };
  }

  if (type === 'MCQ') {
    const mc = block.match(/\\choice\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}\s*\{([\s\S]*?)\}/);
    if (!mc) {
      errs.push('\\choice không đủ 4 đáp án.');
    } else {
      const cc = [mc[1], mc[2], mc[3], mc[4]];
      const trueCount = cc.filter(x => /\\True\b/.test(x)).length;
      if (trueCount !== 1) errs.push('MCQ phải có ĐÚNG 1 \\True.');
      for (let i = 0; i < cc.length; i++) {
        if (!cc[i] || !cc[i].trim()) errs.push('Đáp án ' + String.fromCharCode(65 + i) + ' trống.');
      }
    }
  } else if (type === 'TF') {
    const ok4 = /\\choiceTF\s*\{[\s\S]*?\}\s*\{[\s\S]*?\}\s*\{[\s\S]*?\}\s*\{[\s\S]*?\}/.test(block);
    if (!ok4) errs.push('\\choiceTF không đủ 4 mệnh đề.');
    if (!/\\True\b/.test(block)) errs.push('TF cần ít nhất 1 mệnh đề \\True.');
    if (/\\False\b/i.test(block)) errs.push('Không dùng \\False trong TF.');
  } else if (type === 'SA') {
    if (!/\\shortans\{[\s\S]*?\}/.test(block)) errs.push('Thiếu \\shortans{...}.');
  }

  if (!/\\loigiai\{[\s\S]+?\}/.test(block)) errs.push('Thiếu \\loigiai{...}.');
  if (/\\\(|\\\)/.test(block)) errs.push('Inline math phải dùng $...$, không dùng \\( ... \\).');

  return { isValid: errs.length === 0, errors: errs };
}

function syntheticBlock(type: string, index: number, topicText: string, level: string) {
  const topic = (topicText || 'Đại số').split(/[;|,]/)[0].trim();
  const tag = '%Câu X: [' + topic + ' - ' + (level || 'NB') + ']';
  if (type === 'MCQ') {
    return '\\begin{ex} ' + tag + '\n' +
      'Tính $\\dfrac{(x-1)^2-(x-1)(x-3)}{x-3}$ tại $x=4$.\n' +
      '\\choice\n' +
      '{0}\n' +
      '{1}\n' +
      '{2}\n' +
      '{\\True 6}\n' +
      '\\loigiai{Rút gọn: $(x-1)^2-(x-1)(x-3)=2(x-1)$. Thế $x=4$: $\\dfrac{2\\cdot3}{1}=6$.\\\\}\n' +
      '\\end{ex}';
  }
  if (type === 'TF') {
    return '\\begin{ex} ' + tag + '\n' +
      'Xét các mệnh đề:\n' +
      '\\choiceTF\n' +
      '{\\True Với mọi $x\\in\\mathbb{R}$, $x^2\\ge 0$}\n' +
      '{$\\sqrt{x+y}=\\sqrt{x}+\\sqrt{y}$ với mọi $x,y\\ge 0$}\n' +
      '{\\True Nếu $a>b$ và $b>c$ thì $a>c$}\n' +
      '{$|x+y|=|x|+|y|$ với mọi $x,y$}\n' +
      '\\loigiai{(1) Đúng. (2) Sai. (3) Đúng. (4) Sai.\\\\}\n' +
      '\\end{ex}';
  }
  return '\\begin{ex} ' + tag + '\n' +
    'Tính $S=1^2+2^2+\\cdots+10^2$.\n' +
    '\\shortans{385}\n' +
    '\\loigiai{$\\sum_{k=1}^{10}k^2=\\frac{10\\cdot11\\cdot21}{6}=385$.\\\\}\n' +
    '\\end{ex}';
}

async function callGeminiWithRetry(messages: {role: string, content: string}[], options: any) {
  const model = options.model || 'flash';
  const temperature = typeof options.temperature === 'number' ? options.temperature : 0.62;
  const modelName = model === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

  const systemInstruction = messages.find(m => m.role === 'system')?.content;
  const userMessage = messages.find(m => m.role === 'user')?.content || '';

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: temperature,
      }
    });
    return response.text || '';
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error('Gemini API Error: ' + error.message);
  }
}

async function repairSingleBlock(originalBlock: string, type: string, model: string) {
  const s = getExTestStructures();
  const template = (type === 'MCQ') ? s.multichoice : (type === 'TF') ? s.truefalse : s.shortans;

  let ruleLine;
  if (type === 'MCQ') {
    ruleLine = 'Dùng \\choice 4 đáp án, ĐÚNG 1 \\True.';
  } else if (type === 'TF') {
    ruleLine = 'Dùng \\choiceTF 4 mệnh đề; chỉ đánh dấu \\True ở mệnh đề đúng. Nếu có thể, sắp xếp mệnh đề a)→d) với độ khó tăng dần (NB, TH, VD, VD/VDC).';
  } else {
    ruleLine = 'Phải có \\shortans{...} kết quả ngắn gọn.';
  }

  const sys =
`SỬA 1 KHỐI ex_test (KHÔNG dùng TikZ, KHÔNG thêm văn bản thừa):
- Giữ "%Câu k:[Chủ đề - Mức độ]" nếu có.
- ${ruleLine}
- BẮT BUỘC có \\loigiai{...}.
- Inline math dùng $...$, KHÔNG dùng \\( ... \\).
- CHỈ TRẢ VỀ 1 khối \\begin{ex}...\\end{ex}.

MẪU:
${template}`;

  const user =
`KHỐI CẦN SỬA:
${originalBlock}
Sửa đạt yêu cầu và chỉ in 1 khối ex_test, KHÔNG TikZ.`;

  const raw = await callGeminiWithRetry(
    [{ role: 'system', content: sys }, { role: 'user', content: user }],
    { model: model, temperature: 0.2 }
  );
  const fixed = extractBlocks(raw);
  return fixed.length ? fixed[0] : originalBlock;
}

function difficultyGuideVI(reqLevel: string) {
  return `YÊU CẦU MỨC ĐỘ: ${reqLevel}
- NB: kiến thức/thuộc tính cơ bản, 1 bước.
- TH: biến đổi cơ bản, 1–2 thuộc tính.
- VD: thực tiễn/đa bước/tổng hợp.
- VDC: lập luận sâu, chứng minh tinh.`;
}

function buildStrictPrompt(type: string, count: number, params: any, desiredLevel: string) {
  const s = getExTestStructures();
  const template = (type === 'TF') ? s.truefalse : (type === 'SA' ? s.shortans : s.multichoice);
  const topicsText = (params && params.topics ? params.topics : 'Theo chương trình hiện hành').trim();

  const tfDifficultyNote =
`Đối với câu ĐÚNG/SAI:
- Có 4 mệnh đề a), b), c), d) trong \\choiceTF.
- **YÊU CẦU**: các mệnh đề phải có độ khó tăng dần:
  + a) Nhận biết (NB) – khái niệm/công thức cơ bản, 1 ý.
  + b) Thông hiểu (TH) – vận dụng 1–2 tính chất cơ bản.
  + c) Vận dụng (VD) – tình huống/áp dụng thực tiễn, kết nối nhiều ý.
  + d) Vận dụng hoặc Vận dụng cao (VD/VDC) – lập luận sâu hơn, tinh tế hơn.
- Tuy nhiên, **mức độ chung của cả câu** vẫn là: ${desiredLevel} (dùng để phân loại câu hỏi trong ma trận đề).`;

  let ruleLine;
  if (type === 'MCQ') {
    ruleLine = 'Dùng \\choice với 4 đáp án, và ĐÚNG 1 đáp án có \\True.';
  } else if (type === 'TF') {
    ruleLine = 'Dùng \\choiceTF với 4 mệnh đề; chỉ đánh dấu \\True ở mệnh đề đúng.';
  } else {
    ruleLine = 'Dùng \\shortans{...} để ghi đáp án ngắn gọn.';
  }

  const system =
`Bạn là chuyên gia ra đề ${params?.subject || 'Toán'} ${params?.grade || 'THCS/THPT'}, thành thạo LaTeX ex_test.
Sinh CHÍNH XÁC ${count} block loại ${type} (mỗi block = \\begin{ex}...\\end{ex}):
- ${ruleLine}
- Mỗi block PHẢI có \\loigiai{...}
- Comment đầu block: "%Câu k: [Chủ đề - NB|TH|VD|VDC]"
- KHÔNG in thêm văn bản ngoài ${count} block ex_test
- **BẮT BUỘC**: Inline math dùng $...$, KHÔNG dùng \\( ... \\).
- **CẤM TikZ** (không chèn hình/center/tikz).

${difficultyGuideVI(desiredLevel)}
${type === 'TF' ? '\n' + tfDifficultyNote + '\n' : '\n'}
MẪU:
${template}`;

  const user =
`Chủ đề ưu tiên (do GV nhập): ${topicsText}
MỨC ĐỘ yêu cầu chung cho mỗi block trong lần này: ${desiredLevel}.
${type === 'TF' ? 'Nếu là câu ĐÚNG/SAI, hãy sắp xếp 4 mệnh đề a)→d) theo độ khó tăng dần như mô tả.\n' : ''}YÊU CẦU: Trả về CHỈ ${count} block ex_test loại ${type}, không TikZ.`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: user }
  ];
}

async function generateNBlocksStrict(type: string, count: number, params: any, desiredLevel: string) {
  const messages = buildStrictPrompt(type, count, params, desiredLevel);
  const raw = await callGeminiWithRetry(messages, {
    model: params?.model || 'flash',
    temperature: 0.45
  });

  const blocks = extractBlocks(raw).filter(b => classifyBlock(b) === type)
    .map(b => formatLatexExTest(b));

  const out: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    let b = blocks[i];
    if (b.indexOf('\\end{ex}') === -1 || b.indexOf('\\loigiai{') === -1) {
      try {
        b = await repairSingleBlock(b + '\n\\loigiai{Lời giải.\\\\}\n\\end{ex}', type, params?.model || 'flash');
      } catch (e1) {
        b = syntheticBlock(type, out.length + 1, params?.topics, desiredLevel);
      }
    }
    const v = validateBlockByType(b, type);
    if (!v.isValid) {
      try {
        b = await repairSingleBlock(b, type, params?.model || 'flash');
        const v2 = validateBlockByType(b, type);
        if (!v2.isValid) b = syntheticBlock(type, out.length + 1, params?.topics, desiredLevel);
      } catch (e2) {
        b = syntheticBlock(type, out.length + 1, params?.topics, desiredLevel);
      }
    }
    out.push(formatLatexExTest(b));
  }

  while (out.length < count) {
    out.push(syntheticBlock(type, out.length + 1, params?.topics, desiredLevel));
  }
  return out.slice(0, count);
}

function buildPlanFromTopicSpecs(params: ExamParams) {
  const target = getTargetSpec7991();
  const specs = params.topicSpecs || [];
  const plan: TopicSpec[] = [];

  if (!specs.length) {
    const topicsText0 = params.topics || 'Theo chương trình hiện hành';
    return {
      plan: [
        { topic: topicsText0, type: 'MCQ', level: 'NB', count: 12 },
        { topic: topicsText0, type: 'TF',  level: 'NB', count: 1  },
        { topic: topicsText0, type: 'TF',  level: 'TH', count: 3  },
        { topic: topicsText0, type: 'SA',  level: 'VD', count: 4  },
        { topic: topicsText0, type: 'SA',  level: 'VDC',count: 2  }
      ] as TopicSpec[],
      target
    };
  }

  specs.forEach((row, idx) => {
    if (!row) return;
    const topic = (row.topic || ('Chủ đề ' + (idx + 1))).trim();
    let type = (row.type || 'MCQ').toUpperCase() as any;
    if (type === 'TNKQ') type = 'MCQ';
    if (type === 'DS' || type === 'Đ/S') type = 'TF';
    if (type === 'TL') type = 'SA';
    if (!(type in target)) return;

    const level = (row.level || 'NB').toUpperCase() as any;
    const count = Math.max(0, parseInt(row.count as any, 10) || 0);
    if (count <= 0) return;

    plan.push({ topic, type, level, count });
  });

  if (!plan.length) {
    const topicsText = params.topics || 'Theo chương trình hiện hành';
    return {
      plan: [
        { topic: topicsText, type: 'MCQ', level: 'NB', count: 12 },
        { topic: topicsText, type: 'TF',  level: 'NB', count: 1  },
        { topic: topicsText, type: 'TF',  level: 'TH', count: 3  },
        { topic: topicsText, type: 'SA',  level: 'VD', count: 4  },
        { topic: topicsText, type: 'SA',  level: 'VDC',count: 2  }
      ] as TopicSpec[],
      target
    };
  }

  const byType: Record<string, TopicSpec[]> = { MCQ: [], TF: [], SA: [] };
  plan.forEach(p => {
    if (byType[p.type]) byType[p.type].push(p);
  });

  return { plan: plan.filter(p => p.count > 0), target };
}

async function generateByPlan(params: ExamParams, onProgress?: (msg: string) => void) {
  const info = buildPlanFromTopicSpecs(params);
  const plan = info.plan;
  const all: string[] = [];
  const errors: string[] = [];

  for (let i = 0; i < plan.length; i++) {
    const item = plan[i];
    const itemParams = { ...params, topics: item.topic };

    if (onProgress) {
      onProgress(`Đang tạo ${item.count} câu ${item.type} (${item.level})...`);
    }

    let got: string[] = [];
    try {
      got = await generateNBlocksStrict(item.type, item.count, itemParams, item.level);
    } catch (e: any) {
      errors.push(`${item.type}-${item.level}: ${e.message}`);
      got = [];
    }

    if (!got.length) {
      for (let j = 0; j < item.count; j++) {
        all.push(syntheticBlock(item.type, all.length + 1, item.topic, item.level));
      }
    } else {
      all.push(...got);
    }
  }

  if (errors.length) console.warn('Generation errors:', errors.join('; '));
  return all;
}

function extractBalancedBraces(text: string, startPos: number) {
  let depth = 0, start = -1;
  for (let i = startPos; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (text[i] === '}') {
      depth--;
      if (depth === 0) return { content: text.substring(start, i), endPos: i };
    }
  }
  return null;
}

function extractChoices(text: string, commandName: string) {
  const pattern = new RegExp('\\\\' + commandName + '\\s*\\{', 'g');
  const match = pattern.exec(text);
  if (!match) return null;
  const choices = [];
  let pos = match.index + match[0].length - 1;
  for (let i = 0; i < 4; i++) {
    const result = extractBalancedBraces(text, pos);
    if (!result) return null;
    choices.push(result.content);
    pos = result.endPos + 1;
    while (pos < text.length && /\s/.test(text[pos])) pos++;
    if (i < 3 && text[pos] !== '{') return null;
  }
  return choices;
}

function formatWordStyleFromLatex(content: string) {
  let s = (content || '').trim();
  s = enforceInlineDollar(s);
  s = s.replace(/```latex\s*/g, '').replace(/```\s*$/g, '');

  const first = s.indexOf('\\begin{ex}');
  const last = s.lastIndexOf('\\end{ex}');
  if (first !== -1 && last !== -1 && last >= first) {
    s = s.slice(first, last + '\\end{ex}'.length);
  }

  let qn = 1;
  s = s.replace(/\\begin\{ex\}([\s\S]*?)\\end\{ex\}/g, (m, inner) => {
    let out = 'Câu ' + qn + '. ';
    const cm = inner.match(/%Câu\s+\d+:\s*(.+?)(?:\n|$)/);
    if (cm) inner = inner.replace(/%Câu\s+\d+:.+?(?:\n|$)/, '');
    const main = inner.replace(/\\(choiceTF|choice|shortans|loigiai)[\s\S]*/g, '').trim();
    if (cm) out += '[' + cm[1] + '] ';
    out += main + '\n';

    const mcChoices = extractChoices(inner, 'choice');
    if (mcChoices) {
      const A = mcChoices[0], B = mcChoices[1], C = mcChoices[2], D = mcChoices[3];
      let idx = -1;
      for (let i2 = 0; i2 < mcChoices.length; i2++) {
        if (/\\True\b/.test(mcChoices[i2])) { idx = i2; break; }
      }
      const correct = idx >= 0 ? String.fromCharCode(65 + idx) : '?';
      out += '\nA. ' + A.replace(/\\True\s*/g, '') +
             '\nB. ' + B.replace(/\\True\s*/g, '') +
             '\nC. ' + C.replace(/\\True\s*/g, '') +
             '\nD. ' + D.replace(/\\True\s*/g, '') +
             '\n(Đáp án: ' + correct + ')\n';
    }

    const tfChoices = extractChoices(inner, 'choiceTF');
    if (tfChoices) {
      const a = tfChoices[0], b = tfChoices[1], c = tfChoices[2], d = tfChoices[3];
      const rights = [];
      if (/\\True\b/.test(a)) rights.push('a');
      if (/\\True\b/.test(b)) rights.push('b');
      if (/\\True\b/.test(c)) rights.push('c');
      if (/\\True\b/.test(d)) rights.push('d');
      out += '\na) ' + a.replace(/\\True\s*/g, '') +
             '\nb) ' + b.replace(/\\True\s*/g, '') +
             '\nc) ' + c.replace(/\\True\s*/g, '') +
             '\nd) ' + d.replace(/\\True\s*/g, '') +
             '\n(Đúng: ' + (rights.join(', ') || '—') + ')\n';
    }

    const saMatch = inner.match(/\\shortans\s*\{/);
    if (saMatch) {
      const pos = inner.indexOf('\\shortans') + saMatch[0].length - 1;
      const result = extractBalancedBraces(inner, pos);
      if (result) out += '\nĐáp án: ' + result.content + '\n';
    }

    const solMatch = inner.match(/\\loigiai\s*\{/);
    if (solMatch) {
      const pos2 = inner.indexOf('\\loigiai') + solMatch[0].length - 1;
      const result2 = extractBalancedBraces(inner, pos2);
      if (result2) {
        out += '\nLời giải: ' + result2.content.replace(/\\\\/g, '\n').trim() + '\n';
      }
    }

    qn++;
    return out + '\n';
  });

  const time = new Date().toLocaleString('vi-VN');
  return '====================================\n' +
         'ĐỀ THI WORD FORMAT - GEMINI 2.5 (No TikZ)\n' +
         'Generated: ' + time + '\n' +
         '====================================\n\n' +
         s.trim() + '\n';
}

export const subjectPrompts = {
  toán: {
    expert: 'chuyên gia biên soạn đề thi toán học',
    principles: `- Giữ nguyên cấu trúc toán học và phương pháp giải\n- Thay đổi số liệu, biến số, tham số một cách logic\n- Đảm bảo tính khả thi và có nghiệm hợp lý\n- Độ khó tương đương với đề gốc\n- Format LaTeX cho công thức (bọc trong $)\n- Giữ nguyên format trắc nghiệm nếu đề gốc là trắc nghiệm`
  },
  hóa: {
    expert: 'chuyên gia biên soạn đề thi hóa học',
    principles: `- Giữ nguyên nguyên lý hóa học và cơ chế phản ứng\n- Thay đổi chất phản ứng, nồng độ, khối lượng hợp lý\n- Đảm bảo tuân thủ định luật bảo toàn khối lượng\n- Sử dụng ký hiệu hóa học chính xác\n- Kiểm tra tính khả thi của phản ứng\n- Đơn vị đo lường chuẩn (mol, g, M, %)`
  },
  anh: {
    expert: 'chuyên gia biên soạn đề thi tiếng Anh',
    principles: `- Giữ nguyên cấu trúc ngữ pháp và mức độ từ vựng\n- Thay đổi từ vựng, ngữ cảnh một cách tự nhiên\n- Đảm bảo tính chuẩn xác về mặt ngữ pháp\n- Văn phong phù hợp với trình độ học sinh\n- Tránh lỗi chính tả và ngữ pháp\n- Câu hỏi rõ ràng, không gây nhầm lẫn`
  }
};

export async function extractTextFromImage(base64Image: string) {
  const base64Data = base64Image.split(',')[1] || base64Image;
  const mimeTypeMatch = base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
  
  const prompt = `Hãy gõ lại [CHÍNH XÁC] toàn bộ nội dung trong ảnh thành văn bản.
  Yêu cầu:
  1. Giữ nguyên định dạng gốc (câu hỏi, đáp án, bảng biểu...)
  2. Công thức toán học viết dưới dạng LaTeX, bọc trong dấu $
  3. Không bỏ sót bất kỳ thông tin nào
  4. Nếu có hình vẽ, mô tả ngắn gọn: [Hình vẽ: mô tả]
  5. Giữ nguyên cấu trúc câu hỏi trắc nghiệm (A, B, C, D) nếu có
  Chỉ trả về nội dung văn bản, không thêm giải thích.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        }
      ]
    });
    return response.text || '';
  } catch (error: any) {
    console.error("Image extraction error:", error);
    throw new Error("Lỗi trích xuất ảnh: " + error.message);
  }
}

export async function generateSimilar(params: any) {
  const { originalProblem, numProblems, difficulty, problemType, includeSolutions, specificRequirements, subject } = params;
  const subj = subjectPrompts[subject as keyof typeof subjectPrompts] || subjectPrompts['toán'];

  const prompt = `Bạn là ${subj.expert}. Hãy tạo ${numProblems} bài ${subject.toUpperCase()} TƯƠNG TỰ dựa trên đề bài gốc:

====== ĐỀ BÀI GỐC ======
${originalProblem}
=========================

THÔNG SỐ TẠO BÀI:
1. **Số lượng bài**: ${numProblems} bài
2. **Độ khó**: ${difficulty}
3. **Dạng bài**: ${problemType}
4. **Môn học**: ${subject.toUpperCase()}
5. **Kèm lời giải**: ${includeSolutions ? 'CÓ' : 'KHÔNG'}
6. **Yêu cầu đặc biệt**: ${specificRequirements || 'Không có'}

NGUYÊN TẮC TẠO BÀI:
${subj.principles}

FORMAT CHUẨN:
${includeSolutions ? `
**Bài ${numProblems > 1 ? '[số]' : ''}:**
[Đề bài tương tự]

**Lời giải:**
[Lời giải chi tiết]

**Đáp án:** [đáp án cuối cùng]
---
` : `
**Bài ${numProblems > 1 ? '[số]' : ''}:**
[Đề bài tương tự]
---
`}

Hãy tạo ${numProblems} bài tập theo format trên.`;

  return await callGeminiWithRetry([{ role: 'user', content: prompt }], { model: 'flash', temperature: 0.7 });
}

export async function solveProblem(params: any) {
  const { originalProblem, subject } = params;
  const subj = subjectPrompts[subject as keyof typeof subjectPrompts] || subjectPrompts['toán'];

  const prompt = `Bạn là ${subj.expert}. Hãy cung cấp BÀI GIẢI HOÀN CHỈNH cho đề ${subject.toUpperCase()} sau để giáo viên có thể sử dụng trực tiếp:

====== ĐỀ BÀI CẦN GIẢI ======
${originalProblem}
=============================

YÊU CẦU BÀI GIẢI:
- Lời giải chi tiết, từng bước rõ ràng.
- Sử dụng định dạng LaTeX cho các công thức toán học/hóa học (bọc trong $...$).
- Kết luận đáp án rõ ràng ở cuối.

FORMAT BÀI GIẢI CHUẨN:
## LỜI GIẢI
[Trình bày lời giải chi tiết]

Vậy [kết luận đáp án].

## ĐÁP ÁN
[Kết quả cuối cùng]
`;

  return await callGeminiWithRetry([{ role: 'user', content: prompt }], { model: 'pro', temperature: 0.2 });
}

export async function generateFullExam7791(params: ExamParams, onProgress?: (msg: string) => void) {
  const blocks = await generateByPlan(params, onProgress);

  for (let i = 0; i < blocks.length; i++) {
    const t = classifyBlock(blocks[i]);
    const v = validateBlockByType(blocks[i], t);
    if (!v.isValid) {
      try {
        const fixed = await repairSingleBlock(blocks[i], t, params.model);
        const v2 = validateBlockByType(fixed, t);
        blocks[i] = v2.isValid ? fixed : syntheticBlock(t, i + 1, 'Đại số', 'NB');
      } catch (e) {
        blocks[i] = syntheticBlock(t, i + 1, 'Đại số', 'NB');
      }
    }
  }

  const joined = enforceInlineDollar(blocks.join('\n\n'));
  const time = new Date().toLocaleString('vi-VN');
  const counts = countByType(blocks);
  const header =
`% ====================================
% ĐỀ THI — GEMINI 2.5 (No TikZ)
% Cơ cấu: MCQ ${counts.MCQ} | TF ${counts.TF} | SA ${counts.SA}  (Tổng ${blocks.length})
% Generated: ${time}
% ====================================\n\n`;

  if (params.outputFormat === 'word') {
    const content = formatWordStyleFromLatex(joined);
    return {
      success: true,
      format: 'word',
      content: content,
      counts: counts,
      totalBlocks: blocks.length,
      timestamp: new Date().toISOString()
    };
  }
  return {
    success: true,
    format: 'latex',
    content: header + joined,
    counts: counts,
    totalBlocks: blocks.length,
    timestamp: new Date().toISOString()
  };
}
