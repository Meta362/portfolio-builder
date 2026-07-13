// src/modules/ai/prompts/about-me.prompt.ts
export const generateAboutMePrompt = (data: {
  name: string;
  title?: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    description: string;
  }>;
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
  }>;
  language: 'km' | 'en';
}): string => {
  const lang = data.language === 'km' ? 'Khmer' : 'English';
  
  let context = `Generate a professional "About Me" section for a portfolio in ${lang} language.\n\n`;
  context += `Person: ${data.name}\n`;
  if (data.title) context += `Title: ${data.title}\n`;
  
  if (data.skills.length > 0) {
    context += `\nSkills: ${data.skills.join(', ')}\n`;
  }
  
  if (data.experience.length > 0) {
    context += `\nExperience:\n`;
    data.experience.forEach(exp => {
      context += `- ${exp.position} at ${exp.company}: ${exp.description}\n`;
    });
  }
  
  if (data.projects.length > 0) {
    context += `\nProjects:\n`;
    data.projects.forEach(proj => {
      context += `- ${proj.title}: ${proj.description}`;
      if (proj.technologies.length > 0) {
        context += ` (${proj.technologies.join(', ')})`;
      }
      context += `\n`;
    });
  }
  
  if (data.education.length > 0) {
    context += `\nEducation:\n`;
    data.education.forEach(edu => {
      context += `- ${edu.degree} from ${edu.institution}`;
      if (edu.field) context += `, ${edu.field}`;
      context += `\n`;
    });
  }
  
  context += `\nRequirements:
1. Write in first person
2. Be professional and engaging
3. Highlight key skills and achievements
4. Show passion for the field
5. Length: 150-250 words
6. Use a friendly but professional tone
7. Include a call to action at the end

Generate only the About Me content, no additional text.`;
  
  return context;
};