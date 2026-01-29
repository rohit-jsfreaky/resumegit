import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { RefreshCw, Download, Share2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { GitHubStats } from './GitHubStats';
import { BulletList } from './BulletList';
import { ExportPanel } from './ExportPanel';
import { ShareModal } from './ShareModal';
import { generateBullets, setCachedData } from '../services/api';
import { GenerateResponse } from '../types';
import clsx from 'clsx';

const modes = [
  { id: 'standard', label: 'Standard' },
  { id: 'technical', label: 'Technical Lead' },
  { id: 'impact', label: 'Impact-Focused' },
  { id: 'entry', label: 'Entry Level' },
] as const;

export function Results() {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  const { 
    githubData, 
    bullets, 
    mode, 
    setMode, 
    setBullets 
  } = useAppStore();

  if (!githubData) return null;

  const handleRegenerate = async (newMode: typeof mode) => {
    if (!githubData || isRegenerating) return;
    
    setIsRegenerating(true);
    setMode(newMode);
    
    try {
      const response = await generateBullets(githubData, newMode);
      const bulletsCacheKey = `bullets:${githubData.username.toLowerCase()}:${newMode}`;
      setCachedData<GenerateResponse>(bulletsCacheKey, response);
      setBullets(response.bullets);
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <section className="py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - GitHub Stats */}
        <div className="lg:w-1/3">
          <GitHubStats data={githubData} />
        </div>

        {/* Right Column - Bullets & Export */}
        <div className="lg:w-2/3">
          <div className="card">
            {/* Header with Mode Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-white">
                Generated Resume Bullets
              </h2>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRegenerate(mode)}
                  disabled={isRegenerating}
                  className="btn btn-ghost text-sm gap-2"
                >
                  <RefreshCw className={clsx('w-4 h-4', isRegenerating && 'animate-spin')} />
                  Regenerate
                </button>
                
                <button
                  onClick={() => setShowShareModal(true)}
                  className="btn btn-ghost text-sm gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Mode Selector */}
            <Tab.Group selectedIndex={modes.findIndex(m => m.id === mode)} onChange={(i) => handleRegenerate(modes[i].id)}>
              <Tab.List className="flex gap-1 p-1 bg-slate-800 rounded-lg mb-6">
                {modes.map((m) => (
                  <Tab
                    key={m.id}
                    disabled={isRegenerating}
                    className={({ selected }) => clsx(
                      'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all',
                      'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                      selected 
                        ? 'bg-indigo-600 text-white shadow' 
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700',
                      isRegenerating && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {m.label}
                  </Tab>
                ))}
              </Tab.List>
            </Tab.Group>

            {/* Bullets List */}
            <BulletList 
              bullets={bullets} 
              isLoading={isRegenerating}
            />

            {/* Tabs for Bullets and Export */}
            <div className="mt-8 border-t border-slate-800 pt-6">
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => setActiveTab(0)}
                  className={clsx(
                    'pb-2 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 0 
                      ? 'border-indigo-500 text-indigo-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  )}
                >
                  All Bullets
                </button>
                <button
                  onClick={() => setActiveTab(1)}
                  className={clsx(
                    'pb-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                    activeTab === 1 
                      ? 'border-indigo-500 text-indigo-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  )}
                >
                  <Download className="w-4 h-4" />
                  Export Options
                </button>
              </div>

              {activeTab === 1 && (
                <ExportPanel bullets={bullets} username={githubData.username} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          onClose={() => setShowShareModal(false)} 
          bullets={bullets}
          username={githubData.username}
        />
      )}
    </section>
  );
}
