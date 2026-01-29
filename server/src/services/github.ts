import { 
  GitHubUser, 
  GitHubRepo, 
  GitHubCommit, 
  GitHubData, 
  RepoData,
  LanguageBreakdown 
} from '../types/index.js';

export class GitHubService {
  private baseUrl = 'https://api.github.com';
  private headers: HeadersInit;

  constructor(token?: string) {
    this.headers = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ResumeGit/1.0',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async fetch<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: this.headers
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      if (response.status === 403) {
        throw new Error('Rate limit exceeded');
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  async getUserData(username: string): Promise<GitHubData> {
    // Fetch user profile
    const user = await this.fetch<GitHubUser>(`/users/${username}`);
    
    // Fetch repos sorted by most recently pushed (get more for better analysis)
    const repos = await this.fetch<GitHubRepo[]>(
      `/users/${username}/repos?sort=pushed&direction=desc&per_page=30`
    );

    // Use top 10 most active repos for comprehensive analysis
    const activeRepos = repos.slice(0, 10);

    // Calculate 90 days ago
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const sinceDate = ninetyDaysAgo.toISOString();

    // Fetch detailed data for each repo
    const repoDataPromises = activeRepos.map(repo => 
      this.getRepoData(username, repo, sinceDate)
    );
    
    const repoData = await Promise.all(repoDataPromises);

    // Aggregate language distribution
    const languageDistribution = this.aggregateLanguages(repoData);
    
    // Calculate total commits
    const totalCommits = repoData.reduce((sum, repo) => sum + repo.commits.length, 0);
    
    // Get top languages
    const topLanguages = Object.entries(languageDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang);

    // Calculate commit activity stats
    const allCommits = repoData.flatMap(repo => repo.commits);
    const avgAdditions = allCommits.length > 0 
      ? Math.round(allCommits.reduce((sum, c) => sum + c.additions, 0) / allCommits.length)
      : 0;
    const avgDeletions = allCommits.length > 0
      ? Math.round(allCommits.reduce((sum, c) => sum + c.deletions, 0) / allCommits.length)
      : 0;

    // Infer tech stack from languages and topics
    const techStack = this.inferTechStack(repoData, topLanguages);

    return {
      username: user.login,
      profile: {
        name: user.name,
        avatar: user.avatar_url,
        bio: user.bio,
        publicRepos: user.public_repos,
        followers: user.followers,
        profileUrl: user.html_url,
        createdAt: user.created_at
      },
      repos: repoData,
      totalCommits,
      languageDistribution,
      topLanguages,
      commitActivity: {
        total: totalCommits,
        avgPerRepo: repoData.length > 0 ? Math.round(totalCommits / repoData.length) : 0,
        avgAdditions,
        avgDeletions
      },
      techStack,
      fetchedAt: new Date().toISOString()
    };
  }

  private async getRepoData(
    username: string, 
    repo: GitHubRepo, 
    sinceDate: string
  ): Promise<RepoData> {
    // Fetch commits for the repo
    let commits: GitHubCommit[] = [];
    try {
      const rawCommits = await this.fetch<any[]>(
        `/repos/${username}/${repo.name}/commits?author=${username}&since=${sinceDate}&per_page=30`
      );
      
      // Get detailed commit info for each (limited to first 10 for performance)
      const detailedCommitPromises = rawCommits.slice(0, 10).map(async (commit) => {
        try {
          const detailed = await this.fetch<any>(`/repos/${username}/${repo.name}/commits/${commit.sha}`);
          return {
            sha: commit.sha,
            message: commit.commit.message.split('\n')[0], // First line only
            date: commit.commit.author.date,
            additions: detailed.stats?.additions || 0,
            deletions: detailed.stats?.deletions || 0,
            files_changed: detailed.files?.length || 0
          };
        } catch {
          return {
            sha: commit.sha,
            message: commit.commit.message.split('\n')[0],
            date: commit.commit.author.date,
            additions: 0,
            deletions: 0,
            files_changed: 0
          };
        }
      });
      
      commits = await Promise.all(detailedCommitPromises);
    } catch {
      // Ignore commit fetch errors (empty repos, etc.)
    }

    // Fetch languages for the repo
    let languages: LanguageBreakdown = {};
    try {
      languages = await this.fetch<LanguageBreakdown>(`/repos/${username}/${repo.name}/languages`);
    } catch {
      // Ignore language fetch errors
    }

    return {
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      commits,
      languages,
      lastPushed: repo.pushed_at,
      topics: repo.topics || []
    };
  }

  private aggregateLanguages(repos: RepoData[]): LanguageBreakdown {
    const aggregate: LanguageBreakdown = {};
    
    repos.forEach(repo => {
      Object.entries(repo.languages).forEach(([lang, bytes]) => {
        aggregate[lang] = (aggregate[lang] || 0) + bytes;
      });
    });

    // Convert to percentages
    const total = Object.values(aggregate).reduce((sum, val) => sum + val, 0);
    const percentages: LanguageBreakdown = {};
    
    Object.entries(aggregate).forEach(([lang, bytes]) => {
      percentages[lang] = Math.round((bytes / total) * 100 * 10) / 10;
    });

    return percentages;
  }

  private inferTechStack(repos: RepoData[], topLanguages: string[]): string[] {
    const stack = new Set<string>();

    // Add top languages
    topLanguages.forEach(lang => stack.add(lang));

    // Infer frameworks from topics and repo names
    const allTopics = repos.flatMap(r => r.topics);
    const allNames = repos.map(r => r.name.toLowerCase());
    const allDescriptions = repos.map(r => r.description?.toLowerCase() || '');

    const techPatterns: Record<string, string[]> = {
      'React': ['react', 'reactjs', 'next', 'nextjs', 'gatsby'],
      'Vue': ['vue', 'vuejs', 'nuxt', 'nuxtjs'],
      'Angular': ['angular', 'angularjs'],
      'Node.js': ['node', 'nodejs', 'express', 'fastify', 'nestjs'],
      'Python': ['python', 'django', 'flask', 'fastapi'],
      'Docker': ['docker', 'container', 'kubernetes', 'k8s'],
      'AWS': ['aws', 'lambda', 's3', 'dynamodb'],
      'GraphQL': ['graphql', 'apollo'],
      'MongoDB': ['mongodb', 'mongoose'],
      'PostgreSQL': ['postgres', 'postgresql', 'prisma'],
      'Redis': ['redis'],
      'TypeScript': ['typescript', 'ts'],
      'Tailwind CSS': ['tailwind', 'tailwindcss'],
      'REST API': ['api', 'rest', 'restful']
    };

    const searchText = [...allTopics, ...allNames, ...allDescriptions].join(' ').toLowerCase();
    
    Object.entries(techPatterns).forEach(([tech, patterns]) => {
      if (patterns.some(p => searchText.includes(p))) {
        stack.add(tech);
      }
    });

    return Array.from(stack).slice(0, 10);
  }
}
