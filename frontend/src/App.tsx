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
import { API_ENDPOINTS, getAuthHeaders, clearAuthToken } from './config/api';

type AppStep = 'landing' | 'auth' | 'artist-input' | 'portrait' | 'conversation' | 'recommendations' | 'listening-experience' | 'session-history';

export type Portrait = {
  primaryGenres: string[];
  geographicCenters: string[];
  keyEras: string[];
  noteworthyGaps: string[];
  summary?: string;
};

export type Recommendation = {
  id: string;
  title: string;
  artist: string;
  year: string;
  reason: string;
  spotifyLink?: string;
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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [explorationContext, setExplorationContext] = useState<{
    direction: 'reinforced' | 'pivot';
    analysis: { reinforcedThemes?: string; strategicPivot?: string };
  } | null>(null);
  const [loadingNewRecommendations, setLoadingNewRecommendations] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    // Check for auth token in localStorage
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Load recommendations for this user
        const userKey = `recommendations_${parsedUser.email}`;
        const savedRecommendations = localStorage.getItem(userKey);

        if (savedRecommendations) {
          const parsedRecs = JSON.parse(savedRecommendations);
          setRecommendations(parsedRecs);
        }

        // Load session ID for this user
        const sessionKey = `sessionId_${parsedUser.email}`;
        const savedSessionId = localStorage.getItem(sessionKey);
        if (savedSessionId) {
          setCurrentSessionId(savedSessionId);
        }
      } catch (error) {
        console.error('Failed to load persisted data:', error);
      }
    }
  }, []);

  // Note: Mock data removed - now using real API calls

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    setUser(userData);

    // Load recommendations for this user
    const userKey = `recommendations_${userData.email}`;
    const savedRecommendations = localStorage.getItem(userKey);

    // Load session ID for this user
    const sessionKey = `sessionId_${userData.email}`;
    const savedSessionId = localStorage.getItem(sessionKey);
    if (savedSessionId) {
      setCurrentSessionId(savedSessionId);
    }

    if (savedRecommendations) {
      try {
        const parsedRecs = JSON.parse(savedRecommendations);
        setRecommendations(parsedRecs);
        // If user has recommendations, send them to landing page
        setCurrentStep('landing');
      } catch (error) {
        console.error('Failed to load recommendations:', error);
        setCurrentStep('artist-input');
      }
    } else {
      setCurrentStep('artist-input');
    }
  };

  const handleLogout = () => {
    // Clear auth token
    clearAuthToken();

    // Clear user-specific data from localStorage
    if (user) {
      const userKey = `recommendations_${user.email}`;
      const sessionKey = `sessionId_${user.email}`;
      localStorage.removeItem(userKey);
      localStorage.removeItem(sessionKey);
    }

    setUser(null);
    setCurrentStep('landing');
    setArtistList('');
    setPortrait(null);
    setConversationHistory([]);
    setRecommendations([]);
    setCurrentSessionId(null);
    setConversationId(null);
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

      // Clear recommendations and session from localStorage
      const userKey = `recommendations_${user.email}`;
      const sessionKey = `sessionId_${user.email}`;
      localStorage.removeItem(userKey);
      localStorage.removeItem(sessionKey);

      setCurrentStep('artist-input');
    }
  };

  const handleCaptureFromLanding = () => {
    setCurrentStep('listening-experience');
  };

  const handleStart = () => {
    setCurrentStep('artist-input');
  };

  const handleArtistSubmit = async (artists: string) => {
    setArtistList(artists);

    try {
      // Call the portrait generation API
      const response = await fetch(API_ENDPOINTS.generatePortrait, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          artistList: artists,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate portrait');
      }

      // Map API response to Portrait type
      // Backend returns both old format (genres, eras) and new format (primaryGenres, etc.)
      // Prefer new format, fall back to old format for backward compatibility
      const generatedPortrait: Portrait = {
        primaryGenres: data.primaryGenres || data.genres || [],
        geographicCenters: data.geographicCenters || [],
        keyEras: data.keyEras || data.eras || [],
        noteworthyGaps: data.noteworthyGaps || [],
        summary: data.summary,
      };

      console.log('Generated portrait:', generatedPortrait);

      setPortrait(generatedPortrait);

      // Create new session
      const newSession: Session = {
        id: data.portraitId || Date.now().toString(),
        date: new Date().toISOString(),
        portrait: generatedPortrait,
        recommendations: []
      };
      setCurrentSessionId(newSession.id);
      setSessions([...sessions, newSession]);

      // Save session ID to localStorage
      if (user) {
        const sessionKey = `sessionId_${user.email}`;
        localStorage.setItem(sessionKey, newSession.id);
      }

      setCurrentStep('portrait');
    } catch (error) {
      console.error('Failed to generate portrait:', error);
      // Show error to user - for now just log it
      alert('Failed to generate portrait. Please try again.');
    }
  };

  const handleStartConversation = async () => {
    if (!currentSessionId) {
      alert('No portrait found. Please generate a portrait first.');
      return;
    }

    try {
      // Start a conversation with the backend
      const response = await fetch(API_ENDPOINTS.startConversation, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          portraitId: currentSessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start conversation');
      }

      // Store conversation ID
      setConversationId(data.conversationId);

      // Initialize conversation with first message from backend
      const initialMessage = data.initialMessage ||
        'Based on your portrait, I notice you haven\'t explored much Hip-Hop or R&B. This genre has incredible diversity - from conscious rap to neo-soul to trap. What aspect of Hip-Hop culture or sound interests you most, or what has kept you from exploring it?';

      setConversationHistory([
        {
          role: 'assistant',
          content: initialMessage
        }
      ]);

      setCurrentStep('conversation');
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const handleConversationComplete = (recs: Recommendation[]) => {
    setRecommendations(recs);

    // Update session with recommendations
    setSessions(sessions.map(s =>
      s.id === currentSessionId
        ? { ...s, recommendations: recs }
        : s
    ));

    // Save recommendations to localStorage
    if (user) {
      const userKey = `recommendations_${user.email}`;
      localStorage.setItem(userKey, JSON.stringify(recs));
    }

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

    // Clear recommendations and session from localStorage
    if (user) {
      const userKey = `recommendations_${user.email}`;
      const sessionKey = `sessionId_${user.email}`;
      localStorage.removeItem(userKey);
      localStorage.removeItem(sessionKey);
    }

    setCurrentStep('artist-input');
  };

  const handleStartNewRound = async (
    direction: 'reinforced' | 'pivot',
    analysis: { reinforcedThemes?: string; strategicPivot?: string }
  ) => {
    if (!currentSessionId) {
      alert('No session found. Please start a new journey.');
      return;
    }

    try {
      // Start a new conversation with the backend for this exploration round
      const response = await fetch(API_ENDPOINTS.startConversation, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          portraitId: currentSessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start conversation');
      }

      // Store new conversation ID
      setConversationId(data.conversationId);
      setExplorationContext({ direction, analysis });

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

      setCurrentStep('conversation');
    } catch (error) {
      console.error('Failed to start new round:', error);
      alert('Failed to start new round. Please try again.');
    }
  };

  const handleGetNewRecommendations = async () => {
    if (!conversationId) {
      alert('No conversation found. Please start a new journey.');
      return;
    }

    setLoadingNewRecommendations(true);

    try {
      // Generate new recommendations using the existing conversation
      const response = await fetch(API_ENDPOINTS.generateRecommendations(conversationId), {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate new recommendations');
      }

      // Map recommendations to frontend format
      const newRecommendations: Recommendation[] = data.recommendations.map((rec: any) => ({
        id: rec.albumId || rec.id,
        title: rec.title,
        artist: rec.artist,
        year: rec.year,
        reason: rec.reason,
        spotifyLink: rec.spotifyLink,
        coverImage: rec.coverImage,
      }));

      // Update recommendations
      setRecommendations(newRecommendations);
    } catch (error) {
      console.error('Failed to get new recommendations:', error);
      alert('Failed to get new recommendations. Please try again.');
    } finally {
      setLoadingNewRecommendations(false);
    }
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
      
      {currentStep === 'conversation' && conversationId && (
        <ConversationInterface
          conversationId={conversationId}
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
          loadingNewRecommendations={loadingNewRecommendations}
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