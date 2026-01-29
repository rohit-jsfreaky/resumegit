import { Github, Cpu, FileText, CheckCircle } from 'lucide-react';

interface LoadingStateProps {
  stage: 'github' | 'ai';
}

const steps = [
  { id: 'github', label: 'Fetching repos', icon: Github },
  { id: 'analyze', label: 'Analyzing commits', icon: Cpu },
  { id: 'generate', label: 'Crafting bullets', icon: FileText },
  { id: 'done', label: 'Almost there...', icon: CheckCircle },
];

export function LoadingState({ stage }: LoadingStateProps) {
  const currentIndex = stage === 'github' ? 0 : 2;
  
  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="card">
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-6 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentIndex;
            const isComplete = index < currentIndex;
            
            return (
              <div 
                key={step.id}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isActive ? 'text-indigo-400' : 
                  isComplete ? 'text-emerald-400' : 
                  'text-slate-600'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-indigo-500/20' : 
                  isComplete ? 'bg-emerald-500/20' : 
                  'bg-slate-800'
                }`}>
                  <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                </div>
                <span className={`font-medium ${isActive ? 'text-slate-200' : ''}`}>
                  {step.label}
                </span>
                {isComplete && (
                  <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                )}
                {isActive && (
                  <div className="ml-auto flex gap-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Fun Loading Message */}
        <p className="text-center text-slate-500 text-sm mt-6 italic">
          {stage === 'github' 
            ? "Teaching AI to read your commits..." 
            : "Converting 'fix bug' into 'Architected robust error handling'..."
          }
        </p>
      </div>
    </div>
  );
}
