import { GitHubData, GenerateResponse, GenerateMode } from '../types';

// Use environment variable for API base URL, fallback to /api for dev proxy
const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public type: 'github' | 'ai' | 'network'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchGitHubData(username: string): Promise<GitHubData> {
  try {
    const response = await fetch(`${API_BASE}/github/${encodeURIComponent(username)}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(
        data.message || 'Failed to fetch GitHub data',
        response.status,
        'github'
      );
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error. Please check your connection.', 0, 'network');
  }
}

export async function generateBullets(
  githubData: GitHubData,
  mode: GenerateMode
): Promise<GenerateResponse> {
  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ githubData, mode }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(
        data.message || 'Failed to generate resume bullets',
        response.status,
        'ai'
      );
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Network error. Please check your connection.', 0, 'network');
  }
}

// Cache utilities
const CACHE_PREFIX = 'resumegit:';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function getCachedData<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!cached) return null;
    
    const entry: CacheEntry<T> = JSON.parse(cached);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
}

export function setCachedData<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch {
    // Ignore localStorage errors
  }
}

export function clearAllCache(): void {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
}
