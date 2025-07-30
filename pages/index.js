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
  const [showLinkManager, setShowLinkManager] = useState(false);
  const [linkData, setLinkData] = useState([]);
  const [selectedManhwaForLinks, setSelectedManhwaForLinks] = useState(null);
  const [newLinks, setNewLinks] = useState({
    link1: '',
    link2: '',
    link3: ''
  });
  const [linkUploadFile, setLinkUploadFile] = useState(null);
  const [isLinkUploading, setIsLinkUploading] = useState(false);

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
                  id: item.id,
                  title: item.title || '',
                  synopsis: item.synopsis || '',
                  genres: Array.isArray(item.genres) ? item.genres : [],
                  categories: Array.isArray(item.categories) ? item.categories : [],
                  authors: Array.isArray(item.authors) ? item.authors : [],
                  year_released: item.year_released || '',
                  chapters: item.chapters || '',
                  status: item.status || '',
                  rating: item.rating || '',
                  thumbnail: item.thumbnail || '',
                  link1: item.link1 || '',
                  link2: item.link2 || '',
                  link3: item.link3 || ''
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
        id: 1,
        title: "0.0000001% Demon King",
        synopsis: "The 72 Demon Kings, who received the order to destroy the earth, each went through a trial by the Great Demon King Astrea.",
        genres: ["Action", "Comedy", "Fantasy", "Shounen"],
        categories: ["Politics", "Unique Cheat", "Weak to Strong"],
        authors: ["Yuwol", "Palanyeong"],
        year_released: "2024",
        chapters: "Less than 100",
        status: "Ongoing",
        rating: "Decent",
        thumbnail: "",
        link1: "",
        link2: "",
        link3: ""
      },
      {
        id: 2,
        title: "1 Second",
        synopsis: "Every second counts when you're a first responder. But what if you could see a glimpse into the future?",
        genres: ["Action", "Drama", "Supernatural"],
        categories: ["Friendship", "Modern World Cheat"],
        authors: ["SiNi"],
        year_released: "2019",
        chapters: "Less than 100",
        status: "Unknown",
        rating: "Good",
        thumbnail: "",
        link1: "",
        link2: "",
        link3: ""
      },
      {
        id: 3,
        title: "1331",
        synopsis: "Yoo Min, a full time department store worker, begins to feel skeptical about her own life.",
        genres: ["Drama", "Fantasy", "Horror", "Psychological"],
        categories: ["Apocalypse", "Female Protagonist", "Survival"],
        authors: ["Bora Giraffe"],
        year_released: "2022",
        chapters: "71",
        status: "Complete",
        rating: "Recommended",
        thumbnail: "",
        link1: "",
        link2: "",
        link3: ""
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

  // Link Management Functions
  const handleLinkUpload = async (file) => {
    if (!file) return;
    
    setIsLinkUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        alert('Empty file');
        return;
      }

      // Parse header (works for both CSV and TXT with comma separation)
      const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      const titleIndex = header.indexOf('Title');
      const link1Index = header.indexOf('Link1');
      const link2Index = header.indexOf('Link2');
      const link3Index = header.indexOf('Link3');

      if (titleIndex === -1) {
        alert('Title column not found in file. Please ensure your file has a header row with "Title" column.');
        return;
      }

      const linkUpdates = [];
      
      for (let i = 1; i < lines.length; i++) {
        // Handle both CSV and TXT formats with comma separation
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        const title = values[titleIndex];
        
        if (title) {
          linkUpdates.push({
            title,
            link1: link1Index !== -1 ? values[link1Index] || '' : '',
            link2: link2Index !== -1 ? values[link2Index] || '' : '',
            link3: link3Index !== -1 ? values[link3Index] || '' : ''
          });
        }
      }

      console.log('Parsed link updates:', linkUpdates);

      if (linkUpdates.length === 0) {
        alert('No valid data found in file. Please check the format.');
        return;
      }

      // Update database if connected
      if (dbConnected && supabaseConfig.url && supabaseConfig.anonKey) {
        let successCount = 0;
        let errorCount = 0;

        for (const update of linkUpdates) {
          try {
            const response = await fetch(`${supabaseConfig.url}/rest/v1/manhwa?title=eq.${encodeURIComponent(update.title)}`, {
              method: 'PATCH',
              headers: {
                'apikey': supabaseConfig.anonKey,
                'Authorization': `Bearer ${supabaseConfig.anonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                link1: update.link1,
                link2: update.link2,
                link3: update.link3
              })
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
              console.error(`Failed to update ${update.title}:`, response.status);
            }
          } catch (error) {
            errorCount++;
            console.error(`Error updating ${update.title}:`, error);
          }
        }

        alert(`Link upload complete!\nSuccessful: ${successCount}\nErrors: ${errorCount}\n\nNote: Errors may occur if manhwa titles don't exactly match database entries.`);
        
        // Reload data to reflect changes
        if (successCount > 0) {
          window.location.reload();
        }
      } else {
        // Update local data only
        setManhwaData(prevData => 
          prevData.map(manhwa => {
            const linkUpdate = linkUpdates.find(update => 
              update.title.toLowerCase().trim() === manhwa.title.toLowerCase().trim()
            );
            
            if (linkUpdate) {
              return {
                ...manhwa,
                link1: linkUpdate.link1,
                link2: linkUpdate.link2,
                link3: linkUpdate.link3
              };
            }
            return manhwa;
          })
        );
        
        alert(`Updated ${linkUpdates.length} manhwa entries with links!`);
      }

    } catch (error) {
      console.error('Error processing link file:', error);
      alert('Error processing file: ' + error.message);
    } finally {
      setIsLinkUploading(false);
      setLinkUploadFile(null);
    }
  };

  const updateManhwaLinks = async (manhwaId, links) => {
    if (!dbConnected || !supabaseConfig.url || !supabaseConfig.anonKey) {
      alert('Database not connected');
      return false;
    }

    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/manhwa?id=eq.${manhwaId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          link1: links.link1,
          link2: links.link2,
          link3: links.link3
        })
      });

      if (response.ok) {
        // Update local data
        setManhwaData(prevData => 
          prevData.map(manhwa => 
            manhwa.id === manhwaId 
              ? { ...manhwa, link1: links.link1, link2: links.link2, link3: links.link3 }
              : manhwa
          )
        );
        return true;
      } else {
        console.error('Failed to update links:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error updating links:', error);
      return false;
    }
  };

  const handleSaveLinks = async () => {
    if (!selectedManhwaForLinks) return;

    const success = await updateManhwaLinks(selectedManhwaForLinks.id, newLinks);
    
    if (success) {
      alert('Links updated successfully!');
      setSelectedManhwaForLinks(null);
      setNewLinks({ link1: '', link2: '', link3: '' });
    } else {
      alert('Failed to update links');
    }
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
      {/* NEW Welcome Modal - Mobile Optimized */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-slate-800 rounded-2xl p-4 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-600 mx-3 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4 sm:mb-6">
              <BookOpen size={40} className="text-blue-400 mx-auto mb-3 sm:mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Welcome to Manhwa Database!</h2>
              <div className="w-12 h-1 bg-purple-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="text-gray-300 space-y-3 sm:space-y-4 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">
              <div className="bg-slate-700/30 p-3 sm:p-4 rounded-lg border-l-4 border-yellow-500">
                <p><strong className="text-yellow-400">Work in Progress:</strong> This database is currently under active development. Thank you for your patience as we continue to improve and expand the platform.</p>
              </div>
              
              <p>This website was inspired by an incredible <strong className="text-blue-400">community-driven manhwa spreadsheet</strong> shared on Reddit. I was so impressed by the comprehensive collection and detailed reviews that I decided to transform it into an easily navigable web platform.</p>
              
              <p>The database automatically loads with <strong className="text-purple-400">hundreds of manhwa titles</strong>, complete with detailed information, community ratings, and advanced filtering options to help you discover your next favorite read.</p>
              
              <div className="bg-slate-700/30 p-2 sm:p-3 rounded-lg">
                <p className="text-center text-xs text-gray-400">✨ Ready to explore? The collection is loaded and waiting for you!</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full px-4 sm:px-6 py-3 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-blue-500 transition-all transform hover:scale-105 text-sm sm:text-base"
              >
                🚀 Start Exploring!
              </button>
              
              <button
                onClick={() => {
                  setShowWelcomeModal(false);
                  setShowCreditsModal(true);
                }}
                className="w-full px-4 sm:px-6 py-3 sm:py-3 bg-slate-700 text-gray-300 rounded-lg font-medium hover:bg-slate-600 transition-colors border border-slate-600 text-sm sm:text-base"
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

      {/* Link Manager Modal */}
      {showLinkManager && adminMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-4xl w-full shadow-2xl border border-slate-600 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Database size={32} className="text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Link Manager</h2>
              </div>
              <button
                onClick={() => {
                  setShowLinkManager(false);
                  setSelectedManhwaForLinks(null);
                  setNewLinks({ link1: '', link2: '', link3: '' });
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {/* Bulk Upload Section */}
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6 border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Upload size={20} className="text-blue-400" />
                Bulk Upload Links (CSV/TXT)
              </h3>
              
              <div className="space-y-4">
                <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-3">
                  <p className="text-blue-200 text-sm mb-2">
                    <strong>File Format (CSV or TXT):</strong> Title,Link1,Link2,Link3
                  </p>
                  <p className="text-blue-200 text-sm mb-2">
                    Upload a CSV or TXT file with manhwa titles and their corresponding links.
                  </p>
                  <div className="bg-slate-700/50 p-2 rounded text-xs text-blue-100 font-mono">
                    Title,Link1,Link2,Link3<br/>
                    "Manhwa Title 1","https://site1.com/link1","https://site2.com/link2",""<br/>
                    "Manhwa Title 2","https://site1.com/link3","https://site2.com/link4","https://site3.com/link5"
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={(e) => setLinkUploadFile(e.target.files[0])}
                    className="flex-1 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                  />
                  
                  <button
                    onClick={() => linkUploadFile && handleLinkUpload(linkUploadFile)}
                    disabled={!linkUploadFile || isLinkUploading}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLinkUploading ? 'Uploading...' : 'Upload Links'}
                  </button>
                </div>
                
                <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-3">
                  <p className="text-yellow-200 text-xs">
                    <strong>⚠️ Important:</strong> Manhwa titles in your file must exactly match the titles in the database for successful updates. Case-sensitive matching is used.
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Edit Section */}
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText size={20} className="text-green-400" />
                Edit Individual Links
              </h3>
              
              {!selectedManhwaForLinks ? (
                <div>
                  <p className="text-gray-300 mb-4">Select a manhwa to edit its links:</p>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {manhwaData.map((manhwa, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedManhwaForLinks(manhwa);
                          setNewLinks({
                            link1: manhwa.link1 || '',
                            link2: manhwa.link2 || '',
                            link3: manhwa.link3 || ''
                          });
                        }}
                        className="w-full text-left p-3 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors border border-slate-500"
                      >
                        <div className="text-white font-medium">{manhwa.title}</div>
                        <div className="text-gray-300 text-sm">
                          Links: {[manhwa.link1, manhwa.link2, manhwa.link3].filter(Boolean).length}/3
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Editing: {selectedManhwaForLinks.title}</h4>
                    <button
                      onClick={() => {
                        setSelectedManhwaForLinks(null);
                        setNewLinks({ link1: '', link2: '', link3: '' });
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      ← Back to list
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Link 1</label>
                      <input
                        type="url"
                        value={newLinks.link1}
                        onChange={(e) => setNewLinks(prev => ({ ...prev, link1: e.target.value }))}
                        placeholder="https://example.com/manhwa-link-1"
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Link 2</label>
                      <input
                        type="url"
                        value={newLinks.link2}
                        onChange={(e) => setNewLinks(prev => ({ ...prev, link2: e.target.value }))}
                        placeholder="https://example.com/manhwa-link-2"
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Link 3</label>
                      <input
                        type="url"
                        value={newLinks.link3}
                        onChange={(e) => setNewLinks(prev => ({ ...prev, link3: e.target.value }))}
                        placeholder="https://example.com/manhwa-link-3"
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={handleSaveLinks}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Save size={16} />
                        Save Links
                      </button>
                      
                      <button
                        onClick={() => {
                          setNewLinks({
                            link1: selectedManhwaForLinks.link1 || '',
                            link2: selectedManhwaForLinks.link2 || '',
                            link3: selectedManhwaForLinks.link3 || ''
                          });
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-yellow-600/20 border border-yellow-500 rounded-lg">
                    <Shield size={16} className="text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">Admin Mode</span>
                  </div>
                  
                  <button
                    onClick={() => setShowLinkManager(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-500 transition-colors text-sm"
                  >
                    <Database size={16} />
                    Manage Links
                  </button>
                </>
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

                {/* Reading Links */}
                {(manhwa.link1 || manhwa.link2 || manhwa.link3) && (
                  <div className="mt-4 pt-4 border-t border-slate-600">
                    <div className="text-xs font-semibold text-gray-400 mb-2">📖 Reading Links</div>
                    <div className="flex flex-wrap gap-2">
                      {manhwa.link1 && (
                        <a
                          href={manhwa.link1}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg font-medium transition-colors"
                        >
                          Source 1
                        </a>
                      )}
                      {manhwa.link2 && (
                        <a
                          href={manhwa.link2}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-lg font-medium transition-colors"
                        >
                          Source 2
                        </a>
                      )}
                      {manhwa.link3 && (
                        <a
                          href={manhwa.link3}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg font-medium transition-colors"
                        >
                          Source 3
                        </a>
                      )}
                    </div>
                  </div>
                )}
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
