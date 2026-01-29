import { useState } from 'react';
import { Copy, Check, Edit3, X, AlertTriangle } from 'lucide-react';
import { ResumeBullet } from '../types';
import { useAppStore, getBulletText } from '../store/useAppStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface BulletListProps {
  bullets: ResumeBullet[];
  isLoading: boolean;
}

const categoryColors = {
  Architecture: 'badge-primary',
  Feature: 'badge-success',
  Quality: 'badge-info',
  Tooling: 'badge-warning',
};

const confidenceIcons = {
  high: { color: 'text-emerald-400', label: 'High confidence' },
  medium: { color: 'text-amber-400', label: 'Medium confidence' },
  low: { color: 'text-red-400', label: 'Low confidence - verify this' },
};

export function BulletList({ bullets, isLoading }: BulletListProps) {
  const { editedBullets, updateBulletText } = useAppStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const handleCopy = async (bullet: ResumeBullet) => {
    const text = getBulletText(bullet, editedBullets);
    try {
      await navigator.clipboard.writeText(`• ${text}`);
      setCopiedId(bullet.id);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleCopyAll = async () => {
    const allText = bullets
      .map(b => `• ${getBulletText(b, editedBullets)}`)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(allText);
      toast.success('All bullets copied!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const startEditing = (bullet: ResumeBullet) => {
    setEditingId(bullet.id);
    setEditText(getBulletText(bullet, editedBullets));
  };

  const saveEdit = (id: string) => {
    updateBulletText(id, editText);
    setEditingId(null);
    toast.success('Bullet updated!');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="shimmer rounded-lg h-24" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Copy All Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleCopyAll}
          className="btn btn-secondary text-sm gap-2"
        >
          <Copy className="w-4 h-4" />
          Copy All
        </button>
      </div>

      {/* Bullets */}
      <div className="space-y-4">
        {bullets.map((bullet) => {
          const isEditing = editingId === bullet.id;
          const isCopied = copiedId === bullet.id;
          const text = getBulletText(bullet, editedBullets);
          const confidenceInfo = confidenceIcons[bullet.confidence];

          return (
            <div 
              key={bullet.id}
              className={clsx(
                'group p-4 bg-slate-800/50 border border-slate-700 rounded-lg transition-all',
                'hover:border-slate-600 hover:bg-slate-800'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={clsx('badge', categoryColors[bullet.category])}>
                    {bullet.category}
                  </span>
                  
                  {/* Confidence indicator */}
                  <span 
                    className={clsx('text-xs flex items-center gap-1', confidenceInfo.color)}
                    title={confidenceInfo.label}
                  >
                    {bullet.confidence === 'low' && (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {bullet.confidence}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isEditing && (
                    <>
                      <button
                        onClick={() => startEditing(bullet)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopy(bullet)}
                        className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded"
                        title="Copy"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Content */}
              {isEditing ? (
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="input min-h-[80px] resize-y text-sm"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={cancelEdit}
                      className="btn btn-ghost text-sm gap-1"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(bullet.id)}
                      className="btn btn-primary text-sm gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="prose-bullet text-sm leading-relaxed">
                  • {text}
                </p>
              )}

              {/* Tech Tags */}
              {bullet.tech.length > 0 && !isEditing && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {bullet.tech.map((tech, i) => (
                    <span 
                      key={i}
                      className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {bullets.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No bullets generated yet. Enter a GitHub username to get started.
        </div>
      )}
    </div>
  );
}
