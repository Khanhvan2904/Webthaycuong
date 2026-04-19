export const getTikzSnippetsForTopic = (topic: string): string => {
  // In a real application, you might use a sophisticated search or a fixed set.
  // For the requested lesson plan, here are some generic examples to guide Gemini.
  return `
% Example: Triangle ABC
\\begin{tikzpicture}[line join=round, line cap=round, >=stealth, scale=1]
\\coordinate (A) at (0,3);
\\coordinate (B) at (-2,0);
\\coordinate (C) at (3,0);
\\draw (A)--(B)--(C)--cycle;
\\tkzDrawPoints(A,B,C)
\\tkzLabelPoints[above](A)
\\tkzLabelPoints[left](B)
\\tkzLabelPoints[right](C)
\\end{tikzpicture}

% Example: Two equal triangles
\\begin{tikzpicture}[line join=round, line cap=round, >=stealth, scale=1]
\\coordinate (A) at (0,2);
\\coordinate (B) at (-2,0);
\\coordinate (C) at (1,0);
\\draw (A)--(B)--(C)--cycle;
\\tkzDrawPoints(A,B,C)
\\tkzLabelPoints[above](A)
\\tkzLabelPoints[left](B)
\\tkzLabelPoints[right](C)

\\begin{scope}[xshift=4cm]
\\coordinate (A') at (0,2);
\\coordinate (B') at (-2,0);
\\coordinate (C') at (1,0);
\\draw (A')--(B')--(C')--cycle;
\\tkzDrawPoints(A',B',C')
\\tkzLabelPoints[above](A')
\\tkzLabelPoints[left](B')
\\tkzLabelPoints[right](C')
\\end{scope}
\\end{tikzpicture}
  `;
};
