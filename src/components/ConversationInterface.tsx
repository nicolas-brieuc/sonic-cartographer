import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import { Recommendation } from '../App';

interface ConversationInterfaceProps {
  conversationHistory: Array<{ role: string; content: string }>;
  setConversationHistory: (history: Array<{ role: string; content: string }>) => void;
  onComplete: (recommendations: Recommendation[]) => void;
}

export function ConversationInterface({ 
  conversationHistory, 
  setConversationHistory,
  onComplete 
}: ConversationInterfaceProps) {
  const [userInput, setUserInput] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: userInput }
    ];
    
    setConversationHistory(newHistory);
    setUserInput('');

    // Simulate AI response
    setTimeout(() => {
      if (questionCount < 3) {
        // Ask follow-up question
        const followUpQuestions = [
          'Interesting! Are you more drawn to the lyrical storytelling aspect of Hip-Hop, or the production and beat-making side? For example, would you prefer something with introspective lyrics or something more experimental and production-focused?',
          'Great, that helps narrow it down! One last question: would you like recommendations that serve as an accessible entry point to Hip-Hop, or would you prefer something more challenging and adventurous that pushes boundaries?'
        ];
        
        const nextHistory = [
          ...newHistory,
          { role: 'assistant', content: followUpQuestions[questionCount - 1] }
        ];
        setConversationHistory(nextHistory);
        setQuestionCount(questionCount + 1);
      } else {
        // Generate final recommendations
        const mockRecommendations: Recommendation[] = [
          {
            id: '1',
            title: 'To Pimp a Butterfly',
            artist: 'Kendrick Lamar',
            year: '2015',
            reason: 'A masterpiece of conscious Hip-Hop with jazz fusion elements and deeply introspective storytelling',
            reviewLink: 'https://pitchfork.com/reviews/albums/20390-to-pimp-a-butterfly/',
            coverImage: 'https://images.unsplash.com/photo-1697238724753-60c0c31132d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW55bCUyMHJlY29yZCUyMGFsYnVtfGVufDF8fHx8MTc2NDg4NDg0NXww&ixlib=rb-4.1.0&q=80&w=1080'
          },
          {
            id: '2',
            title: 'The Miseducation of Lauryn Hill',
            artist: 'Lauryn Hill',
            year: '1998',
            reason: 'Blends Hip-Hop with soul and R&B, featuring thoughtful lyricism and accessible melodies',
            reviewLink: 'https://pitchfork.com/reviews/albums/lauryn-hill-the-miseducation-of-lauryn-hill/',
            coverImage: 'https://images.unsplash.com/photo-1761682704492-b7ed11edfda7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqYXp6JTIwYWxidW0lMjBjb3ZlcnxlbnwxfHx8fDE3NjQ5MDg4MTh8MA&ixlib=rb-4.1.0&q=80&w=1080'
          },
          {
            id: '3',
            title: 'Madvillainy',
            artist: 'Madvillain',
            year: '2004',
            reason: 'Abstract, experimental Hip-Hop with unconventional production and cryptic wordplay',
            reviewLink: 'https://pitchfork.com/reviews/albums/5083-madvillainy/',
            coverImage: 'https://images.unsplash.com/photo-1590310182704-037fe3509ada?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb2NrJTIwbXVzaWMlMjBhbGJ1bXxlbnwxfHx8fDE3NjQ5MTU3MTF8MA&ixlib=rb-4.1.0&q=80&w=1080'
          },
          {
            id: '4',
            title: 'Black on Both Sides',
            artist: 'Mos Def',
            year: '1999',
            reason: 'Socially conscious rap with live instrumentation and diverse musical influences',
            reviewLink: 'https://www.allmusic.com/album/black-on-both-sides-mw0000248134',
            coverImage: 'https://images.unsplash.com/photo-1743203583372-0db67da16883?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJvbmljJTIwbXVzaWMlMjBjb25jZXJ0fGVufDF8fHx8MTc2NDgzMzI0NHww&ixlib=rb-4.1.0&q=80&w=1080'
          },
          {
            id: '5',
            title: 'Cosmogramma',
            artist: 'Flying Lotus',
            year: '2010',
            reason: 'Genre-defying electronic Hip-Hop fusion with jazz and experimental elements',
            reviewLink: 'https://pitchfork.com/reviews/albums/14223-cosmogramma/',
            coverImage: 'https://images.unsplash.com/photo-1615835959969-e16e6b01f310?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMG11c2ljJTIwYXJ0fGVufDF8fHx8MTc2NDkxODMxNnww&ixlib=rb-4.1.0&q=80&w=1080'
          }
        ];

        const finalHistory = [
          ...newHistory,
          { 
            role: 'assistant', 
            content: 'Perfect! Based on our conversation, I\'ve curated 5 albums that will expand your musical horizons. These recommendations blend lyrical depth with innovative production, offering both accessibility and artistic challenge. Let me show you what I\'ve selected...' 
          }
        ];
        setConversationHistory(finalHistory);
        
        // Complete conversation and show recommendations
        setTimeout(() => {
          onComplete(mockRecommendations);
        }, 1500);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a] relative overflow-hidden">
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1639060015191-9d83063eab2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwbWFwJTIwbmF2aWdhdGlvbnxlbnwxfHx8fDE3NjQ5NTEwNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Futuristic map"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/95 to-[#1a1a1a]" />
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="border-b-4 border-[#ff0055] pb-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#ff0055] flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white uppercase tracking-tight">Discovery Conversation</h1>
              <p className="text-sm text-gray-400 uppercase tracking-wide">Shaping your recommendations</p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-[#202020] border-4 border-white overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {conversationHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] border-2 px-4 py-3 ${
                    msg.role === 'assistant'
                      ? 'bg-[#ff0055] text-white border-[#ff0055]'
                      : 'bg-[#202020] text-white border-white'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 border-b border-gray-700 pb-2">
                      <Sparkles className="w-4 h-4 text-[#ff0055]" />
                      <span className="text-sm text-[#ff0055] uppercase tracking-wide">Sonic Cartographer</span>
                    </div>
                  )}
                  <p className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          {questionCount <= 3 && (
            <form onSubmit={handleSubmit} className="border-t-2 border-white p-4 bg-[#202020]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your response..."
                  className="flex-1 px-4 py-3 bg-white border-2 border-white focus:border-[#ff0055] outline-none transition-all text-black"
                />
                <button
                  type="submit"
                  disabled={!userInput.trim()}
                  className="bg-[#ff0055] text-white p-3 border-2 border-[#ff0055] hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}