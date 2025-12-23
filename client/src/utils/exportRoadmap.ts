import type { Roadmap } from '../types';

/**
 * Export a roadmap to PDF format
 * Uses the browser's print functionality for a clean PDF export
 */
export const exportToPDF = (roadmap: Roadmap): void => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  // Generate HTML content
  const html = generatePrintableHTML(roadmap);
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
  };
};

/**
 * Export a roadmap to JSON format
 */
export const exportToJSON = (roadmap: Roadmap): void => {
  const dataStr = JSON.stringify(roadmap, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `roadmap-${roadmap.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export roadmap to Markdown format
 */
export const exportToMarkdown = (roadmap: Roadmap): void => {
  const markdown = generateMarkdown(roadmap);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `roadmap-${roadmap.id}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const generatePrintableHTML = (roadmap: Roadmap): string => {
  const totalTopics = roadmap.weeks.reduce((acc, week) => acc + week.topics.length, 0);
  const completedTopics = roadmap.weeks.reduce(
    (acc, week) => acc + week.topics.filter(t => t.isCompleted).length,
    0
  );
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${roadmap.title} - Learning Roadmap</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1a202c;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 {
          color: #2b6cb0;
          margin-bottom: 8px;
          font-size: 28px;
        }
        h2 {
          color: #2d3748;
          margin-top: 32px;
          margin-bottom: 16px;
          font-size: 20px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
        }
        h3 {
          color: #4a5568;
          margin-top: 16px;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .subtitle {
          color: #718096;
          margin-bottom: 24px;
        }
        .meta {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .meta-item {
          background: #edf2f7;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
        }
        .meta-item strong {
          color: #2b6cb0;
        }
        .progress-bar {
          background: #e2e8f0;
          height: 8px;
          border-radius: 4px;
          margin-bottom: 8px;
          overflow: hidden;
        }
        .progress-fill {
          background: #48bb78;
          height: 100%;
          border-radius: 4px;
        }
        .progress-text {
          font-size: 14px;
          color: #718096;
          margin-bottom: 24px;
        }
        .week {
          margin-bottom: 32px;
          page-break-inside: avoid;
        }
        .week-header {
          background: #ebf8ff;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .week-goals {
          font-size: 14px;
          color: #4a5568;
          margin-top: 8px;
        }
        .topic {
          background: #f7fafc;
          border-left: 4px solid #4299e1;
          padding: 16px;
          margin-bottom: 12px;
          border-radius: 0 8px 8px 0;
        }
        .topic.completed {
          border-left-color: #48bb78;
          background: #f0fff4;
        }
        .topic-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .topic-name {
          font-weight: 600;
          color: #2d3748;
        }
        .topic-hours {
          font-size: 12px;
          color: #718096;
          background: white;
          padding: 4px 8px;
          border-radius: 4px;
        }
        .topic-description {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 8px;
        }
        .why-first {
          font-size: 13px;
          color: #718096;
          font-style: italic;
          margin-bottom: 8px;
        }
        .search-strings {
          font-size: 12px;
          color: #4a5568;
        }
        .search-string {
          background: #e2e8f0;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
          margin: 2px 4px 2px 0;
          font-family: monospace;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #a0aec0;
          text-align: center;
        }
        @media print {
          body {
            padding: 20px;
          }
          .week {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <h1>📚 ${roadmap.title}</h1>
      ${roadmap.description ? `<p class="subtitle">${roadmap.description}</p>` : ''}
      
      <div class="meta">
        <div class="meta-item">🎯 <strong>Goal:</strong> ${roadmap.targetGoal}</div>
        <div class="meta-item">⏰ <strong>${roadmap.hoursPerWeek}</strong> hrs/week</div>
        <div class="meta-item">📅 <strong>${roadmap.totalWeeks}</strong> weeks</div>
      </div>

      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercent}%"></div>
      </div>
      <p class="progress-text">${completedTopics}/${totalTopics} topics completed (${progressPercent}%)</p>

      <h2>📋 Current Skills</h2>
      <p>${roadmap.currentSkills}</p>

      ${roadmap.weeks
        .sort((a, b) => a.weekNumber - b.weekNumber)
        .map(week => `
          <div class="week">
            <div class="week-header">
              <h2>Week ${week.weekNumber}: ${week.title}</h2>
              ${week.description ? `<p>${week.description}</p>` : ''}
              <p class="week-goals"><strong>Goals:</strong> ${week.goals}</p>
            </div>
            
            ${week.topics
              .sort((a, b) => a.order - b.order)
              .map(topic => `
                <div class="topic ${topic.isCompleted ? 'completed' : ''}">
                  <div class="topic-header">
                    <span class="topic-name">${topic.isCompleted ? '✅' : '○'} ${topic.name}</span>
                    <span class="topic-hours">${topic.estimatedHours}h</span>
                  </div>
                  ${topic.description ? `<p class="topic-description">${topic.description}</p>` : ''}
                  <p class="why-first">💡 ${topic.whyThisFirst}</p>
                  <div class="search-strings">
                    🔍 Search: ${topic.searchStrings.map(s => `<span class="search-string">${s}</span>`).join('')}
                  </div>
                </div>
              `).join('')}
          </div>
        `).join('')}

      <div class="footer">
        Generated by Smart Learning Path Generator on ${new Date().toLocaleDateString()}
      </div>
    </body>
    </html>
  `;
};

const generateMarkdown = (roadmap: Roadmap): string => {
  const totalTopics = roadmap.weeks.reduce((acc, week) => acc + week.topics.length, 0);
  const completedTopics = roadmap.weeks.reduce(
    (acc, week) => acc + week.topics.filter(t => t.isCompleted).length,
    0
  );

  let md = `# 📚 ${roadmap.title}\n\n`;
  
  if (roadmap.description) {
    md += `${roadmap.description}\n\n`;
  }

  md += `## Overview\n\n`;
  md += `- **Goal:** ${roadmap.targetGoal}\n`;
  md += `- **Current Skills:** ${roadmap.currentSkills}\n`;
  md += `- **Duration:** ${roadmap.totalWeeks} weeks @ ${roadmap.hoursPerWeek} hours/week\n`;
  md += `- **Progress:** ${completedTopics}/${totalTopics} topics completed\n\n`;

  md += `---\n\n`;

  roadmap.weeks
    .sort((a, b) => a.weekNumber - b.weekNumber)
    .forEach(week => {
      md += `## Week ${week.weekNumber}: ${week.title}\n\n`;
      
      if (week.description) {
        md += `${week.description}\n\n`;
      }
      
      md += `**Goals:** ${week.goals}\n\n`;

      week.topics
        .sort((a, b) => a.order - b.order)
        .forEach(topic => {
          const checkbox = topic.isCompleted ? '[x]' : '[ ]';
          md += `### ${checkbox} ${topic.name}\n\n`;
          
          if (topic.description) {
            md += `${topic.description}\n\n`;
          }
          
          md += `- ⏱️ **Estimated time:** ${topic.estimatedHours} hours\n`;
          md += `- 💡 **Why now:** ${topic.whyThisFirst}\n`;
          md += `- 🔍 **Search strings:**\n`;
          topic.searchStrings.forEach(s => {
            md += `  - \`${s}\`\n`;
          });
          md += `\n`;
        });

      md += `---\n\n`;
    });

  md += `\n*Generated by Smart Learning Path Generator on ${new Date().toISOString().split('T')[0]}*\n`;

  return md;
};
