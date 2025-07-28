import React, { useState, useEffect } from 'react';
import { Search, Upload, BookOpen, Star, Calendar, Hash, Filter, X, FileText } from 'lucide-react';

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
        rating: "Decent"
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
        rating: "Good"
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
        rating: "Recommended"
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
            related_series: cleanField(row[10])
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

    // Apply filters
    const genreMatch = selectedFilters.genres.length === 0 || 
      (manhwa.genres && selectedFilters.genres.some(genre => manhwa.genres.includes(genre)));
    
    const categoryMatch = selectedFilters.categories.length === 0 || 
      (manhwa.categories && selectedFilters.categories.some(category => manhwa.categories.includes(category)));
    
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center">
        <div className="text-center">
          <BookOpen size={64} className="text-amber-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-amber-800 text-xl font-semibold mb-2">Processing CSV File...</h2>
          <p className="text-gray-600">Please wait while we load your manhwa data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-orange-200">
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border-2 border-amber-300">
            <div className="text-center mb-6">
              <BookOpen size={48} className="text-amber-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-800 mb-2">Welcome to Fantasy Manhwa Archive!</h2>
            </div>
            
            <div className="text-gray-700 space-y-3 mb-6">
              <p className="text-sm">
                ⚠️ <strong>Important Notice:</strong> This website is in its very early stages, so please understand that it's still under development.
              </p>
              
              <p className="text-sm">
                📂 <strong>Data Upload Required:</strong> To use this database, you need to upload the manhwa data file yourself. The website doesn't come pre-loaded with data.
              </p>
              
              <p className="text-sm">
                💾 <strong>Download the Data:</strong> Click the link below to download the latest manhwa database file, then upload it using the file upload section.
              </p>
            </div>

            <div className="space-y-4">
              <a
                href="https://mega.nz/file/8dYBhJQD#RdQRx7ut45tUFNrlPJTqskCCZ9XeNEKWWkb_cnZ1HJ4"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-block text-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                📥 Download Manhwa Database (MEGA)
              </a>
              
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors"
              >
                Got it, let's start!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-amber-800 to-orange-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap">
          <div className="flex items-center gap-3">
            <BookOpen size={32} className="text-amber-200" />
            <h1 className="text-3xl font-bold text-amber-100 font-serif">
              ⚔️ Fantasy Manhwa Archive ⚔️
            </h1>
          </div>
          
          <div className="text-amber-200 text-sm">
            📖 {manhwaData.length} titles loaded
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-8">
        {/* File Upload Section */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border-2 border-amber-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <Upload size={20} />
                Upload Manhwa Database
              </h3>
              <p className="text-sm text-gray-600">
                First, download the data file, then upload it here to load the manhwa database.
              </p>
            </div>
            
            <a
              href="https://mega.nz/file/8dYBhJQD#RdQRx7ut45tUFNrlPJTqskCCZ9XeNEKWWkb_cnZ1HJ4"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all text-sm whitespace-nowrap"
            >
              📥 Download Data
            </a>
          </div>
          
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragging 
                ? 'border-amber-500 bg-amber-50' 
                : 'border-amber-300 hover:border-amber-400 hover:bg-amber-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <FileText size={48} className="text-amber-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">
              Drag and drop your CSV file here, or click to browse
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
              className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg cursor-pointer hover:bg-amber-700 transition-colors"
            >
              Choose CSV File
            </label>
            <p className="text-sm text-gray-500 mt-2">
              CSV files only • Data will be stored locally in your browser
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg border-2 border-amber-200">
          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-3.5 text-amber-600" />
            <input
              type="text"
              placeholder="🔍 Search by title, synopsis, genre, author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-amber-300 rounded-lg text-base focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {Object.values(selectedFilters).some(arr => arr.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 border-t border-amber-200">
              {/* Genres */}
              <div>
                <h4 className="font-semibold text-amber-800 mb-2 text-sm">📚 Genres</h4>
                <div className="flex flex-wrap gap-1">
                  {getUniqueValues('genres').map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleFilter('genres', genre)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        selectedFilters.genres.includes(genre)
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-semibold text-amber-800 mb-2 text-sm">🏷️ Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {getUniqueValues('categories').map(category => (
                    <button
                      key={category}
                      onClick={() => toggleFilter('categories', category)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        selectedFilters.categories.includes(category)
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 className="font-semibold text-amber-800 mb-2 text-sm">⭐ Rating</h4>
                <div className="flex flex-wrap gap-1">
                  {getUniqueValues('rating').map(rating => (
                    <button
                      key={rating}
                      onClick={() => toggleFilter('rating', rating)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        selectedFilters.rating.includes(rating)
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chapters */}
              <div>
                <h4 className="font-semibold text-amber-800 mb-2 text-sm">📖 Chapters</h4>
                <div className="flex flex-wrap gap-1">
                  {getUniqueValues('chapter
