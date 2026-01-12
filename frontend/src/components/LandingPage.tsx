import { Compass } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onCaptureExperience?: () => void;
  user?: { name: string; email: string } | null;
  hasActiveRecommendations?: boolean;
}

export function LandingPage({ onStart, onCaptureExperience, user, hasActiveRecommendations }: LandingPageProps) {
  const showBothButtons = user && hasActiveRecommendations;

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
      </div>
    </div>
  );
}