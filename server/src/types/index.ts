export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  created_at: string;
  topics: string[];
  default_branch: string;
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
  profile: {
    name: string | null;
    avatar: string;
    bio: string | null;
    publicRepos: number;
    followers: number;
    profileUrl: string;
    createdAt: string;
  };
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
