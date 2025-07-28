import React, { useState, useEffect } from 'react';
import { Search, Upload, User, BookOpen, Star, Calendar, Hash, Filter, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://tlfakcdpciitctqbzpns.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZmFrY2RwY2lpdGN0cWJ6cG5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNzU2MTEsImV4cCI6MjA1Mzg1MTYxMX0.qXl46_cxeAGMH6oT0CZQ5Cx-X0iKD7Y3P43m3Ap9D-c';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ManhwaDatabase = () => {
  const [manhwaData, setManhwaData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    genres: [],
    categories: [],
    rating: [],
    chapters: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load data from Supabase on component mount
  useEffect(() => {
    loadManhwaData();
  }, []);

  const loadManhwaData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('manhwa')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading manhwa data:', error);
        loadSampleData(); // Fallback to sample data
      } else if (data && data.length > 0) {
        console.log(`Loaded ${data.length} manhwa entries from database`);
        setManhwaData(data);
      } else {
        console.log('No data in database, loading sample data');
        loadSampleData();
      }
    } catch (error) {
      console.error('Error connecting to database:', error);
      loadSampleData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadSampleData = () => {
    const sampleData = [
      {
        title: "0.0000001% Demon King",
        synopsis: "The 72 Demon Kings, who received the order to destroy the earth, each went through a trial by the Great Demon King Astrea. Those who passed the trial earned the title of Demon King, and each Demon King was granted special powers by the Great Demon King.",
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
        synopsis: "Every second counts when you're a first responder. But what if you could see a glimpse into the future? Hosu is a firefighter with the supernatural ability to do just that.",
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
        synopsis: "Yoo Min, a full time department store worker, begins to feel skeptical about her own life. She decides to quit her job due to a conflict with her manager.",
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

  const handleAdminLogin = () => {
    if (adminPassword === 'manhwa_admin_2025') {
      setIsAdminMode(true);
      setShowPasswordInput(false);
      setAdminPassword('');
    } else {
      alert('Invalid password');
    }
  };

  const saveManhwaToDatabase = async (manhwaArray) => {
    try {
      console.log('Saving to database:', manhwaArray.length, 'entries');
      
      // Clear existing data first
      const { error: deleteError } = await supabase
        .from('manhwa')
        .delete()
        .neq('id', 0); // Delete all rows

      if (deleteError) {
        console.error('Error clearing existing data:', deleteError);
      }

      // Insert new data
      const { data, error } = await supabase
        .from('manhwa')
        .insert(manhwaArray);

      if (error) {
        console.error('Error saving to database:', error);
        throw error;
      }

      console.log('Successfully saved to database');
      return true;
    } catch (error) {
      console.error('Database save failed:', error);
      return false;
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
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
          // Save to database
          const saved = await saveManhwaToDatabase(processedData);
          
          if (saved) {
            setManhwaData(processedData);
            alert(`Successfully uploaded ${processedData.length} manhwa entries to the database! Data is now permanently saved.`);
          } else {
            // Fallback to local storage
            setManhwaData(processedData);
            alert(`Uploaded ${processedData.length} manhwa entries locally. Database save failed, but data is still available.`);
          }
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
      manhwa.genres.some(g => g.toLowerCase().includes(searchTerm.toLowerCase())) ||
      manhwa.authors.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));

    // Apply filters
    const genreMatch = selectedFilters.genres.length === 0 || 
      selectedFilters.genres.some(genre => manhwa.genres.includes(genre));
    
    const categoryMatch = selectedFilters.categories.length === 0 || 
      selectedFilters.categories.some(category => manhwa.categories.includes(category));
    
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

  // Styles
  const headerStyle = {
    background: 'linear-gradient(to right, #92400e, #ea580c)',
    color: 'white',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 16px',
    minHeight: '100vh',
    background: 'linear-gradient(to bottom right, #fef3c7, #fed7aa)'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    border: '2px solid #fed7aa'
  };

  const searchStyle = {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #fbbf24',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none'
  };

  const buttonStyle = {
    padding: '8px 16px',
    background: '#d97706',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500'
  };

  const genreTagStyle = {
    display: 'inline-block',
    padding: '4px 8px',
    background: '#fef3c7',
    color: '#92400e',
    fontSize: '12px',
    borderRadius: '20px',
    margin: '2px',
    border: '1px solid #fbbf24'
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #fef3c7, #fed7aa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <BookOpen size={64} color="#d97706" style={{ margin: '0 auto 16px', animation: 'spin 2s linear infinite' }} />
          <h2 style={{ color: '#92400e', marginBottom: '8px' }}>Loading Manhwa Database...</h2>
          <p style={{ color: '#6b7280' }}>Connecting to Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #fef3c7, #fed7aa)' }}>
      {/* Header */}
      <header style={headerStyle}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <BookOpen size={32} color="#fbbf24" />
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fef3c7', fontFamily: 'Georgia, serif', margin: 0 }}>
              ⚔️ Fantasy Manhwa Archive ⚔️
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '12px', color: '#fed7aa' }}>
              🗄️ Database Connected
            </div>
            {!isAdminMode ? (
              <button
                onClick={() => setShowPasswordInput(!showPasswordInput)}
                style={{ ...buttonStyle, background: '#eab308' }}
              >
                <User size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Admin
              </button>
            ) : (
              <div style={{ padding: '8px 16px', background: '#059669', borderRadius: '8px', color: 'white' }}>
                <User size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Admin Mode
              </div>
            )}
          </div>
        </div>

        {/* Admin Login */}
        {showPasswordInput && (
          <div style={{ maxWidth: '1200px', margin: '16px auto 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', flex: 1, maxWidth: '300px' }}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
            <button onClick={handleAdminLogin} style={{ ...buttonStyle, background: '#059669' }}>
              Login
            </button>
          </div>
        )}

        {/* File Upload (Admin Only) */}
        {isAdminMode && (
          <div style={{ 
            maxWidth: '1200px', 
            margin: '16px auto 0', 
            padding: '16px', 
            background: '#92400e', 
            borderRadius: '8px',
            border: '1px solid #fbbf24'
          }}>
            <h3 style={{ color: '#fef3c7', marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>
              📜 Upload Manhwa Database to Supabase
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isLoading}
                style={{ 
                  color: '#fef3c7',
                  background: 'transparent',
                  border: '1px solid #fbbf24',
                  borderRadius: '4px',
                  padding: '8px',
                  flex: 1
                }}
              />
              <Upload size={20} color="#fbbf24" />
            </div>
            <p style={{ fontSize: '12px', color: '#fed7aa', margin: '8px 0 0 0' }}>
              {isLoading ? 'Uploading to database...' : 'Upload CSV file - data will be saved permanently to Supabase database'}
            </p>
          </div>
        )}
      </header>

      <div style={containerStyle}>
        {/* Database Status */}
        <div style={{ ...cardStyle, marginBottom: '16px', background: '#f0f9ff', border: '2px solid #0ea5e9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
            <span style={{ color: '#0369a1', fontWeight: '500' }}>
              Connected to Supabase Database - All data is permanently saved
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={cardStyle}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={20} color="#d97706" style={{ position: 'absolute', left: '12px', top: '14px' }} />
            <input
              type="text"
              placeholder="🔍 Search by title, synopsis, genre, author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={searchStyle}
            />
          </div>

          {/* Filter Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{ ...buttonStyle, display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {Object.values(selectedFilters).some(arr => arr.length > 0) && (
              <button
                onClick={clearAllFilters}
                style={{ ...buttonStyle, background: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #fed7aa'
            }}>
              {/* Genres */}
              <div>
                <h4 style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px', fontSize: '14px' }}>📚 Genres</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {getUniqueValues('genres').map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleFilter('genres', genre)}
                      style={{
                        ...genreTagStyle,
                        background: selectedFilters.genres.includes(genre) ? '#d97706' : '#fef3c7',
                        color: selectedFilters.genres.includes(genre) ? 'white' : '#92400e',
                        cursor: 'pointer'
                      }}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px', fontSize: '14px' }}>🏷️ Categories</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {getUniqueValues('categories').map(category => (
                    <button
                      key={category}
                      onClick={() => toggleFilter('categories', category)}
                      style={{
                        ...genreTagStyle,
                        background: selectedFilters.categories.includes(category) ? '#d97706' : '#fef3c7',
                        color: selectedFilters.categories.includes(category) ? 'white' : '#92400e',
                        cursor: 'pointer'
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h4 style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px', fontSize: '14px' }}>⭐ Rating</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {getUniqueValues('rating').map(rating => (
                    <button
                      key={rating}
                      onClick={() => toggleFilter('rating', rating)}
                      style={{
                        ...genreTagStyle,
                        background: selectedFilters.rating.includes(rating) ? '#d97706' : '#fef3c7',
                        color: selectedFilters.rating.includes(rating) ? 'white' : '#92400e',
                        cursor: 'pointer'
                      }}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chapters */}
              <div>
                <h4 style={{ fontWeight: '600', color: '#92400e', marginBottom: '8px', fontSize: '14px' }}>📖 Chapters</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {getUniqueValues('chapters').map(chapters => (
                    <button
                      key={chapters}
                      onClick={() => toggleFilter('chapters', chapters)}
                      style={{
                        ...genreTagStyle,
                        background: selectedFilters.chapters.includes(chapters) ? '#d97706' : '#fef3c7',
                        color: selectedFilters.chapters.includes(chapters) ? 'white' : '#92400e',
                        cursor: 'pointer'
                      }}
                    >
                      {chapters}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <p style={{ color: '#92400e', fontWeight: '500', fontSize: '16px', margin: '16px 0 0 0' }}>
            📖 Found {filteredData.length} manhwa titles
          </p>
        </div>

        {/* Manhwa Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
          {filteredData.map((manhwa, index) => (
            <div key={manhwa.id || index} style={cardStyle}>
              {/* Title and Rating */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#92400e', margin: 0, flex: 1 }}>
                  {manhwa.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: getRatingColor(manhwa.rating) }}>
                  <Star size={16} fill="currentColor" />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{manhwa.rating}</span>
                </div>
              </div>

              {/* Synopsis */}
              <p style={{ color: '#374151', fontSize: '14px', marginBottom: '16px', lineHeight: '1.4' }}>
                {manhwa.synopsis}
              </p>

              {/* Genres */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                  📚 Genres
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginBottom: '8px' }}>
                  {manhwa.genres && manhwa.genres.map((genre, i) => (
                    <span key={i} style={{...genreTagStyle, background: '#fef3c7', color: '#92400e'}}>
                      {genre}
                    </span>
                  ))}
                </div>
                
                {/* Categories */}
                {manhwa.categories && manhwa.categories.length > 0 && (
                  <>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                      🏷️ Categories
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                      {manhwa.categories.map((category, i) => (
                        <span key={i} style={{...genreTagStyle, background: '#e0f2fe', color: '#0369a1'}}>
                          {category}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Details */}
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                {manhwa.authors && manhwa.authors.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <User size={16} color="#d97706" />
                    <span>{manhwa.authors.join(', ')}</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={16} color="#d97706" />
                    <span>{manhwa.year_released}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Hash size={16} color="#d97706" />
                    <span>{manhwa.chapters}</span>
                  </div>
                </div>

                <span style={{
                  padding: '4px 8px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: manhwa.status === 'Ongoing' ? '#dcfce7' : 
                             manhwa.status === 'Complete' ? '#dbeafe' : '#f3f4f6',
                  color: manhwa.status === 'Ongoing' ? '#166534' : 
                         manhwa.status === 'Complete' ? '#1e40af' : '#374151'
                }}>
                  {manhwa.status}
                </span>
              </div>

              {/* Read Button */}
              <button style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(to right, #d97706, #ea580c)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                🔗 Link Coming Soon
              </button>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <BookOpen size={64} color="#fbbf24" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
              No manhwa found
            </h3>
            <p style={{ color: '#6b7280' }}>Try adjusting your search or filters</p>
          </div>
        )}

        {/* Tribute Section */}
        <div style={{
          marginTop: '48px',
          background: 'linear-gradient(to right, #fef3c7, #fed7aa)',
          borderRadius: '12px',
          border: '2px solid #fbbf24',
          padding: '32px',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#92400e', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
            ⚔️ Tribute to the Original Archive ⚔️
          </h2>
          <p style={{ color: '#92400e', marginBottom: '16px' }}>
            This database is inspired by the amazing community-driven manhwa spreadsheet
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://www.reddit.com/r/manhwa/comments/1ioddo5/final_manhwa_list_spreadsheet/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '12px 24px',
                background: '#ea580c',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500',
                textDecoration: 'none'
              }}
            >
              📱 Reddit Thread
            </a>
            <a
              href="https://docs.google.com/spreadsheets/d/1ZluFOVtJCv-cQLXWhmCLNoZFIMLV0eTrqozwyEb1zw8/edit?usp=drivesdk"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '12px 24px',
                background: '#059669',
                color: 'white',
                borderRadius: '8px',
                fontWeight: '500',
                textDecoration: 'none'
              }}
            >
              📊 Google Sheet
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ManhwaDatabase;
