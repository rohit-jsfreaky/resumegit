import { Router, Request, Response } from 'express';
import { GeminiService } from '../services/gemini.js';
import { GitHubData, GenerateMode } from '../types/index.js';

const router = Router();

// POST /api/generate
router.post('/', async (req: Request, res: Response) => {
  try {
    const { githubData, mode = 'standard' } = req.body as { 
      githubData: GitHubData; 
      mode: GenerateMode 
    };

    // Validate input
    if (!githubData || !githubData.username) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'GitHub data is required' 
      });
    }

    // Validate mode
    const validModes: GenerateMode[] = ['standard', 'technical', 'impact', 'entry'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({ 
        error: 'Invalid mode',
        message: `Mode must be one of: ${validModes.join(', ')}` 
      });
    }

    // Check for Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Configuration error',
        message: 'Gemini API key is not configured' 
      });
    }

    console.log(`🤖 Generating resume bullets for ${githubData.username} in ${mode} mode`);
    
    const geminiService = new GeminiService(process.env.GEMINI_API_KEY);
    const bullets = await geminiService.generateBullets(githubData, mode);

    res.json({ 
      success: true,
      bullets,
      mode,
      username: githubData.username,
      generatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Generation error:', error.message);
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({ 
        error: 'Timeout',
        message: 'AI is taking longer than expected. Please try again.' 
      });
    }

    res.status(500).json({ 
      error: 'Generation failed',
      message: error.message 
    });
  }
});

export { router as generateRouter };
