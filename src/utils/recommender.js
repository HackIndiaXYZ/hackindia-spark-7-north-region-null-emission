const RECOMMENDATIONS = {
  simple_qa: ['claude-3-haiku', 'gpt-3.5-turbo'],
  summarization: ['gemini-1.5-flash', 'claude-3-haiku'],
  coding: ['claude-3-sonnet', 'gemini-1.5-flash'],
  creative: ['gemini-1.5-flash', 'claude-3-sonnet'],
  reasoning: ['claude-3-sonnet', 'gemini-1.5-pro'],
  other: ['gpt-3.5-turbo', 'gemini-1.5-flash']
};

export function recommendModel(taskType, currentModel, coefficients) {
  const candidates = RECOMMENDATIONS[taskType] || RECOMMENDATIONS.other;
  const recommended = candidates.find(m => m !== currentModel) || candidates[0];
  
  const currentCoeff = coefficients.find(c => c.model === currentModel);
  const recommendedCoeff = coefficients.find(c => c.model === recommended);
  
  if (!currentCoeff || !recommendedCoeff) {
    return { model: recommended, savings: 0, provider: '' };
  }
  
  const currentCo2 = currentCoeff.co2_grams;
  const recommendedCo2 = recommendedCoeff.co2_grams;
  const savings = currentCo2 > 0 
    ? Math.round(((currentCo2 - recommendedCo2) / currentCo2) * 100)
    : 0;
  
  return {
    model: recommended,
    provider: recommendedCoeff.provider,
    savings: Math.max(0, savings)
  };
}