import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, BorderStyle, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import { IntegratedItem } from '../types';

export const exportToWord = async (results: IntegratedItem[], subject: string, gradeLevel: string) => {
  if (!results || results.length === 0) return;

  const tableHeaderColor = "E0F2F1";
  const borderColor = "009688"; 

  const tableHeader = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 25, type: WidthType.PERCENTAGE },
        shading: { fill: tableHeaderColor },
        children: [new Paragraph({ children: [new TextRun({ text: "Nội dung gốc", bold: true })], alignment: AlignmentType.CENTER })],
      }),
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE },
        shading: { fill: tableHeaderColor },
        children: [new Paragraph({ children: [new TextRun({ text: "Hoạt động đề xuất", bold: true })], alignment: AlignmentType.CENTER })],
      }),
      new TableCell({
        width: { size: 10, type: WidthType.PERCENTAGE },
        shading: { fill: tableHeaderColor },
        children: [new Paragraph({ children: [new TextRun({ text: "Mã NLS", bold: true })], alignment: AlignmentType.CENTER })],
      }),
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: { fill: tableHeaderColor },
        children: [new Paragraph({ children: [new TextRun({ text: "Lý do & Chỉ báo", bold: true })], alignment: AlignmentType.CENTER })],
      }),
    ],
  });

  const tableRows = results.map(item => {
    return new TableRow({
      children: [
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          children: [new Paragraph(item.originalContent)],
        }),
        new TableCell({
          width: { size: 35, type: WidthType.PERCENTAGE },
          children: [new Paragraph(item.suggestion)],
        }),
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          children: [new Paragraph({ text: item.nlsCode, alignment: AlignmentType.CENTER })],
        }),
        new TableCell({
          width: { size: 30, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "Chỉ báo: ", bold: true, size: 20 }),
                new TextRun({ text: item.nlsIndicator, italics: true, size: 20 })
              ]
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: "Lý giải: ", bold: true, size: 20 }),
                new TextRun({ text: item.reasoning, size: 20 })
              ]
            })
          ],
        }),
      ],
    });
  });

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
    },
    rows: [tableHeader, ...tableRows],
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: `BẢNG TÍCH HỢP NĂNG LỰC SỐ`,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Môn học: ${subject}`, bold: true }),
            new TextRun({ text: "\n" }),
            new TextRun({ text: `Cấp độ: ${gradeLevel}`, bold: true }),
          ],
          spacing: { after: 400 }
        }),
        table
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const cleanSubject = subject.replace(/[^a-zA-Z0-9]/g, "_");
  
  saveAs(blob, `Tich_Hop_NLS_${cleanSubject}.docx`);
};
