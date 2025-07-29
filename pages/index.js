import React, { useState, useEffect } from 'react';
import { Search, Upload, BookOpen, Star, Calendar, Hash, Filter, X, FileText, Database, Wifi, WifiOff, Save, Download, Lock, Unlock, User, Shield } from 'lucide-react';

const ManhwaDatabase = () => {
  const [manhwaData, setManhwaData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    genres: [],
    categories: [],
    rating: [],
    chapters: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const [thumbnailData, setThumbnailData] = useState(new Map());
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [dbLoading, setDbLoading] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState({
    url: 'https://wemlzcwuqckptmcnjlng.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlbWx6Y3d1cWNrcHRtY25qbG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTI3MzEsImV4cCI6MjA2OTM4ODczMX0.q6JHd2SwmxKKRjrTuYsCBLgVpS8AxnJ95mrOeYlwrWI'
  });
  const [showDbConfig, setShowDbConfig] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({
    username: '',
    password: ''
  });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // Load sample data on component mount and auto-connect to database
  useEffect(() => {
    const initializeApp = async () => {
      console.log('Initializing app...');
      
      if (supabaseConfig.url && supabaseConfig.anonKey) {
        console.log('Database credentials found, attempting connection...');
        setDbLoading(true);
        
        try {
          const testResponse = await fetch(`${supabaseConfig.url}/rest/v1/manhwa?select=*&limit=1`, {
            headers: {
              'apikey': supabaseConfig.anonKey,
              'Authorization': `Bearer ${supabaseConfig.anonKey}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('Database test response status:', testResponse.status);

          if (testResponse.ok) {
            setDbConnected(true);
            console.log('Database connected successfully, loading data...');
            
            const dataResponse = await fetch(`${supabaseConfig.url}/rest/v1/manhwa?select=*`, {
              headers: {
                'apikey': supabaseConfig.anonKey,
                'Authorization': `Bearer ${supabaseConfig.anonKey}`,
                'Content-Type': 'application/json'
              }
            });

            if (dataResponse.ok) {
              const data = await dataResponse.json();
              console.log(`Raw data from database: ${data.length} records`);
              
              if (data.length > 0) {
                const formattedData = data.map(item => ({
                  title: item.title || '',
                  synopsis: item.synopsis || '',
                  genres: Array.isArray(item.genres) ? item.genres : [],
                  categories: Array.isArray(item.categories) ? item.categories : [],
                  authors: Array.isArray(item.authors) ? item.authors : [],
                  year_released: item.year_released || '',
                  chapters: item.chapters || '',
                  status: item.status || '',
                  rating: item.rating || '',
                  thumbnail: item.thumbnail || ''
                }));
                
                const uniqueData = removeDuplicates(formattedData, 'title');
                setManhwaData(uniqueData);
                console.log('✅ Database data loaded successfully!');
              } else {
                loadSampleData();
              }
            } else {
              loadSampleData();
            }
          } else {
            loadSampleData();
          }
        } catch (error) {
          console.error('Database initialization error:', error);
          loadSampleData();
        } finally {
          setDbLoading(false);
        }
      } else {
        loadSampleData();
      }
    };

    initializeApp();
  }, []);

  const loadSampleData = () => {
    const sampleData = [
      {
        title: "0.0000001% Demon King",
        synopsis: "The 72 Demon Kings, who received the order to destroy the earth, each went through a trial by the Great Demon King Astrea.",
        genres: ["Action", "Comedy", "Fantasy", "Shounen"],
        categories: ["Politics", "Unique Cheat", "Weak to Strong"],
        authors: ["Yuwol", "Palanyeong"],
        year_released: "2024",
        chapters: "Less than 100",
        status: "Ongoing",
        rating: "Decent",
        thumbnail: ""
      },
      {
        title: "1 Second",
        synopsis: "Every second counts when you're a first responder. But what if you could see a glimpse into the future?",
        genres: ["Action", "Drama", "Supernatural"],
        categories: ["Friendship", "Modern World Cheat"],
        authors: ["SiNi"],
        year_released: "2019",
        chapters: "Less than 100",
        status: "Unknown",
        rating: "Good",
        thumbnail: ""
      },
      {
        title: "1331",
        synopsis: "Yoo Min, a full time department store worker, begins to feel skeptical about her own life.",
        genres: ["Drama", "Fantasy", "Horror", "Psychological"],
        categories: ["Apocalypse", "Female Protagonist", "Survival"],
        authors: ["Bora Giraffe"],
        year_released: "2022",
        chapters: "71",
        status: "Complete",
        rating: "Recommended",
        thumbnail: ""
      }
    ];
    setManhwaData(sampleData);
  };

  const removeDuplicates = (array, key) => {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key]?.toLowerCase()?.trim();
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  };

  const adminLogin = async () => {
    if (!adminCredentials.username || !adminCredentials.password) {
      alert('Please enter both username and password');
      return;
    }

    setAdminLoading(true);
    try {
      const validCredentials = [
        { username: 'admin', password: 'manhwa2024' },
        { username: 'manhwaadmin', password: 'database123' }
      ];

      const isValid = validCredentials.some(
        cred => cred.username === adminCredentials.username && cred.password === adminCredentials.password
      );

      if (isValid) {
        setAdminMode(true);
        setShowAdminLogin(false);
        alert('Admin login successful!');
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setAdminLoading(false);
    }
  };

  const adminLogout = () => {
    setAdminMode(false);
    setAdminCredentials({ username: '', password: '' });
  };

  const filteredData = manhwaData.filter(manhwa => {
    const searchMatch = searchTerm === '' || 
      manhwa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manhwa.synopsis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (manhwa.genres && manhwa.genres.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (manhwa.authors && manhwa.authors.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())));

    const genreMatch = selectedFilters.genres.length === 0 || 
      (manhwa.genres && selectedFilters.genres.every(genre => manhwa.genres.includes(genre)));
    
    const categoryMatch = selectedFilters.categories.length === 0 || 
      (manhwa.categories && selectedFilters.categories.every(category => manhwa.categories.includes(category)));
    
    const ratingMatch = selectedFilters.rating.length === 0 || 
      selectedFilters.rating.includes(manhwa.rating);
    
    const chapterMatch = selectedFilters.chapters.length === 0 || 
      selectedFilters.chapters.includes(manhwa.chapters);

    return searchMatch && genreMatch && categoryMatch && ratingMatch && chapterMatch;
  });

  const getUniqueValues = (field) => {
    const values = new Set();
    manhwaData.forEach(manhwa => {
      if (Array.isArray(manhwa[field])) {
        manhwa[field].forEach(value => {
          if (value && value.trim()) values.add(value.trim());
        });
      } else if (manhwa[field] && manhwa[field].trim()) {
        values.add(manhwa[field].trim());
      }
    });
    return Array.from(values).sort();
  };

  const toggleFilter = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      genres: [],
      categories: [],
      rating: [],
      chapters: []
    });
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Highly Recommended': return '#fbbf24';
      case 'Recommended': return '#10b981';
      case 'Good': return '#3b82f6';
      case 'Decent': return '#6b7280';
      case 'Meh': return '#f97316';
      case 'Dropped': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const toggleDescription = (index) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedDescriptions(newExpanded);
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text) return { text: '', needsTruncation: false };
    
    if (text.length <= maxLength) {
      return { text, needsTruncation: false };
    }
    
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    const finalText = lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
    
    return {
      text: finalText + '...',
      needsTruncation: true
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <BookOpen size={48} className="text-blue-300 mx-auto mb-4 animate-pulse" />
          <h2 className="text-white text-xl font-semibold mb-2">Loading Manhwa Database...</h2>
          <p className="text-blue-200">Processing your CSV file</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      {/* NEW Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-600">
            <div className="text-center mb-6">
              <BookOpen size={48} className="text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-3">Welcome to Manhwa Database!</h2>
              <div className="w-12 h-1 bg-purple-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="text-gray-300 space-y-4 mb-6 text-sm leading-relaxed">
              <div className="bg-slate-700/30 p-4 rounded-lg border-l-4 border-yellow-500">
                <p><strong className="text-yellow-400">Work in Progress:</strong> This database is currently under active development. Thank you for your patience as we continue to improve and expand the platform.</p>
              </div>
              
              <p>This website was inspired by an incredible <strong className="text-blue-400">community-driven manhwa spreadsheet</strong> shared on Reddit. I was so impressed by the comprehensive collection and detailed reviews that I decided to transform it into an easily navigable web platform.</p>
              
              <p>The database automatically loads with <strong className="text-purple-400">hundreds of manhwa titles</strong>, complete with detailed information, community ratings, and advanced filtering options to help you discover your next favorite read.</p>
              
              <div className="bg-slate-700/30 p-3 rounded-lg">
                <p className="text-center text-xs text-gray-400">✨ Ready to explore? The collection is loaded and waiting for you!</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-blue-500 transition-all transform hover:scale-105"
              >
                🚀 Start Exploring!
              </button>
              
              <button
                onClick={() => {
                  setShowWelcomeModal(false);
                  setShowCreditsModal(true);
                }}
                className="w-full px-6 py-3 bg-slate-700 text-gray-300 rounded-lg font-medium hover:bg-slate-600 transition-colors border border-slate-600"
              >
                📜 View Credits & Tribute
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credits & Tribute Modal */}
      {showCreditsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-slate-600 max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BookOpen size={48} className="text-blue-400" />
                <Star size={32} className="text-yellow-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Credits & Tribute</h2>
              <p className="text-gray-400">Honoring the community that made this possible</p>
            </div>
            
            <div className="text-gray-300 space-y-4 mb-6 text-sm leading-relaxed">
              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  🏆 Original Creator Recognition
                </h3>
                <p>This database exists thanks to the incredible work of a dedicated community member who created and maintained a comprehensive manhwa spreadsheet. Their meticulous cataloging of hundreds of titles, complete with ratings, synopses, and detailed categorizations, provided the foundation for this web platform.</p>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  🌟 Community Contribution
                </h3>
                <p>The original spreadsheet was shared on Reddit's manhwa community, where passionate readers contributed reviews, recommendations, and updates. This collaborative effort represents countless hours of reading, evaluating, and organizing content for the benefit of fellow enthusiasts.</p>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  💻 Web Platform Development
                </h3>
                <p>I transformed the original spreadsheet into this interactive web database to make the wealth of information more accessible and user-friendly. The goal was to preserve all the valuable community insights while adding modern search, filtering, and browsing capabilities.</p>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  🙏 Acknowledgment
                </h3>
                <p>This project stands as a tribute to the manhwa community's dedication to sharing knowledge and helping others discover amazing stories. Every rating, review, and recommendation in this database represents a reader's genuine experience and desire to guide others toward great content.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3 justify-center flex-wrap">
                <a
                  href="https://www.reddit.com/r/manhwa/comments/1ioddo5/final_manhwa_list_spreadsheet/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-500 transition-colors text-sm"
                >
                  📱 View Reddit Post
                </a>
                <a
                  href="https://docs.google.com/spreadsheets/d/1ZluFOVtJCv-cQLXWhmCLNoZFIMLV0eTrqozwyEb1zw8/edit?usp=drivesdk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors text-sm"
                >
                  📊 Original Spreadsheet
                </a>
              </div>
              
              <button
                onClick={() => setShowCreditsModal(false)}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-600">
            <div className="text-center mb-6">
              <User size={48} className="text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
              <p className="text-gray-300 text-sm">Access database management features</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={adminCredentials.username}
                  onChange={(e) => setAdminCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-3 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="Enter admin username"
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-3 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  placeholder="Enter admin password"
                  onKeyPress={(e) => e.key === 'Enter' && adminLogin()}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={adminLogin}
                disabled={adminLoading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {adminLoading ? 'Logging in...' : 'Login'}
              </button>
              
              <button
                onClick={() => setShowAdminLogin(false)}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/90 backdrop-blur-sm text-white p-4 shadow-lg border-b border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <BookOpen size={32} className="text-blue-400" />
              <h1 className="text-2xl md:text-3xl font-bold text-blue-400">Manhwa Database</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {adminMode && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-600/20 border border-yellow-500 rounded-lg">
                  <Shield size={16} className="text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-medium">Admin Mode</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                {dbConnected ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-600/20 border border-green-500 rounded-lg">
                    <Wifi size={16} className="text-green-400" />
                    <span className="text-green-400 text-sm font-medium">DB Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-600/20 border border-red-500 rounded-lg">
                    <WifiOff size={16} className="text-red-400" />
                    <span className="text-red-400 text-sm font-medium">DB Offline</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => adminMode ? adminLogout() : setShowAdminLogin(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  adminMode 
                    ? 'bg-red-600 text-white hover:bg-red-500' 
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {adminMode ? (
                  <>
                    <Unlock size={16} />
                    Logout
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    Admin
                  </>
                )}
              </button>
              
              <div className="text-gray-300 text-sm bg-black/20 px-3 py-2 rounded-lg border border-gray-600">
                📚 {manhwaData.length} titles
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Search and Filters */}
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6 shadow-lg border border-slate-600">
          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="🔍 Search by title, synopsis, genre, author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {Object.values(selectedFilters).some(arr => arr.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
              >
                <X size={16} />
                Clear Filters
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-600">
              <div>
                <h4 className="font-semibold text-white mb-2 text-sm">Genres</h4>
                <div className="flex flex-wrap gap-1">
                  {getUniqueValues('genres').map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleFilter('genres', genre)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        selectedFilters.genres.includes(genre)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-700 text-gray-300 border-slate-500 hover:bg-slate-600'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2 text-sm">Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {getUniqueValues('categories').map(category => (
                    <button
                      key={category}
                      onClick={() => toggleFilter('categories', category)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        selectedFilters.categories.includes(category)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-slate-700 text-gray-300 border-slate-500 hover:bg-slate-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2 text-sm">Rating</h4>
                <div className="flex flex-wrap gap-1">
                  {getUniqueValues('rating').map(rating => (
                    <button
                      key={rating}
                      onClick={() => toggleFilter('rating', rating)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        selectedFilters.rating.includes(rating)
                          ? 'bg-yellow-600 text-white border-yellow-600'
                          : 'bg-slate-700 text-gray-300 border-slate-500 hover:bg-slate-600'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-2 text-sm">Chapters</h4>
                <div className="flex flex-wrap gap-1">
                  {getUniqueValues('chapters').map(chapters => (
                    <button
                      key={chapters}
                      onClick={() => toggleFilter('chapters', chapters)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        selectedFilters.chapters.includes(chapters)
                          ? 'bg-green-600 text-white border-green-600'
                          : 'bg-slate-700 text-gray-300 border-slate-500 hover:bg-slate-600'
                      }`}
                    >
                      {chapters}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <p className="text-white font-medium text-lg mt-4 flex items-center gap-2">
            <BookOpen size={20} className="text-blue-400" />
            Found {filteredData.length} manhwa titles
          </p>
        </div>

        {/* Manhwa Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredData.map((manhwa, index) => (
            <div key={index} className="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-slate-600 overflow-hidden hover:border-slate-500 transition-all duration-300">
              <div className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-white flex-1 pr-2">
                    {manhwa.title}
                  </h3>
                  <div 
                    className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg flex-shrink-0"
                    style={{ 
                      backgroundColor: getRatingColor(manhwa.rating),
                      color: 'white'
                    }}
                  >
                    <Star size={12} fill="currentColor" />
                    {manhwa.rating}
                  </div>
                </div>

                <div className="mb-4">
                  {(() => {
                    const isExpanded = expandedDescriptions.has(index);
                    const { text: truncatedText, needsTruncation } = truncateText(manhwa.synopsis);
                    const displayText = isExpanded ? manhwa.synopsis : truncatedText;
                    
                    return (
                      <>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {displayText}
                        </p>
                        {needsTruncation && (
                          <button
                            onClick={() => toggleDescription(index)}
                            className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                          >
                            {isExpanded ? '▲ Hide Lore' : '▼ Reveal Lore'}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-400 mb-1">Genres</div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {manhwa.genres && manhwa.genres.map((genre, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-600/30 text-blue-200 text-xs rounded-full border border-blue-500/30">
                        {genre}
                      </span>
                    ))}
                  </div>
                  
                  {manhwa.categories && manhwa.categories.length > 0 && (
                    <>
                      <div className="text-xs font-semibold text-gray-400 mb-1">Categories</div>
                      <div className="flex flex-wrap gap-1">
                        {manhwa.categories.map((category, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-600/30 text-purple-200 text-xs rounded-full border border-purple-500/30">
                            {category}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="text-sm text-gray-300 mb-4">
                  {manhwa.authors && manhwa.authors.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={14} className="text-yellow-400" />
                      <span>{manhwa.authors.join(', ')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-blue-400" />
                      <span>{manhwa.year_released}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash size={14} className="text-green-400" />
                      <span>{manhwa.chapters}</span>
                    </div>
                  </div>

                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    manhwa.status === 'Ongoing' ? 'bg-green-600/30 text-green-200 border border-green-500/30' : 
                    manhwa.status === 'Complete' ? 'bg-blue-600/30 text-blue-200 border border-blue-500/30' : 
                    'bg-gray-600/30 text-gray-200 border border-gray-500/30'
                  }`}>
                    {manhwa.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No manhwa found
            </h3>
            <p className="text-gray-400">Try adjusting your search terms or filters</p>
          </div>
        )}

        {/* Credits Section */}
        <div className="mt-12 bg-slate-800/90 backdrop-blur-sm rounded-xl border border-slate-600 p-6 md:p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Credits & Data Source</h2>
          <p className="text-gray-300 mb-4">
            This database is built upon the incredible work of the manhwa community
          </p>
          <div className="flex gap-4 justify-center flex-wrap mb-4">
            <a
              href="https://www.reddit.com/r/manhwa/comments/1ioddo5/final_manhwa_list_spreadsheet/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-500 transition-colors"
            >
              📱 Reddit Post
            </a>
            <a
              href="https://docs.google.com/spreadsheets/d/1ZluFOVtJCv-cQLXWhmCLNoZFIMLV0eTrqozwyEb1zw8/edit?usp=drivesdk"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors"
            >
              📊 Original Spreadsheet
            </a>
            <button
              onClick={() => setShowCreditsModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
            >
              📜 Full Tribute
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManhwaDatabase;
