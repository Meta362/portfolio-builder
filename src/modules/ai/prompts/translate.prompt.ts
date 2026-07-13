// src/modules/ai/prompts/translate.prompt.ts
export const translateContentPrompt = (data: {
  content: string;
  targetLanguage: 'km' | 'en';
  sourceLanguage?: 'km' | 'en';
}): string => {
  const source = data.sourceLanguage || 'auto';
  const target = data.targetLanguage === 'km' ? 'Khmer' : 'English';
  
  return `Translate the following content from ${source} to ${target}.\n\nContent:\n${data.content}\n\nOnly return the translated content, no additional text.`;
};