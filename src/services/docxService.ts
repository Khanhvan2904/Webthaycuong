import { LessonPlan, AIConfig } from '../types';
import { convertMarkdownToDocx } from './api';

interface RenderedImage {
  base64: string;
  width: number;
  height: number;
}

export class DocxService {
  
  public async generateLessonPlanDocx(
    plan: LessonPlan, 
    images: Map<string, RenderedImage>,
    config: AIConfig
  ): Promise<Blob> {
    let md = "";

    // --- HEADER ---
    md += `**KẾ HOẠCH DẠY HỌC MINH HỌA TÍCH HỢP GIÁO DỤC AI VÀO MÔN HỌC**\n\n`;
    md += `**KẾ HOẠCH BÀI DẠY (TÍCH HỢP GIÁO DỤC AI)**\n\n`;
    md += `**TÊN BÀI: ${plan.topic.toUpperCase()}**\n\n`;
    md += `**MÔN HỌC/HOẠT ĐỘNG GIÁO DỤC: ${config.subject.toUpperCase()} – LỚP: ${config.grade}**\n\n`;
    md += `Thời gian thực hiện: ${plan.duration}\n\n`;

    // --- GDPT Requirements ---
    md += `Yêu cầu cần đạt trong Chương trình GDPT 2018:\n\n`;
    (plan.gdpt_requirements || []).forEach((r: string) => md += `- ${r}\n`);
    md += `\n`;

    // --- I. MỤC TIÊU ---
    md += `## I. Mục tiêu (tích hợp giáo dục AI)\n\n`;
    
    md += `**1. Về năng lực môn học:**\n`;
    (plan.objectives?.subject_competence || []).forEach((o: string) => md += `- ${o}\n`);
    md += `\n`;

    md += `**2. Về phẩm chất:**\n`;
    (plan.objectives?.qualities || []).forEach((o: string) => md += `- ${o}\n`);
    md += `\n`;

    md += `***Tích hợp giáo dục AI**\n`;
    (plan.objectives?.ai_integration || []).forEach((o: string) => md += `- ${o}\n`);
    md += `\n`;

    // --- II. THIẾT BỊ ---
    md += `## II. Thiết bị dạy học và học liệu\n\n`;
    
    (plan.equipment?.teacher || []).forEach((t: string) => md += `${t}\n`);
    (plan.equipment?.student || []).forEach((s: string) => md += `${s}\n`);
    md += `\n`;

    md += `***Công cụ số và AI (triển khai linh hoạt theo điều kiện)**\n\n`;
    
    if (plan.equipment?.ai_tools_mode) {
        md += `${plan.equipment.ai_tools_mode.no_ai}\n\n`;
        md += `${plan.equipment.ai_tools_mode.with_ai}\n\n`;
    }

    // --- III. TIẾN TRÌNH ---
    md += `## III. Tiến trình dạy học\n\n`;

    const procedure = plan.procedure || [];
    for (let i = 0; i < procedure.length; i++) {
        const act = procedure[i];
        
        md += `### ${act.name} (${act.time})\n\n`;
        
        md += `*Mục tiêu:* ${act.objective}\n\n`;
        
        md += `*Nội dung:*\n\n`;
        let content = act.content || '';
        const imgKey = `activity_${i}`;
        
        if (images.has(imgKey)) {
             content = content.replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, '');
             md += `${content}\n\n`;
             const img = images.get(imgKey)!;
             md += `![](data:image/png;base64,${img.base64}){width=${img.width}px height=${img.height}px}\n\n`;
        } else {
             md += `${content}\n\n`;
        }

        if (act.product) {
            md += `*Sản phẩm:*\n\n${act.product}\n\n`;
        }

        md += `*Tổ chức thực hiện:*\n\n${act.organization}\n\n`;
        md += `***\n\n`;
    }

    // --- IV. APPENDICES ---
    const appendices = plan.appendices || [];
    if (appendices.length > 0) {
        md += `## PHỤ LỤC\n\n`;
        for (let i = 0; i < appendices.length; i++) {
            const app = appendices[i];
            md += `### ${app.title}\n\n`;
            
            let content = app.content || '';
            const imgKey = `appendix_${i}`;
            
            if (images.has(imgKey)) {
                 content = content.replace(/\\begin\{tikzpicture\}[\s\S]*?\\end\{tikzpicture\}/g, '');
                 md += `${content}\n\n`;
                 const img = images.get(imgKey)!;
                 md += `![](data:image/png;base64,${img.base64}){width=${img.width}px height=${img.height}px}\n\n`;
            } else {
                 md += `${content}\n\n`;
            }
            md += `***\n\n`;
        }
    }

    // --- RUBRIC ---
    const rubric = plan.rubric || [];
    if (rubric.length > 0) {
        md += `## ĐÁNH GIÁ (RUBRIC)\n\n`;
        md += `| Tiêu chí | Mức Tốt | Mức Khá | Mức Đạt |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;
        rubric.forEach((r: any) => {
            md += `| **${r.criteria}** | ${r.level3} | ${r.level2} | ${r.level1} |\n`;
        });
        md += `\n\n`;
    }

    return await convertMarkdownToDocx(md);
  }
}
