import { ArrowRight, ExternalLink, CheckCircle2, History, Plus, RefreshCw, Music, Mail, X } from 'lucide-react';
import { Recommendation } from '../App';
import { useState } from 'react';

interface RecommendationsDisplayProps {
  recommendations: Recommendation[];
  onCaptureExperience: () => void;
  onViewHistory: () => void;
  onStartNew: () => void;
  onStartNewRound?: (direction: 'reinforced' | 'pivot', analysis: { reinforcedThemes?: string; strategicPivot?: string }) => void;
  onGetNewRecommendations?: () => void;
}

export function RecommendationsDisplay({ 
  recommendations, 
  onCaptureExperience,
  onGetNewRecommendations 
}: RecommendationsDisplayProps) {
  const [showListeningModal, setShowListeningModal] = useState(false);

  const handleStartListening = () => {
    setShowListeningModal(true);
  };

  const handleSpotifyPlaylist = () => {
    // In a real app, this would integrate with Spotify API to create a playlist
    alert('Spotify playlist feature coming soon! This would create a playlist with these 5 albums.');
    setShowListeningModal(false);
  };

  const handleEmailRecommendations = () => {
    // In a real app, this would send an email with the recommendations
    alert('Email feature coming soon! This would email you the recommendations.');
    setShowListeningModal(false);
  };

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

        {/* CTA Buttons */}
        <div className="flex flex-col gap-4 pt-8">
          <button
            onClick={handleStartListening}
            className="flex items-center justify-center gap-2 bg-[#ff0055] text-white px-12 py-4 uppercase tracking-wider hover:bg-white hover:text-black transition-all border-2 border-[#ff0055]"
          >
            Start Listening Experience
            <ArrowRight className="w-5 h-5" />
          </button>

          {onGetNewRecommendations && (
            <button
              onClick={onGetNewRecommendations}
              className="flex items-center justify-center gap-2 bg-white text-black px-12 py-4 uppercase tracking-wider hover:bg-[#ff0055] hover:text-white transition-all border-2 border-white"
            >
              Get 5 New Recommendations
              <RefreshCw className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Listening Options Modal */}
      {showListeningModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-[#202020] border-4 border-white p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowListeningModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="space-y-6">
              <div className="border-b-2 border-[#ff0055] pb-4">
                <h2 className="text-white uppercase tracking-wide text-center">Start Your Listening Journey</h2>
                <p className="text-gray-400 text-sm text-center mt-2">
                  Choose how you'd like to receive your recommendations
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleSpotifyPlaylist}
                  className="w-full flex items-center justify-center gap-3 bg-[#ff0055] text-white px-8 py-4 uppercase tracking-wider hover:bg-white hover:text-black transition-all border-2 border-[#ff0055]"
                >
                  <Music className="w-5 h-5" />
                  Create Spotify Playlist
                </button>

                <button
                  onClick={handleEmailRecommendations}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-4 uppercase tracking-wider hover:bg-[#ff0055] hover:text-white transition-all border-2 border-white"
                >
                  <Mail className="w-5 h-5" />
                  Email Recommendations
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center uppercase tracking-wide">
                Come back later to capture your listening experience
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}