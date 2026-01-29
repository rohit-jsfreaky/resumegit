import { useState } from 'react';
import { X, Twitter, Linkedin, Link2, Copy, Check } from 'lucide-react';
import { ResumeBullet } from '../types';
import { useAppStore, getBulletText } from '../store/useAppStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface ShareModalProps {
  onClose: () => void;
  bullets: ResumeBullet[];
  username: string;
}

export function ShareModal({ onClose, bullets, username }: ShareModalProps) {
  const { editedBullets } = useAppStore();
  const [copied, setCopied] = useState(false);

  // Get the best bullet for sharing (highest confidence or first)
  const bestBullet = bullets.find(b => b.confidence === 'high') || bullets[0];
  const bulletText = bestBullet ? getBulletText(bestBullet, editedBullets) : '';

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://resumegit.dev';

  const tweetTemplates = [
    {
      label: 'Professional',
      text: `Just used AI to optimize my resume from my GitHub activity. The results speak for themselves:\n\n"${bulletText.slice(0, 100)}..."\n\nTry it yourself: ${siteUrl}`,
    },
    {
      label: 'Fun',
      text: `My GitHub commits said "fix typo" but my resume now says "${bulletText.slice(0, 80)}..." 😂\n\n${siteUrl}`,
    },
    {
      label: 'Technical',
      text: `Built a pipeline that turns GitHub activity into ATS-friendly resume bullets using AI.\n\nGenerated ${bullets.length} bullets for @${username}.\n\nTry it: ${siteUrl}`,
    },
  ];

  const [selectedTweet, setSelectedTweet] = useState(0);

  const shareToTwitter = () => {
    const text = encodeURIComponent(tweetTemplates[selectedTweet].text);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(siteUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Share Your Results</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tweet Templates */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-3">
            Choose a tweet template
          </label>
          <div className="space-y-2">
            {tweetTemplates.map((template, i) => (
              <button
                key={i}
                onClick={() => setSelectedTweet(i)}
                className={clsx(
                  'w-full p-3 text-left text-sm rounded-lg border transition-all',
                  selectedTweet === i
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-slate-200'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                )}
              >
                <span className="block font-medium mb-1">{template.label}</span>
                <span className="block text-xs opacity-75 line-clamp-2">
                  {template.text.slice(0, 120)}...
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={shareToTwitter}
            className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Twitter className="w-6 h-6 text-sky-400" />
            <span className="text-xs text-slate-400">Twitter/X</span>
          </button>
          
          <button
            onClick={shareToLinkedIn}
            className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Linkedin className="w-6 h-6 text-blue-400" />
            <span className="text-xs text-slate-400">LinkedIn</span>
          </button>
          
          <button
            onClick={copyLink}
            className="flex flex-col items-center gap-2 p-4 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {copied ? (
              <Check className="w-6 h-6 text-emerald-400" />
            ) : (
              <Link2 className="w-6 h-6 text-slate-400" />
            )}
            <span className="text-xs text-slate-400">Copy Link</span>
          </button>
        </div>

        {/* Copy Tweet Button */}
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(tweetTemplates[selectedTweet].text);
              toast.success('Tweet copied!');
            } catch {
              toast.error('Failed to copy');
            }
          }}
          className="w-full mt-4 btn btn-secondary gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy Tweet Text
        </button>
      </div>
    </div>
  );
}
