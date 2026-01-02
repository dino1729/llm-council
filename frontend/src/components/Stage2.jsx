import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import './Stage2.css';

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

function deAnonymizeText(text, labelToModel) {
  if (!labelToModel) return text;

  let result = text;
  // Replace each "Response X" with the actual model name
  Object.entries(labelToModel).forEach(([label, model]) => {
    const modelShortName = model.split('/')[1] || model;
    result = result.replace(new RegExp(label, 'g'), `**${modelShortName}**`);
  });
  return result;
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

export default function Stage2({ rankings, labelToModel, aggregateRankings }) {
  const [activeTab, setActiveTab] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!rankings || rankings.length === 0) {
    return null;
  }

  // Get the winner from aggregate rankings for summary
  const winner = aggregateRankings && aggregateRankings.length > 0
    ? aggregateRankings[0].model.split('/')[1] || aggregateRankings[0].model
    : null;

  return (
    <div className={`stage stage2 ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <button
        className="stage-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <ChevronIcon isExpanded={isExpanded} />
        <h3 className="stage-title">Stage 2: Peer Rankings</h3>
        <span className="stage-summary">
          {winner ? `#1: ${winner}` : `${rankings.length} evaluations`}
        </span>
      </button>

      <div className="stage-content">
        <h4>Raw Evaluations</h4>
        <p className="stage-description">
          Each model evaluated all responses (anonymized as Response A, B, C, etc.) and provided rankings.
          Below, model names are shown in <strong>bold</strong> for readability, but the original evaluation used anonymous labels.
        </p>

        <div className="tabs">
          {rankings.map((rank, index) => (
            <button
              key={index}
              className={`tab ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {rank.model.split('/')[1] || rank.model}
            </button>
          ))}
        </div>

        <div className="tab-content">
          <div className="ranking-model">
            {rankings[activeTab].model}
          </div>
          <div className="ranking-content markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {preprocessMath(deAnonymizeText(rankings[activeTab].ranking, labelToModel))}
            </ReactMarkdown>
          </div>

          {rankings[activeTab].parsed_ranking &&
           rankings[activeTab].parsed_ranking.length > 0 && (
            <div className="parsed-ranking">
              <strong>Extracted Ranking:</strong>
              <ol>
                {rankings[activeTab].parsed_ranking.map((label, i) => (
                  <li key={i}>
                    {labelToModel && labelToModel[label]
                      ? labelToModel[label].split('/')[1] || labelToModel[label]
                      : label}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {aggregateRankings && aggregateRankings.length > 0 && (
          <div className="aggregate-rankings">
            <h4>Aggregate Rankings (Street Cred)</h4>
            <p className="stage-description">
              Combined results across all peer evaluations (lower score is better):
            </p>
            <div className="aggregate-list">
              {aggregateRankings.map((agg, index) => (
                <div key={index} className="aggregate-item">
                  <span className="rank-position">#{index + 1}</span>
                  <span className="rank-model">
                    {agg.model.split('/')[1] || agg.model}
                  </span>
                  <span className="rank-score">
                    Avg: {agg.average_rank.toFixed(2)}
                  </span>
                  <span className="rank-count">
                    ({agg.rankings_count} votes)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
