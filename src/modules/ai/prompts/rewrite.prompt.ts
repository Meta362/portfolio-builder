// src/modules/ai/prompts/rewrite.prompt.ts
export const rewriteContentPrompt = (data: {
  content: string;
  tone: 'professional' | 'casual' | 'creative' | 'technical';
  language: 'km' | 'en';
  improvements?: string[];
}): string => {
  const lang = data.language === 'km' ? 'Khmer' : 'English';
  const toneMap = {
    professional: 'formal and professional',
    casual: 'friendly and conversational',
    creative: 'creative and inspiring',
    technical: 'technical and precise'
  };
  
  let prompt = `Rewrite the following content in ${lang} language with a ${toneMap[data.tone]} tone.\n\n`;
  prompt += `Original Content:\n${data.content}\n\n`;
  
  if (data.improvements && data.improvements.length > 0) {
    prompt += `\nAreas to improve:\n`;
    data.improvements.forEach(imp => {
      prompt += `- ${imp}\n`;
    });
  }
  
  prompt += `\nRequirements:
1. Maintain the core message
2. Improve clarity and flow
3. Use natural language
4. Keep the same length (approximately)
5. Only return the rewritten content, no additional text

Rewritten Content:`;
  
  return prompt;
};