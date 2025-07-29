import React, { useState, useEffect } from 'react';
import { Search, Upload, BookOpen, Star, Calendar, Hash, Filter, X, FileText, Sword, Sparkles, Shield, Wand2, Scroll, Zap } from 'lucide-react';

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
  const [showThumbnailSection, setShowThumbnailSection] = useState(true);

  // Load sample data on component mount
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    const sampleData = [
      {
        title: "0.0000001% Demon King",
        synopsis: "The 72 Demon Kings, who received the order to destroy the earth, each went through a trial by the Great Demon King Astrea. Those who passed the trial earned the title of Demon King, and each Demon King was granted special powers by the Great Demon King. So far, each Demon King had been granted extraordinary abilities. When Karos became a Demon King, he received a power from the Great Demon King, but… 'Great Demon King, no matter how much I think about it, there is a problem with my power.' 'Problem?' Among the Demon Kings with extraordinary abilities… Karos received the [Gacha] ability. 'Gacha as the power of a Demon King? How am I supposed to rule the world with Gacha?!'",
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
        synopsis: "Every second counts when you're a first responder. But what if you could see a glimpse into the future? Hosu is a firefighter with the supernatural ability to do just that. There's just one catch. It only works when he feels extreme stress under pressure. Will knowing what will happen ahead of time help Hosu extinguish fires before they completely destroy homes and lives? And will he learn to wield his ability when he needs it most?",
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
        synopsis: "Yoo Min, a full time department store worker, begins to feel skeptical about her own life. She decides to quit her job due to a conflict with her manager. However, when she enters the manager's office, she comes face to face with the manager who has now turned into a monster. Yoo Min immediately runs away from the manager, but encounters another monster and faces danger once again. Outside the department store, a world experiencing doom had already begun unfolding.",
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

  const handleFileUpload = (file) => {
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        console.log('Processing CSV file...');
        
        const lines = csv.split(/\r?\n/);
        let dataStartIndex = 8; // Your CSV format starts at row 8
        const processedData = [];

        // Process each data row
        for (let i = dataStartIndex; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const row = parseCSVLine(line);
          
          if (row.length < 11 || !row[1] || row[1].trim() === '' || row[1].toLowerCase() === 'title') {
            continue;
          }

          const title = cleanField(row[1]);
          const synopsis = cleanField(row[2]);
          const genresText = cleanField(row[3]);
          const categoriesText = cleanField(row[4]);
          const authorsText = cleanField(row[5]);

          const genres = genresText ? 
            genresText.split(',').map(g => g.trim()).filter(g => g && g.length > 0 && g.length < 50) : [];

          const categories = categoriesText ? 
            categoriesText.split(',').map(c => c.trim()).filter(c => c && c.length > 0 && c.length < 100) : [];

          const authors = authorsText ? 
            authorsText.split(',').map(a => a.trim()).filter(a => a && a.length > 0 && a.length < 100) : [];

          const manhwa = {
            title: title,
            synopsis: synopsis,
            genres: genres,
            categories: categories,
            authors: authors,
            year_released: cleanField(row[6]),
            chapters: cleanField(row[7]),
            status: cleanField(row[8]),
            rating: cleanField(row[9]),
            related_series: cleanField(row[10]),
            thumbnail: thumbnailData.get(title) || ""
          };

          if (manhwa.title && manhwa.title.length > 1) {
            processedData.push(manhwa);
          }
        }

        if (processedData.length > 0) {
          setManhwaData(processedData);
          alert(`Successfully loaded ${processedData.length} manhwa entries!`);
        } else {
          alert('No valid manhwa data found. Please check the CSV format.');
        }
      } catch (error) {
        alert('Error processing CSV file: ' + error.message);
        console.error('CSV processing error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleThumbnailUpload = (file) => {
    if (!file) return;

    setIsThumbnailLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        console.log('Processing thumbnail CSV file...');
        
        const lines = csv.split(/\r?\n/);
        const newThumbnailData = new Map();
        let matchedCount = 0;

        // Process each line looking for title and thumbnail URL
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const row = parseCSVLine(line);
          
          // Expecting format: Title, Thumbnail URL
          if (row.length >= 2 && row[0] && row[1]) {
            const title = cleanField(row[0]);
            const thumbnailUrl = cleanField(row[1]);
            
            if (title && title.toLowerCase() !== 'title' && thumbnailUrl) {
              newThumbnailData.set(title, thumbnailUrl);
              matchedCount++;
            }
          }
        }

        setThumbnailData(newThumbnailData);
        
        // Update existing manhwa data with new thumbnails
        if (manhwaData.length > 0) {
          const updatedData = manhwaData.map(manhwa => ({
            ...manhwa,
            thumbnail: newThumbnailData.get(manhwa.title) || manhwa.thumbnail || ""
          }));
          setManhwaData(updatedData);
        }

        alert(`Successfully loaded ${matchedCount} thumbnail mappings!`);
      } catch (error) {
        alert('Error processing thumbnail CSV file: ' + error.message);
        console.error('Thumbnail CSV processing error:', error);
      } finally {
        setIsThumbnailLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'));
    if (csvFile) {
      handleFileUpload(csvFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Helper function to clean CSV fields
  const cleanField = (field) => {
    if (!field) return '';
    let cleaned = field.toString().trim();
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1);
    }
    cleaned = cleaned.replace(/"/g, '');
    return cleaned;
  };

  // Enhanced CSV parser
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const filteredData = manhwaData.filter(manhwa => {
    // Search term filter
    const searchMatch = searchTerm === '' || 
      manhwa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manhwa.synopsis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (manhwa.genres && manhwa.genres.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (manhwa.authors && manhwa.authors.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())));

    // Apply filters - Changed to AND logic
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Magical particles background */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>
        
        <div className="text-center z-10 bg-black/20 backdrop-blur-sm rounded-2xl p-12 border border-purple-300/30">
          <div className="relative">
            <Scroll size={64} className="text-yellow-300 mx-auto mb-4 animate-bounce" />
            <div className="absolute -inset-2 bg-yellow-300/20 rounded-full blur-lg animate-pulse"></div>
          </div>
          <h2 className="text-purple-100 text-xl font-semibold mb-2 font-serif">📜 Channeling Ancient Scrolls...</h2>
          <p className="text-purple-300">The arcane energies are processing your manhwa grimoire</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Magical background effects */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute text-purple-300/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 10 + 8}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            ✨
          </div>
        ))}
      </div>

      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-purple-400/50 relative overflow-hidden">
            {/* Magical glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-blue-400/10 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <Scroll size={48} className="text-yellow-400 mx-auto mb-4" />
                  <div className="absolute -inset-2 bg-yellow-400/20 rounded-full blur-lg animate-pulse"></div>
                </div>
                <h2 className="text-2xl font-bold text-purple-100 mb-2 font-serif">✨ Welcome to the Arcane Manhwa Archive! ✨</h2>
              </div>
              
              <div className="text-purple-200 space-y-3 mb-6 text-sm">
                <p className="flex items-start gap-2">
                  <Wand2 size={16} className="text-yellow-400 mt-1 flex-shrink-0" />
                  <span><strong>Mystical Notice:</strong> This enchanted archive is still being forged by ancient magic, so please understand that it's still under development.</span>
                </p>
                
                <p className="flex items-start gap-2">
                  <Scroll size={16} className="text-blue-400 mt-1 flex-shrink-0" />
                  <span><strong>Grimoire Required:</strong> To unlock this archive's power, you must provide the manhwa tome yourself. The sanctuary doesn't come pre-loaded with ancient knowledge.</span>
                </p>
                
                <p className="flex items-start gap-2">
                  <Sparkles size={16} className="text-green-400 mt-1 flex-shrink-0" />
                  <span><strong>Obtain the Codex:</strong> Click the mystical portal below to download the latest manhwa grimoire, then channel it using the scroll upload ritual.</span>
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="https://mega.nz/file/8dYBhJQD#RdQRx7ut45tUFNrlPJTqskCCZ9XeNEKWWkb_cnZ1HJ4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full inline-block text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 transition-all relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <Scroll size={16} />
                    📥 Download Manhwa Grimoire (MEGA)
                  </span>
                </a>
                
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="group w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-indigo-500 transition-all relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/20 to-indigo-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <Sparkles size={16} />
                    Begin the Quest!
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-indigo-900 text-white p-6 shadow-2xl border-b-2 border-purple-500/30 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 blur-xl"></div>
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Sword size={32} className="text-yellow-400 rotate-45" />
              <div className="absolute -inset-1 bg-yellow-400/30 rounded-full blur-md"></div>
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-purple-300 to-blue-400 font-serif">
              ⚔️ Arcane Manhwa Sanctuary ⚔️
            </h1>
            <div className="relative">
              <Shield size={32} className="text-blue-400" />
              <div className="absolute -inset-1 bg-blue-400/30 rounded-full blur-md"></div>
            </div>
          </div>
          
          <div className="text-purple-200 text-sm bg-black/20 px-4 py-2 rounded-lg border border-purple-400/30 backdrop-blur-sm">
            📚 {manhwaData.length} sacred tomes archived
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-8 relative z-10">
        {/* File Upload Section */}
        {showUploadSection && (
          <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-2xl border-2 border-purple-400/30 relative overflow-hidden">
            {/* Magical border glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-blue-400/10 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-purple-100 mb-2 flex items-center gap-2">
                    <Scroll size={20} className="text-yellow-400" />
                    Channel the Ancient Manhwa Grimoire
                  </h3>
                  <p className="text-sm text-purple-300">
                    First, obtain the sacred codex, then perform the uploading ritual to unlock the archive's power.
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <a
                    href="https://mega.nz/file/8dYBhJQD#RdQRx7ut45tUFNrlPJTqskCCZ9XeNEKWWkb_cnZ1HJ4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-500 hover:to-purple-500 transition-all text-sm whitespace-nowrap relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative flex items-center gap-1">
                      <Sparkles size={14} />
                      📥 Download Codex
                    </span>
                  </a>
                  
                  <button
                    onClick={() => setShowUploadSection(false)}
                    className="group px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-500 hover:to-red-600 transition-all text-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-white/20 to-red-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative">
                      <X size={16} />
                    </span>
                  </button>
                </div>
              </div>
              
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 relative overflow-hidden ${
                  isDragging 
                    ? 'border-yellow-400 bg-yellow-400/10' 
                    : 'border-purple-400/50 hover:border-purple-400 hover:bg-purple-400/5'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {isDragging && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 blur-sm"></div>
                )}
                
                <div className="relative z-10">
                  <div className="relative inline-block mb-4">
                    <Scroll size={48} className="text-purple-400 mx-auto" />
                    <div className="absolute -inset-2 bg-purple-400/20 rounded-full blur-lg animate-pulse"></div>
                  </div>
                  <p className="text-purple-200 mb-4 font-medium">
                    🔮 Cast your CSV scroll into this mystical portal, or invoke the file selection spell
                  </p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="group inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg cursor-pointer hover:from-purple-500 hover:to-indigo-500 transition-all font-medium relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/20 to-indigo-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative flex items-center gap-2">
                      <Wand2 size={16} />
                      Choose Sacred Scroll
                    </span>
                  </label>
                  <p className="text-sm text-purple-400 mt-3">
                    ✨ CSV scrolls only • Knowledge stored in your mystical browser vault
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Upload Button */}
        {!showUploadSection && (
          <div className="mb-6">
            <button
              onClick={() => setShowUploadSection(true)}
              className="group px-4 py-2 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 backdrop-blur-sm text-white rounded-lg font-medium hover:from-purple-500 hover:to-indigo-500 transition-all text-sm border border-purple-400/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/20 to-indigo-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center gap-2">
                <Upload size={16} />
                🔮 Show Upload Portal
              </span>
            </button>
          </div>
        )}

        {/* Thumbnail Upload Section */}
        {showThumbnailSection && (
          <div className="bg-gradient-to-br from-slate-800/90 to-green-900/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-2xl border-2 border-green-400/30 relative overflow-hidden">
            {/* Magical border glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 blur-xl"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-green-100 mb-2 flex items-center gap-2">
                    <Sparkles size={20} className="text-emerald-400" />
                    Enchant with Mystical Images (Optional)
                  </h3>
                  <p className="text-sm text-green-300">
                    Upload a CSV scroll containing title-image mappings to automatically conjure visual manifestations for your manhwa cards.
                  </p>
                  <p className="text-xs text-green-400 mt-1">
                    Expected incantation format: Title, Image Portal URL (one per line)
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {thumbnailData.size > 0 && (
                    <div className="text-emerald-400 text-sm font-medium bg-black/20 px-3 py-1 rounded-lg border border-emerald-400/30">
                      🖼️ {thumbnailData.size} images conjured
                    </div>
                  )}
                  
                  <button
                    onClick={() => setShowThumbnailSection(false)}
                    className="group px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-500 hover:to-red-600 transition-all text-sm relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-white/20 to-red-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative">
                      <X size={16} />
                    </span>
                  </button>
                </div>
              </div>
              
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 relative overflow-hidden ${
                  isThumbnailLoading 
                    ? 'border-emerald-400 bg-emerald-400/10' 
                    : 'border-green-400/50 hover:border-green-400 hover:bg-green-400/5'
                }`}
              >
                {isThumbnailLoading ? (
                  <div className="relative">
                    <div className="relative inline-block mb-2">
                      <Sparkles size={32} className="text-emerald-400 mx-auto animate-spin" />
                      <div className="absolute -inset-2 bg-emerald-400/20 rounded-full blur-lg animate-pulse"></div>
                    </div>
                    <p className="text-emerald-300 font-medium">🔮 Weaving image enchantments...</p>
                  </div>
                ) : (
                  <>
                    <div className="relative inline-block mb-2">
                      <Sparkles size={32} className="text-green-400 mx-auto" />
                      <div className="absolute -inset-2 bg-green-400/20 rounded-full blur-lg animate-pulse"></div>
                    </div>
                    <p className="text-green-200 mb-3 font-medium">
                      📜 Upload mystical image mappings scroll
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label
                      htmlFor="thumbnail-upload"
                      className="group inline-block px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg cursor-pointer hover:from-green-500 hover:to-emerald-500 transition-all text-sm font-medium relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-white/20 to-emerald-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <span className="relative flex items-center gap-2">
                        <Wand2 size={14} />
                        Choose Image Scroll
                      </span>
                    </label>
                    <div className="mt-3 p-3 bg-black/20 rounded-lg border border-green-400/30 text-xs text-green-300 backdrop-blur-sm">
                      <strong className="text-green-200">🔮 Spell Format Example:</strong><br/>
                      Solo Leveling, https://example.com/solo-leveling.jpg<br/>
                      Tower of God, https://example.com/tower-of-god.jpg<br/>
                      Lookism, https://example.com/lookism.jpg
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Collapsed Thumbnail Button */}
        {!showThumbnailSection && (
          <div className="mb-6">
            <button
              onClick={() => setShowThumbnailSection(true)}
              className="group px-4 py-2 bg-gradient-to-r from-green-600/80 to-emerald-600/80 backdrop-blur-sm text-white rounded-lg font-medium hover:from-green-500 hover:to-emerald-500 transition-all text-sm border border-green-400/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-white/20 to-emerald-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative flex items-center gap-2">
                <Sparkles size={16} />
                🖼️ Show Image Portal
              </span>
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-gradient-to-br from-slate-800/90 to-indigo-900/90 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-2xl border-2 border-indigo-400/30 relative overflow-hidden">
          {/* Magical border glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="relative mb-4">
              <Search size={20} className="absolute left-3 top-3.5 text-indigo-400" />
              <input
                type="text"
                placeholder="🔍 Seek by title, synopsis, genre, author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-black/20 border-2 border-indigo-400/50 rounded-lg text-base text-white placeholder-indigo-300 focus:outline-none focus:border-indigo-400 backdrop-blur-sm"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-white/20 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative flex items-center gap-2">
                  <Filter size={16} />
                  {showFilters ? '🔮 Hide Mystical Filters' : '🔮 Show Mystical Filters'}
                </span>
              </button>
              
              {Object.values(selectedFilters).some(arr => arr.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-500 hover:to-red-600 transition-all relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-white/20 to-red-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative flex items-center gap-2">
                    <X size={16} />
                    Purge All Enchantments
                  </span>
                </button>
              )}
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 border-t border-indigo-400/30">
                {/* Genres */}
                <div>
                  <h4 className="font-semibold text-indigo-200 mb-2 text-sm flex items-center gap-1">
                    <Scroll size={14} />
                    📚 Genre Grimoires
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {getUniqueValues('genres').map(genre => (
                      <button
                        key={genre}
                        onClick={() => toggleFilter('genres', genre)}
                        className={`group px-2 py-1 text-xs rounded-full border transition-all relative overflow-hidden ${
                          selectedFilters.genres.includes(genre)
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600'
                            : 'bg-black/20 text-indigo-200 border-indigo-400/50 hover:bg-indigo-400/20 backdrop-blur-sm'
                        }`}
                      >
                        {selectedFilters.genres.includes(genre) && (
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-white/20 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                        )}
                        <span className="relative">{genre}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="font-semibold text-indigo-200 mb-2 text-sm flex items-center gap-1">
                    <Wand2 size={14} />
                    🏷️ Mystic Categories
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {getUniqueValues('categories').map(category => (
                      <button
                        key={category}
                        onClick={() => toggleFilter('categories', category)}
                        className={`group px-2 py-1 text-xs rounded-full border transition-all relative overflow-hidden ${
                          selectedFilters.categories.includes(category)
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600'
                            : 'bg-black/20 text-purple-200 border-purple-400/50 hover:bg-purple-400/20 backdrop-blur-sm'
                        }`}
                      >
                        {selectedFilters.categories.includes(category) && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/20 to-pink-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                        )}
                        <span className="relative">{category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h4 className="font-semibold text-indigo-200 mb-2 text-sm flex items-center gap-1">
                    <Star size={14} />
                    ⭐ Arcane Rating
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {getUniqueValues('rating').map(rating => (
                      <button
                        key={rating}
                        onClick={() => toggleFilter('rating', rating)}
                        className={`group px-2 py-1 text-xs rounded-full border transition-all relative overflow-hidden ${
                          selectedFilters.rating.includes(rating)
                            ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-yellow-600'
                            : 'bg-black/20 text-yellow-200 border-yellow-400/50 hover:bg-yellow-400/20 backdrop-blur-sm'
                        }`}
                      >
                        {selectedFilters.rating.includes(rating) && (
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-white/20 to-orange-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                        )}
                        <span className="relative">{rating}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chapters */}
                <div>
                  <h4 className="font-semibold text-indigo-200 mb-2 text-sm flex items-center gap-1">
                    <BookOpen size={14} />
                    📖 Chapter Codex
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {getUniqueValues('chapters').map(chapters => (
                      <button
                        key={chapters}
                        onClick={() => toggleFilter('chapters', chapters)}
                        className={`group px-2 py-1 text-xs rounded-full border transition-all relative overflow-hidden ${
                          selectedFilters.chapters.includes(chapters)
                            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-600'
                            : 'bg-black/20 text-blue-200 border-blue-400/50 hover:bg-blue-400/20 backdrop-blur-sm'
                        }`}
                      >
                        {selectedFilters.chapters.includes(chapters) && (
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                        )}
                        <span className="relative">{chapters}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <p className="text-indigo-200 font-medium text-lg mt-4 flex items-center gap-2">
              <Sparkles size={20} className="text-yellow-400" />
              📖 Discovered {filteredData.length} enchanted tomes
            </p>
          </div>
        </div>

        {/* Manhwa Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((manhwa, index) => (
            <div key={index} className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-purple-400/30 overflow-hidden relative group hover:border-purple-400/60 transition-all duration-300">
              {/* Magical glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 to-blue-400/0 group-hover:from-purple-400/10 group-hover:to-blue-400/10 transition-all duration-300 blur-xl"></div>
              
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-slate-700 to-purple-800 overflow-hidden">
                {manhwa.thumbnail && manhwa.thumbnail.trim() !== "" ? (
                  <img
                    src={manhwa.thumbnail}
                    alt={manhwa.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className={`w-full h-full flex items-center justify-center ${manhwa.thumbnail && manhwa.thumbnail.trim() !== "" ? 'hidden' : 'flex'}`}
                  style={{display: manhwa.thumbnail && manhwa.thumbnail.trim() !== "" ? 'none' : 'flex'}}
                >
                  <div className="text-center">
                    <div className="relative">
                      <BookOpen size={48} className="text-purple-400 mx-auto mb-2" />
                      <div className="absolute -inset-2 bg-purple-400/20 rounded-full blur-lg animate-pulse"></div>
                    </div>
                    <p className="text-purple-300 font-medium text-sm">{manhwa.title}</p>
                  </div>
                </div>
                
                {/* Rating Badge */}
                <div 
                  className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg backdrop-blur-sm"
                  style={{ 
                    backgroundColor: getRatingColor(manhwa.rating),
                    color: 'white'
                  }}
                >
                  <Star size={12} fill="currentColor" />
                  {manhwa.rating}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 relative z-10">
                {/* Title */}
                <h3 className="text-lg font-bold text-purple-100 mb-3 font-serif">
                  {manhwa.title}
                </h3>

                {/* Synopsis with Read More */}
                <div className="mb-4">
                  {(() => {
                    const isExpanded = expandedDescriptions.has(index);
                    const { text: truncatedText, needsTruncation } = truncateText(manhwa.synopsis);
                    const displayText = isExpanded ? manhwa.synopsis : truncatedText;
                    
                    return (
                      <>
                        <p className="text-purple-200 text-sm leading-relaxed">
                          {displayText}
                        </p>
                        {needsTruncation && (
                          <button
                            onClick={() => toggleDescription(index)}
                            className="mt-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <Sparkles size={12} />
                            {isExpanded ? '▲ Conceal Lore' : '▼ Reveal Lore'}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* Genres */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-purple-300 mb-1 flex items-center gap-1">
                    <Scroll size={12} />
                    📚 Arcane Genres
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {manhwa.genres && manhwa.genres.map((genre, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-600/30 text-purple-200 text-xs rounded-full border border-purple-400/30 backdrop-blur-sm">
                        {genre}
                      </span>
                    ))}
                  </div>
                  
                  {/* Categories */}
                  {manhwa.categories && manhwa.categories.length > 0 && (
                    <>
                      <div className="text-xs font-semibold text-blue-300 mb-1 flex items-center gap-1">
                        <Wand2 size={12} />
                        🏷️ Mystical Tags
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {manhwa.categories.map((category, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-600/30 text-blue-200 text-xs rounded-full border border-blue-400/30 backdrop-blur-sm">
                            {category}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Details */}
                <div className="text-sm text-purple-300 mb-4">
                  {manhwa.authors && manhwa.authors.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen size={14} className="text-yellow-400" />
                      <span>{manhwa.authors.join(', ')}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-blue-400" />
                      <span>{manhwa.year_released}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Hash size={14} className="text-green-400" />
                      <span>{manhwa.chapters}</span>
                    </div>
                  </div>

                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                    manhwa.status === 'Ongoing' ? 'bg-green-600/30 text-green-200 border border-green-400/30' : 
                    manhwa.status === 'Complete' ? 'bg-blue-600/30 text-blue-200 border border-blue-400/30' : 
                    'bg-gray-600/30 text-gray-200 border border-gray-400/30'
                  }`}>
                    {manhwa.status}
                  </span>
                </div>

                {/* Read Button */}
                <button className="group w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-indigo-500 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/20 to-indigo-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <Zap size={16} />
                    🔗 Portal Awaiting...
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="relative inline-block mb-4">
              <BookOpen size={64} className="text-purple-400 mx-auto" />
              <div className="absolute -inset-4 bg-purple-400/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <h3 className="text-xl font-semibold text-purple-200 mb-2 font-serif">
              No enchanted tomes discovered
            </h3>
            <p className="text-purple-300">Adjust your mystical search or purge some enchantments</p>
          </div>
        )}

        {/* Tribute Section */}
        <div className="mt-12 bg-gradient-to-br from-slate-800/90 to-amber-900/90 backdrop-blur-sm rounded-2xl border-2 border-amber-400/30 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-yellow-400/10 blur-xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-amber-200 mb-4 font-serif flex items-center justify-center gap-2">
              <Sword size={24} className="text-yellow-400" />
              ⚔️ Tribute to the Original Archive ⚔️
              <Shield size={24} className="text-yellow-400" />
            </h2>
            <p className="text-amber-300 mb-4">
              This mystical sanctuary is inspired by the legendary community-driven manhwa scroll repository
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="https://www.reddit.com/r/manhwa/comments/1ioddo5/final_manhwa_list_spreadsheet/"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-500 hover:to-red-500 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-white/20 to-red-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative flex items-center gap-2">
                  <Scroll size={16} />
                  📱 Reddit Sanctuary
                </span>
              </a>
              <a
                href="https://docs.google.com/spreadsheets/d/1ZluFOVtJCv-cQLXWhmCLNoZFIMLV0eTrqozwyEb1zw8/edit?usp=drivesdk"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-500 hover:to-emerald-500 transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 via-white/20 to-emerald-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative flex items-center gap-2">
                  <Sparkles size={16} />
                  📊 Ancient Codex
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManhwaDatabase;
