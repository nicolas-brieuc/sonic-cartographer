import { MapPin, Calendar, Music, AlertCircle, ArrowRight } from 'lucide-react';
import { Portrait } from '../App';

interface ListenerPortraitProps {
  portrait: Portrait;
  onStartConversation: () => void;
}

export function ListenerPortrait({ portrait, onStartConversation }: ListenerPortraitProps) {
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
          <h1 className="text-white uppercase tracking-tight">
            Your Listener Portrait
          </h1>
          <p className="text-gray-400 uppercase tracking-wide text-sm">
            A comprehensive analysis of your musical landscape
          </p>
        </div>

        {/* Portrait Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Genres */}
          <div className="bg-[#202020] border-2 border-white p-6">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-3">
              <div className="w-8 h-8 bg-[#ff0055] flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-white uppercase tracking-wide">Primary Genres</h2>
            </div>
            <ul className="space-y-2">
              {portrait.primaryGenres.map((genre, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#ff0055] mt-1">▸</span>
                  <span className="text-gray-300">{genre}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Geographic Centers */}
          <div className="bg-[#202020] border-2 border-white p-6">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-3">
              <div className="w-8 h-8 bg-[#ff0055] flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-white uppercase tracking-wide">Geographic Centers</h2>
            </div>
            <ul className="space-y-2">
              {portrait.geographicCenters.map((center, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#ff0055] mt-1">▸</span>
                  <span className="text-gray-300">{center}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Eras */}
          <div className="bg-[#202020] border-2 border-white p-6">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-3">
              <div className="w-8 h-8 bg-[#ff0055] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-white uppercase tracking-wide">Key Eras</h2>
            </div>
            <ul className="space-y-2">
              {portrait.keyEras.map((era, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#ff0055] mt-1">▸</span>
                  <span className="text-gray-300">{era}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Noteworthy Gaps */}
          <div className="bg-[#202020] border-2 border-white p-6">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-3">
              <div className="w-8 h-8 bg-[#ff0055] flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-white uppercase tracking-wide">Noteworthy Gaps</h2>
            </div>
            <ul className="space-y-2">
              {portrait.noteworthyGaps.map((gap, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#ff0055] mt-1">▸</span>
                  <span className="text-sm text-gray-300">{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Analysis Summary */}
        {portrait.summary && (
          <div className="bg-[#202020] border-4 border-[#ff0055] p-8">
            <h2 className="mb-4 text-white uppercase tracking-wider border-b-2 border-white pb-3">What This Tells Us</h2>
            <p className="text-gray-300 leading-relaxed">
              {portrait.summary}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center pt-4">
          <button
            onClick={onStartConversation}
            className="flex items-center gap-2 bg-[#ff0055] text-white px-12 py-4 uppercase tracking-wider hover:bg-white hover:text-black transition-all border-2 border-[#ff0055]"
          >
            Start Exploration Conversation
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}