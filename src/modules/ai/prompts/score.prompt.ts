// src/modules/ai/prompts/score.prompt.ts
export const scorePortfolioPrompt = (data: {
  title: string;
  about: string;
  skills: any[];
  projects: any[];
  experience: any[];
  education: any[];
  language: 'km' | 'en';
}): string => {
  const lang = data.language === 'km' ? 'Khmer' : 'English';
  
  let prompt = `Analyze and score this portfolio in ${lang} language.\n\n`;
  prompt += `Title: ${data.title}\n`;
  prompt += `About: ${data.about}\n\n`;
  
  prompt += `Skills (${data.skills.length}):\n`;
  data.skills.forEach(s => {
    prompt += `- ${s.name} (${s.category}, proficiency: ${s.proficiency}/5)\n`;
  });
  
  prompt += `\nProjects (${data.projects.length}):\n`;
  data.projects.forEach(p => {
    prompt += `- ${p.title}: ${p.description}\n`;
  });
  
  prompt += `\nExperience (${data.experience.length}):\n`;
  data.experience.forEach(e => {
    prompt += `- ${e.position} at ${e.company}\n`;
  });
  
  prompt += `\nEducation (${data.education.length}):\n`;
  data.education.forEach(e => {
    prompt += `- ${e.degree} from ${e.institution}\n`;
  });
  
  prompt += `\nProvide a JSON response with:
{
  "score": number (0-100),
  "strengths": string[] (3-5 strengths),
  "weaknesses": string[] (2-4 weaknesses),
  "suggestions": [
    {
      "section": "skills" | "projects" | "experience" | "education" | "about",
      "recommendation": "string",
      "priority": 1-5
    }
  ],
  "summary": "string"
}

Only return the JSON, no additional text.`;
  
  return prompt;
};