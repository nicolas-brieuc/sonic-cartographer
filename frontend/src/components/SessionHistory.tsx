import { ArrowLeft, Calendar, Disc3, Star } from 'lucide-react';
import { Session } from '../App';

interface SessionHistoryProps {
  sessions: Session[];
  onBack: () => void;
}

export function SessionHistory({ sessions, onBack }: SessionHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="flex items-center gap-4 border-b-4 border-[#ff0055] pb-4">
          <button
            onClick={onBack}
            className="p-2 bg-white hover:bg-[#ff0055] hover:text-white border-2 border-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white uppercase tracking-tight">Session History</h1>
            <p className="text-sm text-gray-400 uppercase tracking-wide">
              Review your past listening sessions and recommendations
            </p>
          </div>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-[#202020] border-4 border-white p-12 text-center">
            <div className="w-16 h-16 border-2 border-white flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-white mb-2 uppercase tracking-wide">No Sessions Yet</h2>
            <p className="text-gray-400">
              Your session history will appear here once you complete your first exploration
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-[#202020] border-4 border-white p-6"
              >
                {/* Session Header */}
                <div className="flex items-start justify-between mb-6 border-b-2 border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#ff0055] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-white uppercase tracking-wide">Exploration Session</h2>
                      <p className="text-sm text-gray-400">{formatDate(session.date)}</p>
                    </div>
                  </div>
                </div>

                {/* Portrait Summary */}
                {session.portrait && (
                  <div className="bg-[#202020] border-2 border-white p-4 mb-4">
                    <h3 className="mb-3 text-white uppercase tracking-wide">Listener Portrait</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[#ff0055] mb-1 uppercase tracking-wide">Primary Genres:</p>
                        <p className="text-gray-300">
                          {session.portrait.primaryGenres.slice(0, 2).join(', ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#ff0055] mb-1 uppercase tracking-wide">Key Eras:</p>
                        <p className="text-gray-300">
                          {session.portrait.keyEras.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {session.recommendations.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Disc3 className="w-4 h-4 text-[#ff0055]" />
                      <h3 className="text-white uppercase tracking-wide">Recommendations ({session.recommendations.length})</h3>
                    </div>
                    <div className="space-y-2">
                      {session.recommendations.map((rec, index) => (
                        <div
                          key={rec.id}
                          className="bg-[#202020] border-2 border-white p-3 flex items-start gap-3"
                        >
                          <span className="text-sm text-[#ff0055] flex-shrink-0">
                            {index + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              {rec.title}
                            </p>
                            <p className="text-xs text-gray-400">
                              {rec.artist} • {rec.year}
                            </p>
                          </div>
                          {session.feedback && session.feedback[index] && (
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Star className="w-4 h-4 text-[#ff0055] fill-current" />
                              <span className="text-sm text-white">
                                {session.feedback[index].rating}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback Status */}
                {session.feedback && session.feedback.length > 0 && (
                  <div className="mt-4 bg-[#202020] border-2 border-[#ff0055] p-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#ff0055]" />
                    <p className="text-sm text-white uppercase tracking-wide">
                      Reviewed {session.feedback.length} album{session.feedback.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}