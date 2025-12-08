import { ArrowRight, ExternalLink, CheckCircle2, History, Plus } from 'lucide-react';
import { Recommendation } from '../App';

interface RecommendationsDisplayProps {
  recommendations: Recommendation[];
  onCaptureExperience: () => void;
  onViewHistory: () => void;
  onStartNew: () => void;
  onStartNewRound?: (direction: 'reinforced' | 'pivot', analysis: { reinforcedThemes?: string; strategicPivot?: string }) => void;
}

export function RecommendationsDisplay({ recommendations, onCaptureExperience }: RecommendationsDisplayProps) {
  return (
    <div className="min-h-screen px-4 py-12 bg-[#1a1a1a] relative overflow-hidden">
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1639060015191-9d83063eab2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwbWFwJTIwbmF2aWdhdGlvbnxlbnwxfHx8fDE3NjQ5NTEwNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Futuristic map"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/95 to-[#1a1a1a]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3 border-b-4 border-[#ff0055] pb-6">
          <h1 className="text-white uppercase tracking-tight">Your Recommendations</h1>
          <p className="text-gray-400 uppercase tracking-wide text-sm">
            {recommendations.length} albums curated for your journey
          </p>
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {recommendations.map((rec, index) => (
            <div
              key={rec.id}
              className="bg-[#202020] border-2 border-white p-6 hover:border-[#ff0055] transition-colors"
            >
              <div className="flex gap-6">
                {/* Album Cover Image */}
                {rec.coverImage && (
                  <div className="flex-shrink-0">
                    <img 
                      src={rec.coverImage} 
                      alt={`${rec.title} album cover`}
                      className="w-32 h-32 object-cover border-2 border-white"
                    />
                  </div>
                )}
                
                <div className="flex gap-4 flex-1">
                  {/* Number Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white text-black flex items-center justify-center text-xl font-bold">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div>
                      <h2 className="text-white uppercase tracking-wide">{rec.title}</h2>
                      <p className="text-gray-400">{rec.artist} • {rec.year}</p>
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed">
                      {rec.reason}
                    </p>

                    {rec.reviewLink && (
                      <a
                        href={rec.reviewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#ff0055] hover:text-white transition-colors text-sm uppercase tracking-wide"
                      >
                        Read Review
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center pt-8">
          <button
            onClick={onCaptureExperience}
            className="flex items-center gap-2 bg-[#ff0055] text-white px-12 py-4 uppercase tracking-wider hover:bg-white hover:text-black transition-all border-2 border-[#ff0055]"
          >
            Capture Listening Experience
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}