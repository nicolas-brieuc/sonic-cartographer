import { useState } from 'react';
import { Auth } from './components/Auth';
import { UserMenu } from './components/UserMenu';
import { LandingPage } from './components/LandingPage';
import { ArtistInput } from './components/ArtistInput';
import { ListenerPortrait } from './components/ListenerPortrait';
import { ConversationInterface } from './components/ConversationInterface';
import { RecommendationsDisplay } from './components/RecommendationsDisplay';
import { ListeningExperience } from './components/ListeningExperience';
import { SessionHistory } from './components/SessionHistory';

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

export type AppStep = 
  | 'landing'
  | 'artist-input'
  | 'portrait'
  | 'conversation'
  | 'recommendations'
  | 'listening-experience'
  | 'history';

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

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    setUser(userData);
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

  // Show auth screen if not logged in
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

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
    setCurrentStep('history');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* User Menu - Always visible when logged in */}
      {currentStep !== 'landing' && (
        <div className="fixed top-4 right-4 z-50">
          <UserMenu 
            user={user} 
            onLogout={handleLogout}
            onViewHistory={currentStep === 'recommendations' ? handleViewHistory : undefined}
          />
        </div>
      )}

      {currentStep === 'landing' && (
        <LandingPage onStart={handleStart} />
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
      
      {currentStep === 'history' && (
        <SessionHistory
          sessions={sessions}
          onBack={handleBackToRecommendations}
        />
      )}
    </div>
  );
}