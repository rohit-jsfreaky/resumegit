import { Github, Heart, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';

export function Footer() {
  const { clearCache } = useAppStore();

  const handleClearData = () => {
    clearCache();
    toast.success('All cached data cleared!');
  };

  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 mt-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left - Branding */}
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-300">ResumeGit</span>
            <span>•</span>
            <span className="text-sm">Turn commits into career wins</span>
          </div>

          {/* Center - Privacy & Info */}
          <div className="text-center text-sm text-slate-500">
            <p className="flex items-center justify-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-400 fill-red-400" /> using
              <a 
                href="https://ai.google.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                Gemini AI
              </a>
              +
              <a 
                href="https://docs.github.com/en/rest" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300"
              >
                GitHub API
              </a>
            </p>
            <p className="mt-1 text-xs">
              🔒 We never store your code or resume data. Everything is processed in memory.
            </p>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleClearData}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              title="Clear all cached data"
            >
              <Trash2 className="w-4 h-4" />
              Delete My Data
            </button>
            
            <a
              href="https://github.com/yourusername/resumegit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Github className="w-4 h-4" />
              View Source
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-6 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} ResumeGit. Not affiliated with GitHub, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
