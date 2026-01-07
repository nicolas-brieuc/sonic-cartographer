import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import { Recommendation } from '../App';
import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

interface ConversationInterfaceProps {
  conversationId: string;
  conversationHistory: Array<{ role: string; content: string }>;
  setConversationHistory: (history: Array<{ role: string; content: string }>) => void;
  onComplete: (recommendations: Recommendation[]) => void;
}

export function ConversationInterface({
  conversationId,
  conversationHistory,
  setConversationHistory,
  onComplete
}: ConversationInterfaceProps) {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    const newHistory = [
      ...conversationHistory,
      { role: 'user', content: userInput }
    ];

    setConversationHistory(newHistory);
    const userMessage = userInput;
    setUserInput('');

    try {
      // Send message to backend
      const response = await fetch(API_ENDPOINTS.sendMessage(conversationId), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: userMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Check if conversation is complete
      if (data.conversationComplete) {
        // Fetch recommendations
        const recsResponse = await fetch(API_ENDPOINTS.generateRecommendations(conversationId), {
          method: 'POST',
          headers: getAuthHeaders(),
        });

        const recsData = await recsResponse.json();

        if (!recsResponse.ok) {
          throw new Error(recsData.error || 'Failed to generate recommendations');
        }

        // Add final assistant message
        const finalHistory = [
          ...newHistory,
          {
            role: 'assistant',
            content: data.response || 'Perfect! Based on our conversation, I\'ve curated recommendations that will expand your musical horizons. Let me show you what I\'ve selected...'
          }
        ];
        setConversationHistory(finalHistory);

        // Map recommendations to frontend format
        const recommendations: Recommendation[] = recsData.recommendations.map((rec: any) => ({
          id: rec.albumId || rec.id,
          title: rec.title,
          artist: rec.artist,
          year: rec.year,
          reason: rec.reason,
          reviewLink: rec.reviewLink,
          coverImage: rec.coverImage,
        }));

        // Complete conversation and show recommendations
        setTimeout(() => {
          onComplete(recommendations);
        }, 1500);
      } else {
        // Add assistant response
        const updatedHistory = [
          ...newHistory,
          { role: 'assistant', content: data.response }
        ];
        setConversationHistory(updatedHistory);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Conversation error:', err);
    } finally {
      setIsLoading(false);
    }
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

          {/* Error Message */}
          {error && (
            <div className="border-t-2 border-white p-4 bg-red-900/20">
              <p className="text-red-300 text-sm uppercase tracking-wide">{error}</p>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="border-t-2 border-white p-4 bg-[#202020]">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={isLoading ? "AI is thinking..." : "Type your response..."}
                disabled={isLoading}
                className="flex-1 px-4 py-3 bg-white border-2 border-white focus:border-[#ff0055] outline-none transition-all text-black disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!userInput.trim() || isLoading}
                className="bg-[#ff0055] text-white p-3 border-2 border-[#ff0055] hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}