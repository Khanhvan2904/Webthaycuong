import { marked } from 'marked';

export const convertMarkdownToDocx = async (mdContent: string): Promise<Blob> => {
    // Parse the markdown string to HTML
    const htmlContent = await marked.parse(mdContent);
    
    // Wrap with Word-compatible HTML string
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Export HTML To Doc</title>
    <style>
      body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.5; }
      h1 { font-size: 24pt; font-weight: bold; text-align: center; }
      h2 { font-size: 18pt; font-weight: bold; margin-top: 20px; }
      h3 { font-size: 16pt; font-weight: bold; margin-top: 15px; }
      p { margin-bottom: 10px; text-align: justify; }
      table { border-collapse: collapse; width: 100%; margin: 20px 0; }
      th, td { border: 1px solid black; padding: 8px; }
    </style>
    </head><body>`;
    const postHtml = "</body></html>";
    const html = preHtml + htmlContent + postHtml;

    // Return as a Blob
    return new Blob(['\ufeff', html], {
        type: 'application/msword'
    });
};
