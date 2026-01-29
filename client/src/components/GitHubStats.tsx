import { Star, GitFork, Calendar, Code, GitCommit, TrendingUp } from 'lucide-react';
import { GitHubData } from '../types';

interface GitHubStatsProps {
  data: GitHubData;
}

export function GitHubStats({ data }: GitHubStatsProps) {
  const totalStars = data.repos.reduce((sum, repo) => sum + repo.stars, 0);
  const totalForks = data.repos.reduce((sum, repo) => sum + repo.forks, 0);

  // Get top 5 languages by percentage
  const topLanguages = Object.entries(data.languageDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Language colors (subset of GitHub's language colors)
  const languageColors: Record<string, string> = {
    'JavaScript': '#f7df1e',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C#': '#239120',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Ruby': '#701516',
    'PHP': '#4F5D95',
    'Swift': '#F05138',
    'Kotlin': '#A97BFF',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Shell': '#89e051',
    'Vue': '#41b883',
    'Dart': '#00B4AB',
  };

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={data.profile.avatar} 
            alt={data.username}
            className="w-16 h-16 rounded-full ring-2 ring-slate-700"
          />
          <div>
            <h3 className="font-bold text-white text-lg">
              {data.profile.name || data.username}
            </h3>
            <a 
              href={data.profile.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 text-sm"
            >
              @{data.username}
            </a>
          </div>
        </div>

        {data.profile.bio && (
          <p className="text-slate-400 text-sm mb-4">{data.profile.bio}</p>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <GitCommit className="w-3 h-3" />
              Commits (90d)
            </div>
            <div className="text-2xl font-bold text-white">{data.totalCommits}</div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Code className="w-3 h-3" />
              Repos Analyzed
            </div>
            <div className="text-2xl font-bold text-white">{data.repos.length}</div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Star className="w-3 h-3" />
              Total Stars
            </div>
            <div className="text-2xl font-bold text-white">{totalStars}</div>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <GitFork className="w-3 h-3" />
              Total Forks
            </div>
            <div className="text-2xl font-bold text-white">{totalForks}</div>
          </div>
        </div>
      </div>

      {/* Languages Card */}
      <div className="card">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Code className="w-4 h-4 text-indigo-400" />
          Language Breakdown
        </h4>
        
        <div className="space-y-3">
          {topLanguages.map(([language, percentage]) => (
            <div key={language}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{language}</span>
                <span className="text-slate-500">{percentage}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: languageColors[language] || '#6366f1'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack Card */}
      <div className="card">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Detected Tech Stack
        </h4>
        
        <div className="flex flex-wrap gap-2">
          {data.techStack.map((tech) => (
            <span 
              key={tech}
              className="badge badge-primary"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Activity Summary */}
      <div className="card">
        <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          Activity Summary
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Avg. commits/repo</span>
            <span className="text-slate-200">{data.commitActivity.avgPerRepo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Avg. lines added/commit</span>
            <span className="text-emerald-400">+{data.commitActivity.avgAdditions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Avg. lines removed/commit</span>
            <span className="text-red-400">-{data.commitActivity.avgDeletions}</span>
          </div>
        </div>
      </div>

      {/* Top Repos */}
      <div className="card">
        <h4 className="font-semibold text-white mb-4">Top Repositories</h4>
        
        <div className="space-y-3">
          {data.repos.slice(0, 3).map((repo) => (
            <a
              key={repo.name}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <div className="font-medium text-slate-200 truncate">{repo.name}</div>
              {repo.description && (
                <div className="text-slate-500 text-xs mt-1 truncate">{repo.description}</div>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: languageColors[repo.language] || '#6366f1' }}
                    />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {repo.stars}
                </span>
                <span className="flex items-center gap-1">
                  <GitCommit className="w-3 h-3" />
                  {repo.commits.length}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
