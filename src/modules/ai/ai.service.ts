// src/modules/ai/ai.service.ts
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { AiRepository } from './ai.repository';
import { GenerateAboutDto } from './dto/generate-about.dto';
import { RewriteContentDto } from './dto/rewrite-content.dto';
import { ScorePortfolioDto } from './dto/score-portfolio.dto';
import { TranslateDto } from './dto/translate.dto';
import { PortfolioService } from '../portfolios/portfolio.service';
import { generateAboutMePrompt } from './prompts/about-me.prompt';
import { rewriteContentPrompt } from './prompts/rewrite.prompt';
import { scorePortfolioPrompt } from './prompts/score.prompt';
import { translateContentPrompt } from './prompts/translate.prompt';
import { BadRequestException, InternalServerException, NotFoundException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private aiRepository: AiRepository;
  private portfolioService: PortfolioService;
  private isMockMode: boolean = false;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      logger.warn('⚠️ GEMINI_API_KEY is not configured. Running in mock mode.');
      this.isMockMode = true;
      this.aiRepository = new AiRepository();
      this.portfolioService = new PortfolioService();
      return;
    }
    
    // Check if API key starts with AIza (Gemini API) or AQ (AI Studio/Vertex AI)
    if (!apiKey.startsWith('AIza') && !apiKey.startsWith('AQ')) {
      logger.warn('⚠️ GEMINI_API_KEY appears to be invalid (should start with AIza or AQ). Running in mock mode.');
      this.isMockMode = true;
      this.aiRepository = new AiRepository();
      this.portfolioService = new PortfolioService();
      return;
    }
    
    logger.info('✅ Gemini API key found (type: ' + (apiKey.startsWith('AIza') ? 'Gemini API' : 'AI Studio/Vertex AI') + ')');
    
    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Use gemini-3.5-flash (stable) for best performance
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-3.5-flash',
      });
      this.aiRepository = new AiRepository();
      this.portfolioService = new PortfolioService();
      logger.info('✅ Gemini AI service initialized with gemini-3.5-flash');
    } catch (error) {
      logger.error('❌ Failed to initialize Gemini AI:', error);
      logger.warn('⚠️ Running in mock mode due to initialization error.');
      this.isMockMode = true;
      this.aiRepository = new AiRepository();
      this.portfolioService = new PortfolioService();
    }
  }

  /**
   * Call Gemini API with retry logic for quota errors
   */
  private async callGeminiWithRetry(
    prompt: string,
    config: any,
    maxRetries: number = 3
  ): Promise<any> {
    if (this.isMockMode) {
      return this.getMockResponse(prompt);
    }

    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: config,
        });
        return result;
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a quota error
        if (error.message?.includes('429') || error.message?.includes('quota')) {
          const waitTime = Math.min(attempt * 5000, 30000);
          logger.warn(`Quota exceeded, retrying in ${waitTime/1000}s... (Attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }

  /**
   * Get mock response for development mode
   */
  private getMockResponse(prompt: string): any {
    logger.info('📝 Using mock AI response');
    
    if (prompt.includes('About Me')) {
      return {
        response: {
          text: () => `I am a passionate software developer with expertise in building scalable web applications. With a strong background in full-stack development, I specialize in creating innovative solutions that solve real-world problems. My technical skills include modern JavaScript frameworks, cloud architecture, and database design. I am committed to writing clean, maintainable code and continuously learning new technologies to stay at the forefront of the industry. I believe in the power of collaboration and enjoy working with cross-functional teams to deliver high-quality products. When I'm not coding, I enjoy contributing to open-source projects and mentoring junior developers. Let's build something amazing together!`,
          usageMetadata: { totalTokenCount: 150 }
        }
      };
    }
    
    if (prompt.includes('Rewrite')) {
      return {
        response: {
          text: () => `The original content has been refined to enhance clarity and impact. This version maintains the core message while improving readability and flow. The tone has been adjusted to be more professional and engaging.`,
          usageMetadata: { totalTokenCount: 100 }
        }
      };
    }
    
    if (prompt.includes('score')) {
      return {
        response: {
          text: () => JSON.stringify({
            score: 85,
            strengths: [
              'Strong technical skills across multiple domains',
              'Well-organized project documentation',
              'Clear career progression shown in experience'
            ],
            weaknesses: [
              'Could add more metrics and achievements',
              'Some sections need more detail'
            ],
            suggestions: [
              {
                section: 'projects',
                recommendation: 'Add metrics and impact for each project',
                priority: 4
              },
              {
                section: 'experience',
                recommendation: 'Include specific achievements with numbers',
                priority: 3
              }
            ],
            summary: 'A well-structured portfolio with strong technical foundation. Minor improvements in metrics and details would make it outstanding.'
          }),
          usageMetadata: { totalTokenCount: 200 }
        }
      };
    }
    
    if (prompt.includes('Translate')) {
      return {
        response: {
          text: () => `Content translated successfully.`,
          usageMetadata: { totalTokenCount: 80 }
        }
      };
    }
    
    return {
      response: {
        text: () => `AI response generated successfully.`,
        usageMetadata: { totalTokenCount: 50 }
      }
    };
  }

  /**
   * Generate About Me section
   */
  async generateAbout(userId: string, dto: GenerateAboutDto) {
    try {
      // Validate portfolioId
      if (!dto.portfolioId || dto.portfolioId.length !== 24) {
        throw new BadRequestException('Invalid portfolio ID. Must be a 24-character hex string.');
      }
      
      // Get portfolio - ប្តូរពី findById
      const portfolio = await this.portfolioService.findById(dto.portfolioId, userId);
      
      if (!portfolio) {
        throw new NotFoundException('Portfolio not found');
      }
      
      // Build context
      const context = {
        name: portfolio.title || 'User',
        title: portfolio.subtitle || '',
        skills: portfolio.skills?.map((s: any) => s.name) || [],
        experience: portfolio.experience || [],
        projects: portfolio.projects || [],
        education: portfolio.education || [],
        language: dto.language || 'en'
      };

      // Generate prompt
      const prompt = generateAboutMePrompt(context);
      logger.info(`Generating about me for portfolio: ${dto.portfolioId}`);

      // Create AI request record
      const request = await this.aiRepository.createRequest({
        userId,
        portfolioId: dto.portfolioId,
        type: 'generate_about',
        input: {
          prompt,
          context,
          language: dto.language || 'en'
        },
        performance: {
          duration: 0,
          model: this.isMockMode ? 'mock' : 'gemini-3.5-flash',
          temperature: 0.7
        },
        status: 'processing'
      });

      // Call Gemini API
      const startTime = Date.now();
      
      try {
        const result = await this.callGeminiWithRetry(prompt, {
          temperature: 0.7,
          maxOutputTokens: 500,
        });

        const duration = Date.now() - startTime;
        const response = result.response;
        const text = response.text();

        // Update request with result
        await this.aiRepository.updateRequest(request._id.toString(), {
          output: {
            content: text,
            metadata: {
              usage: response.usageMetadata
            }
          },
          cost: {
            tokens: response.usageMetadata?.totalTokenCount || 0,
            estimatedCost: (response.usageMetadata?.totalTokenCount || 0) * 0.00001
          },
          performance: {
            duration,
            model: this.isMockMode ? 'mock' : 'gemini-3.5-flash',
            temperature: 0.7
          },
          status: 'completed',
          completedAt: new Date()
        });

        logger.info(`About Me generated successfully for portfolio: ${dto.portfolioId}`);

        return {
          requestId: request._id,
          content: text,
          usage: response.usageMetadata
        };
      } catch (geminiError: any) {
        // Update request with failure
        await this.aiRepository.updateRequest(request._id.toString(), {
          status: 'failed',
          error: geminiError.message,
          completedAt: new Date()
        });
        
        throw geminiError;
      }
    } catch (error: any) {
      logger.error('Generate about error:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.status
      });
      
      // Check for specific errors
      if (error.message?.includes('API key')) {
        throw new BadRequestException('Invalid Gemini API key. Please check your configuration.');
      }
      if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        throw new BadRequestException('Gemini API quota exceeded. Please try again later.');
      }
      if (error.message?.includes('network') || error.message?.includes('connect')) {
        throw new InternalServerException('Network error connecting to Gemini API. Please try again.');
      }
      if (error.message?.includes('permission') || error.message?.includes('access')) {
        throw new BadRequestException('Access denied to Gemini API. Please check your credentials.');
      }
      if (error.message?.includes('model')) {
        throw new BadRequestException('Invalid model specified. Please check the model name.');
      }
      
      throw new InternalServerException(`Failed to generate about me: ${error.message}`);
    }
  }

  /**
   * Rewrite content
   */
  async rewriteContent(userId: string, dto: RewriteContentDto) {
    try {
      const prompt = rewriteContentPrompt({
        content: dto.content,
        tone: dto.tone || 'professional',
        language: dto.language || 'en',
        improvements: dto.improvements
      });

      // Create AI request record
      const request = await this.aiRepository.createRequest({
        userId,
        type: 'rewrite',
        input: {
          prompt,
          context: {
            content: dto.content,
            tone: dto.tone || 'professional',
            language: dto.language || 'en'
          }
        },
        performance: {
          duration: 0,
          model: this.isMockMode ? 'mock' : 'gemini-3.5-flash',
          temperature: 0.7
        },
        status: 'processing'
      });

      // Call Gemini API
      const startTime = Date.now();
      const result = await this.callGeminiWithRetry(prompt, {
        temperature: 0.7,
        maxOutputTokens: 800,
      });

      const duration = Date.now() - startTime;
      const response = result.response;
      const text = response.text();

      // Update request
      await this.aiRepository.updateRequest(request._id.toString(), {
        output: {
          content: text,
          metadata: {
            usage: response.usageMetadata
          }
        },
        cost: {
          tokens: response.usageMetadata?.totalTokenCount || 0,
          estimatedCost: (response.usageMetadata?.totalTokenCount || 0) * 0.00001
        },
        performance: {
          duration,
          model: this.isMockMode ? 'mock' : 'gemini-3.5-flash',
          temperature: 0.7
        },
        status: 'completed',
        completedAt: new Date()
      });

      return {
        requestId: request._id,
        content: text,
        usage: response.usageMetadata
      };
    } catch (error: any) {
      logger.error('Rewrite content error:', error);
      throw new InternalServerException(`Failed to rewrite content: ${error.message}`);
    }
  }

  /**
   * Score portfolio
   */
  async scorePortfolio(userId: string, dto: ScorePortfolioDto) {
    try {
      // Validate portfolioId
      if (!dto.portfolioId || dto.portfolioId.length !== 24) {
        throw new BadRequestException('Invalid portfolio ID. Must be a 24-character hex string.');
      }
      
      // Get portfolio - ប្តូរពី findById
      const portfolio = await this.portfolioService.findById(dto.portfolioId, userId);
      
      if (!portfolio) {
        throw new NotFoundException('Portfolio not found');
      }
      
      const prompt = scorePortfolioPrompt({
        title: portfolio.title,
        about: portfolio.about || '',
        skills: portfolio.skills || [],
        projects: portfolio.projects || [],
        experience: portfolio.experience || [],
        education: portfolio.education || [],
        language: dto.language || 'en'
      });

      // Create AI request record
      const request = await this.aiRepository.createRequest({
        userId,
        portfolioId: dto.portfolioId,
        type: 'score',
        input: {
          prompt,
          context: {
            portfolioId: dto.portfolioId,
            language: dto.language || 'en'
          }
        },
        performance: {
          duration: 0,
          model: this.isMockMode ? 'mock' : 'gemini-3.5-flash',
          temperature: 0.5
        },
        status: 'processing'
      });

      // Call Gemini API
      const startTime = Date.now();
      const result = await this.callGeminiWithRetry(prompt, {
        temperature: 0.5,
        maxOutputTokens: 1000,
      });

      const duration = Date.now() - startTime;
      const response = result.response;
      const text = response.text();

      // Parse JSON response
      let scoreData;
      try {
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          scoreData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (error) {
        logger.error('Failed to parse score response:', error);
        scoreData = {
          score: 0,
          strengths: [],
          weaknesses: [],
          suggestions: [],
          summary: 'Unable to analyze portfolio'
        };
      }

      // Update request
      await this.aiRepository.updateRequest(request._id.toString(), {
        output: {
          content: text,
          metadata: {
            scoreData,
            usage: response.usageMetadata
          }
        },
        cost: {
          tokens: response.usageMetadata?.totalTokenCount || 0,
          estimatedCost: (response.usageMetadata?.totalTokenCount || 0) * 0.00001
        },
        performance: {
          duration,
          model: this.isMockMode ? 'mock' : 'gemini-3.5-flash',
          temperature: 0.5
        },
        status: 'completed',
        completedAt: new Date()
      });

      return {
        requestId: request._id,
        score: scoreData,
        usage: response.usageMetadata
      };
    } catch (error: any) {
      logger.error('Score portfolio error:', error);
      throw new InternalServerException(`Failed to score portfolio: ${error.message}`);
    }
  }

  /**
   * Translate content
   */
  async translateContent(userId: string, dto: TranslateDto) {
    try {
      const prompt = translateContentPrompt({
        content: dto.content,
        targetLanguage: dto.targetLanguage,
        sourceLanguage: dto.sourceLanguage
      });

      // Create AI request record
      const request = await this.aiRepository.createRequest({
        userId,
        type: 'translate',
        input: {
          prompt,
          context: {
            content: dto.content,
            targetLanguage: dto.targetLanguage,
            sourceLanguage: dto.sourceLanguage || 'auto'
          }
        },
        performance: {
          duration: 0,
          model: this.isMockMode ? 'mock' : 'gemini-3.5-flash',
          temperature: 0.3
        },
        status: 'processing'
      });

      // Call Gemini API
      const startTime = Date.now();
      const result = await this.callGeminiWithRetry(prompt, {
        temperature: 0.3,
        maxOutputTokens: 1000,
      });

      const duration = Date.now() - startTime;
      const response = result.response;
      const text = response.text();

      // Update request
      await this.aiRepository.updateRequest(request._id.toString(), {
        output: {
          content: text,
          metadata: {
            sourceLanguage: dto.sourceLanguage || 'auto',
            targetLanguage: dto.targetLanguage,
            usage: response.usageMetadata
          }
        },
        cost: {
          tokens: response.usageMetadata?.totalTokenCount || 0,
          estimatedCost: (response.usageMetadata?.totalTokenCount || 0) * 0.00001
        },
        performance: {
          duration,
          model: this.isMockMode ? 'mock' : 'gemini-3.5-flash',
          temperature: 0.3
        },
        status: 'completed',
        completedAt: new Date()
      });

      return {
        requestId: request._id,
        content: text,
        usage: response.usageMetadata
      };
    } catch (error: any) {
      logger.error('Translate content error:', error);
      throw new InternalServerException(`Failed to translate content: ${error.message}`);
    }
  }

  /**
   * Get AI usage stats
   */
  async getUsageStats(userId: string) {
    try {
      return await this.aiRepository.getUserUsageStats(userId);
    } catch (error: any) {
      logger.error('Get usage stats error:', error);
      throw new InternalServerException(`Failed to get usage stats: ${error.message}`);
    }
  }

  /**
   * Get AI request by ID
   */
  async getRequestById(userId: string, requestId: string) {
    try {
      const request = await this.aiRepository.getRequestById(requestId);
      if (!request || request.userId !== userId) {
        throw new BadRequestException('Request not found');
      }
      return request;
    } catch (error: any) {
      logger.error('Get request error:', error);
      throw error;
    }
  }
}