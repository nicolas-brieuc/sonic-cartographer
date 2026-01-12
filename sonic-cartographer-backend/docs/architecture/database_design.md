# Database Design

## Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

## Portraits Table

```sql
CREATE TABLE IF NOT EXISTS portraits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  artist_list_key TEXT NOT NULL,
  genres TEXT,
  geographic_centers TEXT,
  key_eras TEXT,
  noteworthy_gaps TEXT,
  analysis_summary TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_portraits_user_id ON portraits(user_id);
```

## Conversations Table

```sql
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  portrait_id TEXT,
  status TEXT DEFAULT 'active',
  question_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (portrait_id) REFERENCES portraits(id) ON DELETE SET NULL
);

CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);
```

## Conversation Messages Table

```sql
CREATE TABLE IF NOT EXISTS conversation_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX idx_conv_messages_conversation_id ON conversation_messages(conversation_id);
```

## Recommendations Table

```sql
CREATE TABLE IF NOT EXISTS recommendations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  conversation_id TEXT,
  portrait_id TEXT,
  session_id TEXT,
  albums TEXT NOT NULL,
  reasoning TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
  FOREIGN KEY (portrait_id) REFERENCES portraits(id) ON DELETE SET NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
);

CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_session_id ON recommendations(session_id);
```

## Listening Experiences Table

```sql
CREATE TABLE IF NOT EXISTS listening_experiences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  recommendation_id TEXT,
  album_title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  rating INTEGER,
  what_resonated TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE SET NULL
);

CREATE INDEX idx_listening_exp_user_id ON listening_experiences(user_id);
CREATE INDEX idx_listening_exp_recommendation_id ON listening_experiences(recommendation_id);
```

## Sessions Table

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  portrait_id TEXT,
  conversation_id TEXT,
  recommendation_id TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  archived_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (portrait_id) REFERENCES portraits(id) ON DELETE SET NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL,
  FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE SET NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_status ON sessions(status);
```

## Spotify Playlists Table

```sql
CREATE TABLE IF NOT EXISTS spotify_playlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  recommendation_id TEXT,
  spotify_playlist_id TEXT NOT NULL,
  playlist_url TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE SET NULL
);

CREATE INDEX idx_spotify_playlists_user_id ON spotify_playlists(user_id);
```

## Email Deliveries Table

```sql
CREATE TABLE IF NOT EXISTS email_deliveries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  recommendation_id TEXT,
  recipient_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  sent_at DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE SET NULL
);

CREATE INDEX idx_email_deliveries_user_id ON email_deliveries(user_id);
CREATE INDEX idx_email_deliveries_status ON email_deliveries(status);
```
