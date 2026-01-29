import { useState, FormEvent } from 'react';
import { Github, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { fetchGitHubData, generateBullets, getCachedData, setCachedData } from '../services/api';
import { LoadingState } from './LoadingState';
import { GitHubData, GenerateResponse } from '../types';

// GitHub username validation regex
const USERNAME_REGEX = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export function Hero() {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState('');
  
  const { 
    appState, 
    mode,
    error,
    setUsername,
    setGitHubData, 
    setBullets, 
    setAppState, 
    setError,
    setMode 
  } = useAppStore();

  const isLoading = appState === 'loading-github' || appState === 'loading-ai';

  const validateUsername = (value: string): boolean => {
    if (!value.trim()) {
      setValidationError('Please enter a GitHub username');
      return false;
    }
    if (!USERNAME_REGEX.test(value)) {
      setValidationError('Invalid GitHub username format');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const username = inputValue.trim();
    if (!validateUsername(username)) return;

    setUsername(username);
    setError(null);

    try {
      // Step 1: Fetch GitHub data
      setAppState('loading-github');
      
      // Check cache first
      const cacheKey = `github:${username.toLowerCase()}`;
      let githubData = getCachedData<GitHubData>(cacheKey);
      
      if (!githubData) {
        githubData = await fetchGitHubData(username);
        setCachedData(cacheKey, githubData);
      }
      
      setGitHubData(githubData);

      // Check for minimal activity
      if (githubData.totalCommits === 0) {
        setError({
          title: 'No Recent Activity',
          message: 'This user has no public commits in the last 90 days. Try a more active username.',
          type: 'github'
        });
        return;
      }

      // Step 2: Generate bullets with AI
      setAppState('loading-ai');
      
      // Check cache for generated bullets
      const bulletsCacheKey = `bullets:${username.toLowerCase()}:${mode}`;
      let response = getCachedData<GenerateResponse>(bulletsCacheKey);
      
      if (!response) {
        response = await generateBullets(githubData, mode);
        setCachedData(bulletsCacheKey, response);
      }
      
      setBullets(response.bullets);
      setAppState('success');
    } catch (err: any) {
      console.error('Error:', err);
      setError({
        title: err.type === 'github' ? 'GitHub Error' : 
               err.type === 'ai' ? 'Generation Error' : 'Network Error',
        message: err.message || 'Something went wrong. Please try again.',
        type: err.type || 'network'
      });
    }
  };

  return (
    <section className="py-12 md:py-20">
      {/* Logo and Tagline */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 rounded-full"></div>
            <div className="relative bg-gradient-to-br from-indigo-500 to-indigo-700 p-3 rounded-2xl">
              <Github className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            ResumeGit
          </h1>
        </div>
        <p className="text-slate-400 text-lg">
          Turn your commits into career wins
        </p>
      </div>

      {/* Headline */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
          Turn GitHub Commits into{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Job Offers
          </span>
        </h2>
        <p className="text-xl text-slate-400">
          AI converts your code contributions into recruiter-friendly resume bullets 
          optimized for ATS systems
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (validationError) validateUsername(e.target.value);
            }}
            placeholder="your-username"
            className="input pl-32 pr-4 py-4 text-lg"
            disabled={isLoading}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        
        {validationError && (
          <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {validationError}
          </p>
        )}

        {/* Mode Selector */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {(['standard', 'technical', 'impact', 'entry'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
              } disabled:opacity-50`}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)} Mode
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="btn btn-primary w-full mt-6 py-4 text-lg gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {appState === 'loading-github' ? 'Fetching repos...' : 'Crafting bullets...'}
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Resume Points
            </>
          )}
        </button>
      </form>

      {/* Loading State */}
      {isLoading && (
        <LoadingState stage={appState === 'loading-github' ? 'github' : 'ai'} />
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-xl mx-auto mt-8">
          <div className="card border-red-500/50 bg-red-950/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400">{error.title}</h3>
                <p className="text-slate-400 mt-1">{error.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
        <div className="card text-center">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Github className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">Public Repos Only</h3>
          <p className="text-slate-400 text-sm">
            We only access public data. Your private code stays private.
          </p>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="font-semibold text-white mb-2">ATS-Optimized</h3>
          <p className="text-slate-400 text-sm">
            Bullets formatted to pass Applicant Tracking Systems.
          </p>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h3 className="font-semibold text-white mb-2">Zero Storage</h3>
          <p className="text-slate-400 text-sm">
            We never store your data. Everything is processed in memory.
          </p>
        </div>
      </div>
    </section>
  );
}
