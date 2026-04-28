export function classifyPrompt(text) {
  const lower = text.toLowerCase().trim();
  
  if (/write code|function|debug|error|syntax|implement|refactor|class\s|def\s|const\s|import\s/.test(lower)) {
    return 'coding';
  }
  if (/summarize|tldr|tl;dr|key points|brief|recap|overview of/.test(lower)) {
    return 'summarization';
  }
  if (/write a story|poem|creative|imagine|fiction|narrative|once upon/.test(lower)) {
    return 'creative';
  }
  if (/explain|why|how does|compare|analyze|difference between|what causes|reasoning/.test(lower)) {
    return 'reasoning';
  }
  
  const wordCount = lower.split(/\s+/).length;
  if (wordCount < 15 && lower.includes('?')) {
    return 'simple_qa';
  }
  
  return 'other';
}

export const TASK_TYPE_LABELS = {
  simple_qa: 'Simple Q&A',
  coding: 'Coding',
  creative: 'Creative',
  reasoning: 'Reasoning',
  summarization: 'Summarization',
  other: 'Other'
};

export const TASK_TYPE_COLORS = {
  simple_qa: '#7fff00',
  coding: '#00d4ff',
  creative: '#ff6b9d',
  reasoning: '#ffa726',
  summarization: '#ab47bc',
  other: '#78909c'
};