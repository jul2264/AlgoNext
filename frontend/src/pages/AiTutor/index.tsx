import { Bot } from 'lucide-react';

export function AiTutorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
      <div className="bg-bg-elevated border border-border-default rounded-2xl p-12 max-w-2xl text-center shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-accent-primary opacity-20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-accent-secondary opacity-20 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-accent-primary to-accent-secondary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <Bot size={48} className="text-white transform -rotate-3" />
          </div>
          
          <h1 className="text-4xl font-bold text-text-primary mb-4 tracking-tight">
            AI Tutor is Coming Soon
          </h1>
          
          <p className="text-text-secondary text-lg max-w-2xl mx-auto leading-relaxed">
            Get ready for a personalized learning experience. The AlgoNext AI Tutor will analyze your code, hint at optimal approaches, and adapt the DSA perfectly to your skill level.
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 border border-accent-primary/20 text-accent-primary rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse"></span>
            In active development
          </div>
        </div>
      </div>
    </div>
  );
}
