import { useState } from 'react';
import { ArrowLeft, Headphones, Star, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react';
import { Recommendation, Session } from '../App';

interface ListeningExperienceProps {
  recommendations: Recommendation[];
  onBack: () => void;
  sessionId: string | null;
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  onStartNewRound?: (direction: 'reinforced' | 'pivot', analysis: { reinforcedThemes?: string; strategicPivot?: string }) => void;
}

type AlbumFeedback = {
  albumId: string;
  rating: number;
  rationale: string;
  resonantElement: string;
};

export function ListeningExperience({ 
  recommendations, 
  onBack,
  sessionId,
  sessions,
  setSessions,
  onStartNewRound
}: ListeningExperienceProps) {
  const [step, setStep] = useState<'screening' | 'interview' | 'analysis'>('screening');
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [currentAlbumIndex, setCurrentAlbumIndex] = useState(0);
  const [feedbackList, setFeedbackList] = useState<AlbumFeedback[]>([]);
  
  // Current feedback being collected
  const [rating, setRating] = useState(0);
  const [rationale, setRationale] = useState('');
  const [resonantElement, setResonantElement] = useState('');

  const [analysis, setAnalysis] = useState<{
    reinforcedThemes?: string;
    strategicPivot?: string;
  } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'reinforced' | 'pivot' | null>(null);

  const handleScreeningSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAlbums.length === 0) {
      // No albums listened to
      setAnalysis({
        reinforcedThemes: 'Not enough data yet',
        strategicPivot: 'Please listen to at least 3 albums to get meaningful insights'
      });
      setStep('analysis');
    } else {
      setStep('interview');
    }
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentAlbum = recommendations.find(r => r.id === selectedAlbums[currentAlbumIndex]);
    if (!currentAlbum) return;

    const newFeedback: AlbumFeedback = {
      albumId: currentAlbum.id,
      rating,
      rationale,
      resonantElement
    };

    const updatedFeedback = [...feedbackList, newFeedback];
    setFeedbackList(updatedFeedback);

    // Reset form
    setRating(0);
    setRationale('');
    setResonantElement('');

    // Move to next album or analysis
    if (currentAlbumIndex < selectedAlbums.length - 1) {
      setCurrentAlbumIndex(currentAlbumIndex + 1);
    } else {
      // Generate analysis
      generateAnalysis(updatedFeedback);
      
      // Save to session
      if (sessionId) {
        setSessions(sessions.map(s => 
          s.id === sessionId 
            ? { ...s, feedback: updatedFeedback }
            : s
        ));
      }
      
      setStep('analysis');
    }
  };

  const generateAnalysis = (feedback: AlbumFeedback[]) => {
    const positiveRatings = feedback.filter(f => f.rating >= 4);
    const negativeRatings = feedback.filter(f => f.rating <= 2);

    if (feedback.length >= 3) {
      setAnalysis({
        reinforcedThemes: positiveRatings.length > 0
          ? 'Based on your high ratings, you seem to resonate with experimental Hip-Hop that incorporates jazz elements and introspective lyricism. Artists like Kendrick Lamar and Flying Lotus represent a fusion approach you might want to explore deeper.'
          : 'Need more positive ratings to identify reinforced themes.',
        strategicPivot: negativeRatings.length > 0
          ? 'Your lukewarm response to some albums suggests you might prefer more accessible entry points. Consider exploring Neo-Soul or Alternative R&B as a gentler bridge into Hip-Hop culture.'
          : 'Based on your overall positive response, you might be ready for more challenging works in the genre.'
      });
    } else {
      setAnalysis({
        reinforcedThemes: 'Not enough albums reviewed yet',
        strategicPivot: 'Please listen to at least 3 albums for meaningful analysis'
      });
    }
  };

  const toggleAlbumSelection = (albumId: string) => {
    setSelectedAlbums(prev => 
      prev.includes(albumId)
        ? prev.filter(id => id !== albumId)
        : [...prev, albumId]
    );
  };

  const currentAlbum = recommendations.find(r => r.id === selectedAlbums[currentAlbumIndex]);

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

      <div className="max-w-3xl mx-auto space-y-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 border-b-4 border-[#ff0055] pb-4">
          <button
            onClick={onBack}
            className="p-2 bg-white hover:bg-[#ff0055] hover:text-white border-2 border-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white uppercase tracking-tight">Capture Listening Experience</h1>
            <p className="text-sm text-gray-400 uppercase tracking-wide">
              Share your feedback to refine future recommendations
            </p>
          </div>
        </div>

        {/* Screening Step */}
        {step === 'screening' && (
          <div className="bg-[#202020] border-4 border-white p-8">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-gray-700 pb-4">
              <div className="w-12 h-12 bg-[#ff0055] flex items-center justify-center">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-white uppercase tracking-wide">Which albums have you listened to?</h2>
            </div>

            <form onSubmit={handleScreeningSubmit} className="space-y-6">
              <p className="text-gray-300">
                Select the albums you&apos;re ready to discuss. You need at least 3 for meaningful analysis.
              </p>

              <div className="space-y-3">
                {recommendations.map((rec) => (
                  <label
                    key={rec.id}
                    className={`p-4 border-2 flex items-start gap-4 cursor-pointer transition-colors ${
                      selectedAlbums.includes(rec.id)
                        ? 'bg-[#202020] border-[#ff0055]'
                        : 'bg-[#202020] border-white hover:border-[#ff0055]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAlbums.includes(rec.id)}
                      onChange={() => toggleAlbumSelection(rec.id)}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-white">{rec.title}</p>
                      <p className="text-sm text-gray-400">{rec.artist} • {rec.year}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                type="submit"
                className="w-full bg-[#ff0055] text-white py-3 border-2 border-[#ff0055] hover:bg-white hover:text-black transition-all uppercase tracking-wider"
              >
                {selectedAlbums.length === 0 ? 'Skip to Analysis' : `Continue with ${selectedAlbums.length} album${selectedAlbums.length !== 1 ? 's' : ''}`}
              </button>
            </form>
          </div>
        )}

        {/* Interview Step */}
        {step === 'interview' && currentAlbum && (
          <div className="bg-[#202020] border-4 border-white p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400 uppercase tracking-wide">
                  Record {currentAlbumIndex + 1} of {selectedAlbums.length}
                </span>
                <span className="text-sm text-[#ff0055] uppercase tracking-wide">
                  {Math.round(((currentAlbumIndex + 1) / selectedAlbums.length) * 100)}% Complete
                </span>
              </div>
              <div className="h-2 bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-[#ff0055] transition-all duration-300"
                  style={{ width: `${((currentAlbumIndex + 1) / selectedAlbums.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Album Info */}
            <div className="bg-[#202020] border-2 border-white p-4 mb-6 flex gap-4 items-center">
              {currentAlbum.coverImage && (
                <img 
                  src={currentAlbum.coverImage} 
                  alt={`${currentAlbum.title} album cover`}
                  className="w-24 h-24 border-2 border-white object-cover shadow-md flex-shrink-0"
                />
              )}
              <div>
                <h2 className="text-white uppercase tracking-wide">{currentAlbum.title}</h2>
                <p className="text-gray-400">{currentAlbum.artist} • {currentAlbum.year}</p>
              </div>
            </div>

            {/* Feedback Form */}
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              {/* Question 1: Rating */}
              <div>
                <label className="block mb-3 text-white uppercase tracking-wide">
                  On a scale of 1 to 5 (5 being excellent), how would you rate this record?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`flex-1 p-4 border-2 transition-all ${
                        rating === value
                          ? 'bg-[#ff0055] border-[#ff0055] text-white'
                          : 'bg-[#202020] border-white hover:border-[#ff0055] text-white'
                      }`}
                    >
                      <Star className={`w-6 h-6 mx-auto ${rating >= value ? 'fill-current' : ''}`} />
                      <span className="text-sm mt-1 block">{value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Encouragement Message */}
              <div className="bg-[#202020] border-2 border-white p-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  <span className="text-[#ff0055] uppercase tracking-wide">Optional but helpful:</span> Share your thoughts below to help us understand what resonates with you. Your insights will shape better recommendations and create a personal journal of your sonic journey.
                </p>
              </div>

              {/* Rationale */}
              <div>
                <label htmlFor="rationale" className="block mb-2 text-white uppercase tracking-wide">
                  Why did you give it this rating? <span className="text-sm text-gray-500">(Optional)</span>
                </label>
                <textarea
                  id="rationale"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Share your thoughts... What did you love or dislike about this album?"
                  rows={3}
                  className="w-full px-4 py-3 bg-white border-2 border-white focus:border-[#ff0055] outline-none transition-all resize-none text-black"
                />
              </div>

              {/* Question 2: Resonant Element */}
              <div>
                <label htmlFor="resonant" className="block mb-2 text-white uppercase tracking-wide">
                  What specific element resonated most (or least) with you? <span className="text-sm text-gray-500">(Optional)</span>
                </label>
                <textarea
                  id="resonant"
                  value={resonantElement}
                  onChange={(e) => setResonantElement(e.target.value)}
                  placeholder="e.g., the production, instrumentation, vocal style, songwriting, lyrics, mood..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white border-2 border-white focus:border-[#ff0055] outline-none transition-all resize-none text-black"
                />
              </div>

              <button
                type="submit"
                disabled={rating === 0}
                className="w-full bg-[#ff0055] text-white py-3 border-2 border-[#ff0055] hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {currentAlbumIndex < selectedAlbums.length - 1 ? 'Next Album' : 'Complete & Analyze'}
              </button>
            </form>
          </div>
        )}

        {/* Analysis Step */}
        {step === 'analysis' && analysis && (
          <div className="space-y-6">
            <div className="bg-[#202020] border-4 border-white p-8">
              <div className="flex items-center gap-3 mb-6 border-b-2 border-gray-700 pb-4">
                <div className="w-12 h-12 bg-[#ff0055] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-white uppercase tracking-wide">Your Listening Analysis</h2>
              </div>

              {feedbackList.length >= 3 ? (
                <div className="space-y-6">
                  {/* Reinforced Themes */}
                  <div className="bg-[#202020] border-2 border-white p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-[#ff0055]" />
                      <h3 className="text-white uppercase tracking-wide">Reinforced Themes</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      {analysis.reinforcedThemes}
                    </p>
                  </div>

                  {/* Strategic Pivot */}
                  <div className="bg-[#202020] border-2 border-white p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown className="w-5 h-5 text-[#ff0055]" />
                      <h3 className="text-white uppercase tracking-wide">Strategic Pivot</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">
                      {analysis.strategicPivot}
                    </p>
                  </div>

                  {/* Direction Selection */}
                  {!selectedDirection ? (
                    <div className="bg-[#202020] border-4 border-[#ff0055] p-6">
                      <h3 className="text-white mb-4 uppercase tracking-wide">Choose Your Next Direction</h3>
                      <p className="text-gray-300 mb-6 leading-relaxed">
                        Select which strategic direction you&apos;d like to explore for your next set of recommendations:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => setSelectedDirection('reinforced')}
                          className="group bg-[#202020] border-2 border-white p-6 hover:border-[#ff0055] transition-all text-left"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-6 h-6 text-[#ff0055]" />
                            <h4 className="text-white uppercase tracking-wide">Reinforced Themes</h4>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            Dive deeper into what you loved. Get recommendations that amplify your positive responses.
                          </p>
                          <div className="mt-4 text-[#ff0055] text-sm group-hover:translate-x-1 transition-transform uppercase tracking-wide">
                            Select this direction →
                          </div>
                        </button>

                        <button
                          onClick={() => setSelectedDirection('pivot')}
                          className="group bg-[#202020] border-2 border-white p-6 hover:border-[#ff0055] transition-all text-left"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingDown className="w-6 h-6 text-[#ff0055]" />
                            <h4 className="text-white uppercase tracking-wide">Strategic Pivot</h4>
                          </div>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            Try a different approach. Explore alternative entry points based on your feedback.
                          </p>
                          <div className="mt-4 text-[#ff0055] text-sm group-hover:translate-x-1 transition-transform uppercase tracking-wide">
                            Select this direction →
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#ff0055] border-2 border-[#ff0055] p-6 text-white">
                      <h3 className="mb-3 uppercase tracking-wide">Direction Selected!</h3>
                      <p className="leading-relaxed mb-6">
                        You&apos;ve chosen to explore <span className="font-semibold uppercase">
                          {selectedDirection === 'reinforced' ? 'Reinforced Themes' : 'Strategic Pivot'}
                        </span>. Let&apos;s have a conversation to refine your next set of recommendations.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => onStartNewRound && onStartNewRound(selectedDirection, analysis)}
                          className="flex-1 bg-white text-black py-3 border-2 border-white hover:bg-[#202020] hover:text-white transition-all uppercase tracking-wide"
                        >
                          Start Guided Exploration
                        </button>
                        <button
                          onClick={() => setSelectedDirection(null)}
                          className="px-4 py-3 text-white border-2 border-white hover:bg-white hover:text-black transition-all uppercase tracking-wide"
                        >
                          Change
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-black border-2 border-white p-6">
                  <h3 className="text-white mb-3 uppercase tracking-wide">Not Enough Data Yet</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    You&apos;ve reviewed {feedbackList.length} album{feedbackList.length !== 1 ? 's' : ''}. 
                    We need at least 3 reviews to provide meaningful analysis and recommendations.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Would you like me to suggest more records to help you reach the three-record threshold?
                  </p>
                </div>
              )}

              <button
                onClick={onBack}
                className="w-full mt-6 bg-white border-2 border-white text-black py-3 hover:bg-[#ff0055] hover:text-white hover:border-[#ff0055] transition-all uppercase tracking-wider"
              >
                Back to Recommendations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}