import { Router, Request, Response } from 'express';
import NodeCache from 'node-cache';
import { GitHubService } from '../services/github.js';

const router = Router();
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// Validate GitHub username
const isValidUsername = (username: string): boolean => {
  const regex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  return regex.test(username);
};

// GET /api/github/:username
router.get('/:username', async (req: Request, res: Response) => {
  try {
    const { username } = req.params;
    
    // Validate username
    if (!username || !isValidUsername(username)) {
      return res.status(400).json({ 
        error: 'Invalid username',
        message: 'Please provide a valid GitHub username' 
      });
    }

    // Check cache first
    const cacheKey = `github:${username.toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`📦 Cache hit for ${username}`);
      return res.json(cached);
    }

    console.log(`🔍 Fetching GitHub data for ${username}`);
    const githubService = new GitHubService(process.env.GITHUB_TOKEN);
    const data = await githubService.getUserData(username);
    
    // Cache the result
    cache.set(cacheKey, data);
    
    res.json(data);
  } catch (error: any) {
    console.error('GitHub API error:', error.message);
    
    if (error.message.includes('not found') || error.status === 404) {
      return res.status(404).json({ 
        error: 'User not found',
        message: `We couldn't find the GitHub user "${req.params.username}". Check spelling?` 
      });
    }
    
    if (error.message.includes('rate limit') || error.status === 403) {
      return res.status(429).json({ 
        error: 'Rate limited',
        message: 'GitHub API is temporarily busy. Please try again in a few minutes.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch GitHub data',
      message: error.message 
    });
  }
});

export { router as githubRouter };
