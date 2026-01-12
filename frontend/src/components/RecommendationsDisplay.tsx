import { ArrowRight, ExternalLink, CheckCircle2, History, Plus, RefreshCw, Music, Mail, X } from 'lucide-react';
import { Recommendation } from '../App';
import { useState } from 'react';
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

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
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);

  const handleStartListening = () => {
    setShowListeningModal(true);
  };

  const handleSpotifyPlaylist = () => {
    // In a real app, this would integrate with Spotify API to create a playlist
    alert('Spotify playlist feature coming soon! This would create a playlist with these 5 albums.');
    setShowListeningModal(false);
  };

  const handleEmailRecommendations = async () => {
    setEmailLoading(true);
    setEmailMessage(null);

    try {
      const response = await fetch(API_ENDPOINTS.emailRecommendations, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          recommendations: recommendations.map(rec => ({
            title: rec.title,
            artist: rec.artist,
            year: rec.year,
            reason: rec.reason,
            spotifyLink: rec.spotifyLink,
            coverImage: rec.coverImage,
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setEmailMessage(data.message || 'Recommendations sent to your email!');

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowListeningModal(false);
        setEmailMessage(null);
      }, 2000);
    } catch (error) {
      console.error('Email error:', error);
      setEmailMessage(error instanceof Error ? error.message : 'Failed to send email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
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
              <div className="flex flex-col md:flex-row gap-6">
                {/* Column 1: Album Cover with Number Badge */}
                <div className="flex-shrink-0" style={{position: 'relative', width: '192px', height: '192px'}}>
                  {/* Album Cover Image */}
                  {rec.coverImage ? (
                    <img
                      src={rec.coverImage}
                      alt={`${rec.title} album cover`}
                      style={{width: '192px', height: '192px', objectFit: 'cover'}}
                      className="border-2 border-white"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`bg-[#303030] border-2 border-white flex items-center justify-center ${rec.coverImage ? 'hidden' : ''}`} style={{width: '192px', height: '192px'}}>
                    <Music className="w-16 h-16 text-gray-600" />
                  </div>

                  {/* Number Badge on top-left corner of cover */}
                  <div style={{position: 'absolute', top: '0', left: '0', width: '40px', height: '40px', zIndex: 10}} className="bg-white text-black flex items-center justify-center text-xl font-bold border-2 border-white">
                    {index + 1}
                  </div>
                </div>

                {/* Column 2: All text content */}
                <div className="flex-1 space-y-2">
                  {/* Title */}
                  <h2 className="text-white uppercase tracking-wide text-base font-bold">{rec.title}</h2>

                  {/* Artist */}
                  <p className="text-gray-400 text-sm">{rec.artist}</p>

                  {/* Year */}
                  <p className="text-gray-500 text-xs">{rec.year}</p>

                  {/* Summary/Reason */}
                  <p className="text-gray-300 text-sm leading-relaxed pt-1">
                    {rec.reason}
                  </p>

                  {/* Spotify Link */}
                  {rec.spotifyLink && (
                    <a
                      href={rec.spotifyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#ff0055] hover:text-white transition-colors text-sm uppercase tracking-wide pt-1"
                    >
                      Listen on Spotify
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
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
                  disabled={emailLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-4 uppercase tracking-wider hover:bg-[#ff0055] hover:text-white transition-all border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black border-t-transparent animate-spin rounded-full" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      Email Recommendations
                    </>
                  )}
                </button>
              </div>

              {emailMessage && (
                <div className={`p-4 border-2 ${emailMessage.includes('Failed') || emailMessage.includes('error') ? 'border-red-500 bg-red-900/20' : 'border-green-500 bg-green-900/20'}`}>
                  <p className={`text-sm text-center uppercase tracking-wide ${emailMessage.includes('Failed') || emailMessage.includes('error') ? 'text-red-300' : 'text-green-300'}`}>
                    {emailMessage}
                  </p>
                </div>
              )}

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