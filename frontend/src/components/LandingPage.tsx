import { Music, MapPin, TrendingUp, MessageCircle, Headphones, Compass } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onCaptureExperience?: () => void;
  user?: { name: string; email: string } | null;
  hasActiveRecommendations?: boolean;
}

export function LandingPage({ onStart, onCaptureExperience, user, hasActiveRecommendations }: LandingPageProps) {
  const showBothButtons = user && hasActiveRecommendations;
  
  // For debugging - log the state
  console.log('LandingPage Debug:', { user: !!user, hasActiveRecommendations, showBothButtons });
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#1a1a1a] relative overflow-hidden">
      {/* Background image with heavy overlay */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1639060015191-9d83063eab2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwbWFwJTIwbmF2aWdhdGlvbnxlbnwxfHx8fDE3NjQ5NTEwNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Futuristic map"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/95 to-[#1a1a1a]" />
      </div>
      
      <div className="max-w-4xl w-full space-y-8 sm:space-y-12 text-center relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-4 sm:mb-8">
          <Compass className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 text-white" />
        </div>

        {/* Title */}
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white uppercase tracking-tight border-b-4 border-[#ff0055] inline-block pb-2">
            Sonic Cartographer
          </h1>
          {showBothButtons ? (
            <p className="text-base sm:text-lg lg:text-xl text-[#ff0055] max-w-2xl mx-auto uppercase tracking-wide px-4">
              Welcome back! Ready to explore new territory?
            </p>
          ) : (
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4">
              Map your musical territory. Discover what you're missing.
              Navigate beyond the algorithm.
            </p>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
          <div className="bg-[#202020] border-2 border-white p-6 hover:border-[#ff0055] transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#ff0055] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white uppercase tracking-wide">Listener Portrait</h3>
            </div>
            <p className="text-sm text-gray-400">
              Analyze your music library to identify genres, geographic origins, and key eras
            </p>
          </div>

          <div className="bg-[#202020] border-2 border-white p-6 hover:border-[#ff0055] transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#ff0055] flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white uppercase tracking-wide">Discover Gaps</h3>
            </div>
            <p className="text-sm text-gray-400">
              Uncover missing genres, regions, and time periods in your musical landscape
            </p>
          </div>

          <div className="bg-[#202020] border-2 border-white p-6 hover:border-[#ff0055] transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#ff0055] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white uppercase tracking-wide">Guided Exploration</h3>
            </div>
            <p className="text-sm text-gray-400">
              Engage in thoughtful dialogue to plan your musical expansion journey
            </p>
          </div>

          <div className="bg-[#202020] border-2 border-white p-6 hover:border-[#ff0055] transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#ff0055] flex items-center justify-center flex-shrink-0">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white uppercase tracking-wide">Listen to new Music</h3>
            </div>
            <p className="text-sm text-gray-400">
              Get personalized recommendations to fill the gaps in your listening habits
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-[#202020] border-4 border-white p-8 mt-16 text-left max-w-2xl mx-auto">
          <h2 className="text-center mb-8 text-white uppercase tracking-wider border-b-2 border-[#ff0055] pb-4">How It Works</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-white text-black flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h4 className="text-white uppercase tracking-wide mb-1">Share Your Artists</h4>
                <p className="text-sm text-gray-400">
                  Provide a list of artists you listen to regularly
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-white text-black flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h4 className="text-white uppercase tracking-wide mb-1">Get Your Portrait</h4>
                <p className="text-sm text-gray-400">
                  Receive a comprehensive analysis of your listening patterns
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-white text-black flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h4 className="text-white uppercase tracking-wide mb-1">Explore Together</h4>
                <p className="text-sm text-gray-400">
                  Answer a few questions to shape your discovery path
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-white text-black flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div>
                <h4 className="text-white uppercase tracking-wide mb-1">Discover New Music</h4>
                <p className="text-sm text-gray-400">
                  Get personalized album recommendations to explore
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="bg-[#ff0055] text-white px-12 py-4 uppercase tracking-wider hover:bg-white hover:text-black transition-all border-2 border-[#ff0055] mt-12"
        >
          {showBothButtons ? 'Begin New Journey' : 'Begin Your Musical Journey'}
        </button>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-800 border border-gray-600 text-left text-xs text-gray-300">
            <div><strong>Debug Info:</strong></div>
            <div>User logged in: {user ? 'Yes' : 'No'}</div>
            <div>Has active recommendations: {hasActiveRecommendations ? 'Yes' : 'No'}</div>
            <div>Showing both buttons: {showBothButtons ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </div>
  );
}