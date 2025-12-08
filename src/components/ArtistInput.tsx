import { useState } from 'react';
import { Music, ArrowRight, Upload, FileText } from 'lucide-react';

interface ArtistInputProps {
  onSubmit: (artists: string) => void;
  initialValue: string;
}

export function ArtistInput({ onSubmit, initialValue }: ArtistInputProps) {
  const [artistList, setArtistList] = useState(initialValue);
  const [inputMode, setInputMode] = useState<'manual' | 'upload'>('manual');
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (artistList.trim()) {
      onSubmit(artistList);
    }
  };

  const exampleArtists = `Radiohead
Bon Iver
Fleet Foxes
Arcade Fire
The National
Sufjan Stevens
Beach House
Tame Impala
Grizzly Bear
Vampire Weekend`;

  const handleUseExample = () => {
    setArtistList(exampleArtists);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('Processing file...');

    try {
      const text = await file.text();
      let artists: string[] = [];

      // Detect file type and parse accordingly
      if (file.name.endsWith('.json')) {
        // Spotify JSON format
        const data = JSON.parse(text);
        
        // Handle different Spotify export formats
        if (Array.isArray(data)) {
          // Streaming history format
          artists = [...new Set(data.map((item: any) => item.artistName || item.master_metadata_album_artist_name).filter(Boolean))];
        } else if (data.playlists) {
          // Playlist format
          const tracks = data.playlists.flatMap((p: any) => p.tracks || []);
          artists = [...new Set(tracks.map((t: any) => t.artistName || t.artist).filter(Boolean))];
        } else if (data.items) {
          // Library format
          artists = [...new Set(data.items.map((item: any) => item.track?.artists?.[0]?.name || item.artist).filter(Boolean))];
        }
      } else if (file.name.endsWith('.csv')) {
        // CSV format (Spotify, Discogs, or custom)
        const lines = text.split('\n');
        const headers = lines[0].toLowerCase().split(',');
        
        // Find artist column
        const artistIndex = headers.findIndex(h => 
          h.includes('artist') || h.includes('albumartist') || h.includes('creator')
        );

        if (artistIndex !== -1) {
          artists = lines.slice(1)
            .map(line => {
              const cols = line.split(',');
              return cols[artistIndex]?.trim().replace(/"/g, '');
            })
            .filter(Boolean);
          artists = [...new Set(artists)];
        } else {
          // If no header match, assume first column is artist
          artists = [...new Set(lines.slice(1).map(line => line.split(',')[0]?.trim().replace(/"/g, '')).filter(Boolean))];
        }
      } else {
        // Plain text format (one artist per line)
        artists = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
        artists = [...new Set(artists)];
      }

      if (artists.length === 0) {
        setUploadStatus('No artists found in file. Please check the format.');
        return;
      }

      setArtistList(artists.join('\n'));
      setUploadStatus(`Successfully loaded ${artists.length} artists!`);
      
      // Clear status after 3 seconds
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      setUploadStatus('Error reading file. Please check the format and try again.');
      console.error('File upload error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#1a1a1a] relative overflow-hidden">
      {/* Background image */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1639060015191-9d83063eab2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwbWFwJTIwbmF2aWdhdGlvbnxlbnwxfHx8fDE3NjQ5NTEwNjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Futuristic map"
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#1a1a1a]/95 to-[#1a1a1a]" />
      </div>

      <div className="max-w-3xl w-full relative z-10">
        <div className="bg-[#202020] border-4 border-white p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 border-b-2 border-[#ff0055] pb-4">
            <div className="w-12 h-12 bg-[#ff0055] flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white uppercase tracking-tight">Share Your Artists</h1>
              <p className="text-sm text-gray-400 uppercase tracking-wide">Manual entry or upload</p>
            </div>
          </div>

          {/* Input Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setInputMode('manual')}
              className={`flex-1 py-3 px-4 border-2 transition-all uppercase tracking-wide text-sm ${
                inputMode === 'manual'
                  ? 'bg-[#ff0055] text-white border-[#ff0055]'
                  : 'bg-[#202020] text-white border-white hover:border-[#ff0055]'
              }`}
            >
              <FileText className="w-5 h-5 mx-auto mb-1" />
              <span>Manual Entry</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`flex-1 py-3 px-4 border-2 transition-all uppercase tracking-wide text-sm ${
                inputMode === 'upload'
                  ? 'bg-[#ff0055] text-white border-[#ff0055]'
                  : 'bg-[#202020] text-white border-white hover:border-[#ff0055]'
              }`}
            >
              <Upload className="w-5 h-5 mx-auto mb-1" />
              <span>Upload File</span>
            </button>
          </div>

          {/* Manual Entry Mode */}
          {inputMode === 'manual' && (
            <>
              {/* Instructions */}
              <div className="bg-[#202020] border-2 border-white p-4 mb-6">
                <h3 className="mb-2 text-white uppercase tracking-wide">Instructions</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li><span className="text-[#ff0055]">▸</span> Enter one artist name per line</li>
                  <li><span className="text-[#ff0055]">▸</span> Include at least 10-20 artists for best results</li>
                  <li><span className="text-[#ff0055]">▸</span> Mix of different artists will give you better insights</li>
                </ul>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="artist-list" className="block mb-2 text-white uppercase tracking-wide">
                    Artist List
                  </label>
                  <textarea
                    id="artist-list"
                    value={artistList}
                    onChange={(e) => setArtistList(e.target.value)}
                    placeholder="Enter artist names, one per line..."
                    rows={12}
                    className="w-full px-4 py-3 bg-white border-2 border-white focus:border-[#ff0055] outline-none transition-all resize-none text-black"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleUseExample}
                    className="text-sm text-[#ff0055] hover:text-white uppercase tracking-wide"
                  >
                    Use example artists
                  </button>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={!artistList.trim()}
                    className="flex items-center gap-2 bg-[#ff0055] text-white px-6 py-3 border-2 border-[#ff0055] hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                  >
                    Generate Portrait
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Upload Mode */}
          {inputMode === 'upload' && (
            <>
              {/* Upload Instructions */}
              <div className="bg-[#202020] border-2 border-white p-4 mb-6">
                <h3 className="mb-2 text-white uppercase tracking-wide">Supported Formats</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li><span className="text-[#ff0055]">▸</span> <span className="text-white">Spotify JSON</span> - Export from your Spotify data download</li>
                  <li><span className="text-[#ff0055]">▸</span> <span className="text-white">CSV Files</span> - From Spotify, Discogs, or custom exports</li>
                  <li><span className="text-[#ff0055]">▸</span> <span className="text-white">Text Files</span> - One artist name per line</li>
                </ul>
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <label
                  htmlFor="file-upload"
                  className="block w-full border-2 border-dashed border-white p-8 text-center cursor-pointer hover:border-[#ff0055] transition-all"
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-white" />
                  <p className="text-white mb-1 uppercase tracking-wide">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-400 uppercase tracking-wide">
                    JSON, CSV, or TXT files
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".json,.csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Upload Status */}
              {uploadStatus && (
                <div className={`border-2 p-4 mb-6 ${
                  uploadStatus.includes('Error') || uploadStatus.includes('No artists')
                    ? 'border-red-500 bg-[#202020]'
                    : uploadStatus.includes('Successfully')
                    ? 'border-green-500 bg-[#202020]'
                    : 'border-blue-500 bg-[#202020]'
                }`}>
                  <p className={`text-sm uppercase tracking-wide ${
                    uploadStatus.includes('Error') || uploadStatus.includes('No artists')
                      ? 'text-red-500'
                      : uploadStatus.includes('Successfully')
                      ? 'text-green-500'
                      : 'text-blue-500'
                  }`}>{uploadStatus}</p>
                </div>
              )}

              {/* Preview of uploaded artists */}
              {artistList && (
                <>
                  <div className="mb-4">
                    <label className="block mb-2 text-white uppercase tracking-wide">
                      Loaded Artists ({artistList.split('\n').filter(a => a.trim()).length})
                    </label>
                    <textarea
                      value={artistList}
                      onChange={(e) => setArtistList(e.target.value)}
                      rows={10}
                      className="w-full px-4 py-3 bg-white border-2 border-white focus:border-[#ff0055] outline-none transition-all resize-none text-black"
                      placeholder="Upload a file to see your artists here..."
                    />
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">
                      You can edit the list before generating your portrait
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={!artistList.trim()}
                        className="flex items-center gap-2 bg-[#ff0055] text-white px-6 py-3 border-2 border-[#ff0055] hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                      >
                        Generate Portrait
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Help Text */}
              <div className="mt-6 bg-[#202020] border-2 border-white p-4">
                <h4 className="text-white mb-2 uppercase tracking-wide">Need help exporting your data?</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li><span className="text-[#ff0055]">▸</span> <strong className="text-white">Spotify:</strong> Request your data at privacy.spotify.com/en/</li>
                  <li><span className="text-[#ff0055]">▸</span> <strong className="text-white">Discogs:</strong> Export your collection as CSV from your profile</li>
                  <li><span className="text-[#ff0055]">▸</span> <strong className="text-white">Custom:</strong> Create a text file with one artist per line</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}