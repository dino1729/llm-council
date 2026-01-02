import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import './Stage3.css';

function ChevronIcon({ isExpanded }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease',
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// Preprocess text to convert various LaTeX delimiters to standard $ and $$ format
function preprocessMath(text) {
  if (!text) return text;

  let result = text;

  // Convert \[ ... \] to $$ ... $$ (display math)
  // Ensure display math is on its own lines for reliable parsing
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, (match, content) => {
    return '\n$$' + content.trim() + '$$\n';
  });

  // Convert \( ... \) to $ ... $ (inline math)
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, (match, content) => {
    return '$' + content.trim() + '$';
  });

  // Convert [ ... ] containing LaTeX commands to $ ... $ (inline math)
  // Only match if it contains backslash commands (to avoid matching regular brackets)
  result = result.replace(/\[\s*(\\[a-zA-Z]+[^\]]*?)\s*\]/g, (match, content) => {
    return '$' + content.trim() + '$';
  });

  // Normalize $$ display math blocks: collapse blank lines after opening $$ and before closing $$
  // This handles LLMs that output $$\n\nequation\n\n$$ format
  result = result.replace(/\$\$[ \t]*\n\n+/g, '$$\n');
  result = result.replace(/\n\n+[ \t]*\$\$/g, '\n$$');

  return result;
}

export default function Stage3({ finalResponse }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!finalResponse) {
    return null;
  }

  const chairmanName = finalResponse.model.split('/')[1] || finalResponse.model;

  return (
    <div className={`stage stage3 ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="stage-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <ChevronIcon isExpanded={isExpanded} />
        <h3 className="stage-title">Stage 3: Final Council Answer</h3>
        <span className="stage-summary">
          Chairman: {chairmanName}
        </span>
      </button>

      <div className="stage-content">
        <div className="final-response">
          <div className="chairman-label">
            Chairman: {chairmanName}
          </div>
          <div className="final-text markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{preprocessMath(finalResponse.response)}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
