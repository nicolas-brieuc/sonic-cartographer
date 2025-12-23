import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { ArtistInput } from './components/ArtistInput';
import { ListenerPortrait } from './components/ListenerPortrait';
import { ConversationInterface } from './components/ConversationInterface';
import { RecommendationsDisplay } from './components/RecommendationsDisplay';
import { ListeningExperience } from './components/ListeningExperience';
import { SessionHistory } from './components/SessionHistory';
import { UserMenu } from './components/UserMenu';

type AppStep = 'landing' | 'auth' | 'artist-input' | 'portrait' | 'conversation' | 'recommendations' | 'listening-experience' | 'session-history';

export type Portrait = {
  primaryGenres: string[];
  geographicCenters: string[];
  keyEras: string[];
  noteworthyGaps: string[];
};

export type Recommendation = {
  id: string;
  title: string;
  artist: string;
  year: string;
  reason: string;
  reviewLink?: string;
  coverImage?: string;
};

export type Session = {
  id: string;
  date: string;
  portrait?: Portrait;
  recommendations: Recommendation[];
  feedback?: any[];
};

export default function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [currentStep, setCurrentStep] = useState<AppStep>('landing');
  const [artistList, setArtistList] = useState<string>('');
  const [portrait, setPortrait] = useState<Portrait | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string; content: string}>>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [explorationContext, setExplorationContext] = useState<{
    direction: 'reinforced' | 'pivot';
    analysis: { reinforcedThemes?: string; strategicPivot?: string };
  } | null>(null);

  // TEMPORARY: Simulate returning user with active recommendations for testing
  // Remove this useEffect after testing
  useEffect(() => {
    setUser({ name: 'Test User', email: 'test@example.com' });
    setRecommendations([
      {
        id: '1',
        title: 'To Pimp a Butterfly',
        artist: 'Kendrick Lamar',
        year: '2015',
        reason: 'A perfect bridge into conscious Hip-Hop with jazz influences',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300'
      },
      {
        id: '2',
        title: 'Cosmogramma',
        artist: 'Flying Lotus',
        year: '2010',
        reason: 'Electronic beats meeting jazz fusion - experimental yet accessible',
        coverImage: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300'
      },
      {
        id: '3',
        title: 'Vespertine',
        artist: 'Björk',
        year: '2001',
        reason: 'Intimate electronic exploration with unconventional production',
        coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300'
      },
      {
        id: '4',
        title: 'In Rainbows',
        artist: 'Radiohead',
        year: '2007',
        reason: 'Experimental rock meeting electronic textures',
        coverImage: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300'
      },
      {
        id: '5',
        title: 'Madvillainy',
        artist: 'Madvillain',
        year: '2004',
        reason: 'Abstract hip-hop with jazz-influenced production',
        coverImage: 'https://images.unsplash.com/photo-1619983081563-430f63602796?w=300'
      }
    ]);
  }, []);

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    setUser(userData);
    setCurrentStep('artist-input');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentStep('landing');
    setArtistList('');
    setPortrait(null);
    setConversationHistory([]);
    setRecommendations([]);
    setCurrentSessionId(null);
    setExplorationContext(null);
  };

  const handleStartJourney = () => {
    if (!user) {
      setCurrentStep('auth');
    } else {
      // Clear any existing session data and start fresh
      setArtistList('');
      setPortrait(null);
      setConversationHistory([]);
      setRecommendations([]);
      setCurrentSessionId(null);
      setExplorationContext(null);
      setCurrentStep('artist-input');
    }
  };

  const handleCaptureFromLanding = () => {
    setCurrentStep('listening-experience');
  };

  const handleStart = () => {
    setCurrentStep('artist-input');
  };

  const handleArtistSubmit = (artists: string) => {
    setArtistList(artists);
    // In a real app, this would call an AI API to generate the portrait
    // For now, we'll show a mock portrait
    const mockPortrait: Portrait = {
      primaryGenres: [
        'Alternative Rock',
        'Indie Folk',
        'Dream Pop',
        'Post-Punk Revival',
        'Electronic/Chillwave'
      ],
      geographicCenters: [
        'United States (Brooklyn, Portland)',
        'United Kingdom (London, Manchester)',
        'Canada (Montreal)'
      ],
      keyEras: [
        '2000-2010',
        '2010-2020',
        'Late 1990s'
      ],
      noteworthyGaps: [
        'Hip-Hop/R&B - Minimal representation despite mainstream dominance',
        'Latin American Music - No artists from South/Central America',
        'Jazz and its modern derivatives - Absence of contemporary jazz fusion',
        'Classic Rock (1960s-1970s) - Limited engagement with foundational rock'
      ]
    };
    setPortrait(mockPortrait);
    
    // Create new session
    const newSession: Session = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      portrait: mockPortrait,
      recommendations: []
    };
    setCurrentSessionId(newSession.id);
    setSessions([...sessions, newSession]);
    
    setCurrentStep('portrait');
  };

  const handleStartConversation = () => {
    setCurrentStep('conversation');
    // Initialize conversation with first question
    setConversationHistory([
      {
        role: 'assistant',
        content: 'Based on your portrait, I notice you haven\'t explored much Hip-Hop or R&B. This genre has incredible diversity - from conscious rap to neo-soul to trap. What aspect of Hip-Hop culture or sound interests you most, or what has kept you from exploring it?'
      }
    ]);
  };

  const handleConversationComplete = (recs: Recommendation[]) => {
    setRecommendations(recs);
    
    // Update session with recommendations
    setSessions(sessions.map(s => 
      s.id === currentSessionId 
        ? { ...s, recommendations: recs }
        : s
    ));
    
    setCurrentStep('recommendations');
  };

  const handleCaptureExperience = () => {
    setCurrentStep('listening-experience');
  };

  const handleViewHistory = () => {
    setCurrentStep('session-history');
  };

  const handleBackToRecommendations = () => {
    setCurrentStep('recommendations');
  };

  const handleStartNewSession = () => {
    setArtistList('');
    setPortrait(null);
    setConversationHistory([]);
    setRecommendations([]);
    setCurrentSessionId(null);
    setExplorationContext(null);
    setCurrentStep('artist-input');
  };

  const handleStartNewRound = (
    direction: 'reinforced' | 'pivot',
    analysis: { reinforcedThemes?: string; strategicPivot?: string }
  ) => {
    setExplorationContext({ direction, analysis });
    setCurrentStep('conversation');
    
    // Initialize conversation based on the selected direction
    const initialMessage = direction === 'reinforced'
      ? `Great! You want to explore more of what resonated with you. ${analysis.reinforcedThemes}\n\nLet's refine this direction: What specific aspects of these albums would you like to explore deeper? Think about production style, lyrical themes, instrumentation, or cultural context.`
      : `Interesting choice! You're ready to try a different approach. ${analysis.strategicPivot}\n\nLet's explore this pivot: What makes you curious about this alternative direction? Are there any specific artists, sounds, or themes from outside your usual listening that have caught your attention?`;
    
    setConversationHistory([
      {
        role: 'assistant',
        content: initialMessage
      }
    ]);
  };

  const handleGetNewRecommendations = () => {
    // Reset conversation and start a new one to get fresh recommendations
    setCurrentStep('conversation');
    setConversationHistory([
      {
        role: 'assistant',
        content: 'Let\'s explore some new recommendations based on your musical portrait. What aspect of your gaps or unexplored territories interests you most right now?'
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* User Menu - Always visible when logged in */}
      {currentStep !== 'landing' && user && (
        <div className="fixed top-4 right-4 z-50">
          <UserMenu 
            user={user} 
            onLogout={handleLogout}
            onViewHistory={currentStep === 'recommendations' ? handleViewHistory : undefined}
          />
        </div>
      )}

      {/* User Menu on landing page when user is logged in */}
      {currentStep === 'landing' && user && (
        <div className="fixed top-4 right-4 z-50">
          <UserMenu 
            user={user} 
            onLogout={handleLogout}
          />
        </div>
      )}

      {currentStep === 'landing' && (
        <LandingPage 
          onStart={handleStartJourney} 
          onCaptureExperience={handleCaptureFromLanding}
          user={user}
          hasActiveRecommendations={recommendations.length > 0}
        />
      )}
      
      {currentStep === 'auth' && (
        <Auth onAuthSuccess={handleAuthSuccess} />
      )}
      
      {currentStep === 'artist-input' && (
        <ArtistInput 
          onSubmit={handleArtistSubmit}
          initialValue={artistList}
        />
      )}
      
      {currentStep === 'portrait' && portrait && (
        <ListenerPortrait 
          portrait={portrait}
          onStartConversation={handleStartConversation}
        />
      )}
      
      {currentStep === 'conversation' && (
        <ConversationInterface
          conversationHistory={conversationHistory}
          setConversationHistory={setConversationHistory}
          onComplete={handleConversationComplete}
        />
      )}
      
      {currentStep === 'recommendations' && (
        <RecommendationsDisplay
          recommendations={recommendations}
          onCaptureExperience={handleCaptureExperience}
          onViewHistory={handleViewHistory}
          onStartNew={handleStartNewSession}
          onStartNewRound={handleStartNewRound}
          onGetNewRecommendations={handleGetNewRecommendations}
        />
      )}
      
      {currentStep === 'listening-experience' && (
        <ListeningExperience
          recommendations={recommendations}
          onBack={handleBackToRecommendations}
          sessionId={currentSessionId}
          sessions={sessions}
          setSessions={setSessions}
          onStartNewRound={handleStartNewRound}
        />
      )}
      
      {currentStep === 'session-history' && (
        <SessionHistory
          sessions={sessions}
          onBack={handleBackToRecommendations}
        />
      )}
    </div>
  );
}