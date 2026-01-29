export interface GitHubProfile {
  name: string | null;
  avatar: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  profileUrl: string;
  createdAt: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  date: string;
  additions: number;
  deletions: number;
  files_changed: number;
}

export interface LanguageBreakdown {
  [language: string]: number;
}

export interface RepoData {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  commits: GitHubCommit[];
  languages: LanguageBreakdown;
  lastPushed: string;
  topics: string[];
}

export interface GitHubData {
  username: string;
  profile: GitHubProfile;
  repos: RepoData[];
  totalCommits: number;
  languageDistribution: LanguageBreakdown;
  topLanguages: string[];
  commitActivity: {
    total: number;
    avgPerRepo: number;
    avgAdditions: number;
    avgDeletions: number;
  };
  techStack: string[];
  fetchedAt: string;
}

export interface ResumeBullet {
  id: string;
  text: string;
  category: 'Architecture' | 'Feature' | 'Quality' | 'Tooling';
  tech: string[];
  confidence: 'low' | 'medium' | 'high';
}

export interface GenerateResponse {
  success: boolean;
  bullets: ResumeBullet[];
  mode: GenerateMode;
  username: string;
  generatedAt: string;
}

export type GenerateMode = 'standard' | 'technical' | 'impact' | 'entry';

export type AppState = 'idle' | 'loading-github' | 'loading-ai' | 'success' | 'error';

export interface AppError {
  title: string;
  message: string;
  type: 'github' | 'ai' | 'network';
}
