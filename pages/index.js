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

  // Load sample data on component mount and auto-connect to database
  useEffect(() => {
    const initializeApp = async () => {
      console.log('Initializing app...');
      
      // Auto-connect to database if credentials are available
      if (supabaseConfig.url && supabaseConfig.anonKey) {
        console.log('Database credentials found, attempting connection...');
        setDbLoading(true);
        
        try {
          // Test database connection
          console.log('Testing database connection...');
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
            
            // Load actual data
            const dataResponse = await fetch(`${supabaseConfig.url}/rest/v1/manhwa?select=*`, {
              headers: {
                'apikey': supabaseConfig.anonKey,
                'Authorization': `Bearer ${supabaseConfig.anonKey}`,
                'Content-Type': 'application/json'
              }
            });

            console.log('Data response status:', dataResponse.status);

            if (dataResponse.ok) {
              const data = await dataResponse.json();
              console.log(`Raw data from database: ${data.length} records`);
              console.log('First record sample:', data[0]);
              
              const formattedData = data.map(item => ({
                title: item.title || '',
                synopsis: item.synopsis || '',
                genres: item.genres || [],
                categories: item.categories || [],
                authors: item.authors || [],
                year_released: item.year_released || '',
                chapters: item.chapters || '',
                status: item.status || '',
                rating: item.rating || '',
                thumbnail: item.thumbnail || ''
              }));
              
              const uniqueData = removeDuplicates(formattedData, 'title');
              console.log(`Setting ${uniqueData.length} unique records in app state`);
              setManhwaData(uniqueData);
              console.log('Database data loaded successfully!');
            } else {
              console.error('Failed to fetch data:', dataResponse.status, await dataResponse.text());
              console.log('Loading sample data as fallback');
              loadSampleData();
            }
          } else {
            console.error('Database connection failed:', testResponse.status, await testResponse.text());
            console.log('Loading sample data as fallback');
            loadSampleData();
          }
        } catch (error) {
          console.error('Database initialization error:', error);
          console.log('Loading sample data as fallback');
          loadSampleData();
        } finally {
          setDbLoading(false);
        }
      } else {
        console.log('No database credentials, loading sample data');
        loadSampleData();
      }
    };

    initializeApp();
  }, []);

  const autoConnectToDatabase = async () => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) return;

    setDbLoading(true);
    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/manhwa?select=count`, {
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setDbConnected(true);
        await loadDataFromDatabase();
        console.log('Auto-connected to database successfully');
      } else {
        console.log('Auto-connection failed, using local data');
      }
    } catch (error) {
      console.log('Auto-connection failed, using local data:', error.message);
    } finally {
      setDbLoading(false);
    }
  };

  // Admin authentication
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
        rating: "Decent",
        thumbnail: ""
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
        rating: "Good",
        thumbnail: ""
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
        rating: "Recommended",
        thumbnail: ""
      }
    ];
    setManhwaData(sampleData);
  };

  // Helper function to remove duplicates
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

  const handleFileUpload = (file) => {
    if (!file) return;
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split(/\r?\n/);
        let dataStartIndex = 8;
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
          const uniqueData = removeDuplicates(processedData, 'title');
          setManhwaData(uniqueData);
          alert(`Successfully loaded ${uniqueData.length} manhwa entries${processedData.length !== uniqueData.length ? ` (${processedData.length - uniqueData.length} duplicates removed)` : ''}!`);
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
        const lines = csv.split(/\r?\n/);
        const newThumbnailData = new Map();
        let matchedCount = 0;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const row = parseCSVLine(line);
          
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

  const handleAdminFileUpload = (file) => {
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split(/\r?\n/);
        let dataStartIndex = 8;
        const processedData = [];

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
          const uniqueData = removeDuplicates(processedData, 'title');
          setManhwaData(uniqueData);
          
          if (dbConnected) {
            await saveToDatabase(uniqueData);
            alert(`Successfully processed and uploaded ${uniqueData.length} manhwa entries to database!`);
          } else {
            alert(`Successfully processed ${uniqueData.length} manhwa entries locally! Connect to database to save online.`);
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

  const connectToDatabase = async () => {
    if (!supabaseConfig.url || !supabaseConfig.anonKey) {
      alert('Please enter both Supabase URL and API Key');
      return;
    }

    setDbLoading(true);
    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/manhwa?select=count`, {
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setDbConnected(true);
        await loadDataFromDatabase(); // Automatically load data after connecting
        alert('Successfully connected to database and loaded data!');
      } else {
        throw new Error(`Connection failed: ${response.status}`);
      }
    } catch (error) {
      alert(`Database connection failed: ${error.message}`);
      console.error('Database connection error:', error);
    } finally {
      setDbLoading(false);
    }
  };

  const loadDataFromDatabase = async () => {
    if (!dbConnected || !supabaseConfig.url || !supabaseConfig.anonKey) {
      console.log('Cannot load from database - not connected');
      return;
    }

    console.log('Loading data from database...');
    setDbLoading(true);
    try {
      const response = await fetch(`${supabaseConfig.url}/rest/v1/manhwa?select=*`, {
        headers: {
          'apikey': supabaseConfig.anonKey,
          'Authorization': `Bearer ${supabaseConfig.anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Database fetch response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(`Fetched ${data.length} records from database`);
        
        if (data.length > 0) {
          console.log('Sample record structure:', data[0]);
          
          const formattedData = data.map((item, index) => {
            try {
              return {
                title: item.title || '',
                synopsis: item.synopsis || '',
                genres: Array.isArray(item.genres) ? item.genres : (item.genres ? [item.genres] : []),
                categories: Array.isArray(item.categories) ? item.categories : (item.categories ? [item.categories] : []),
                authors: Array.isArray(item.authors) ? item.authors : (item.authors ? [item.authors] : []),
                year_released: item.year_released || '',
                chapters: item.chapters || '',
                status: item.status || '',
                rating: item.rating || '',
                thumbnail: item.thumbnail || ''
              };
            } catch (error) {
              console.error(`Error formatting record ${index}:`, error, item);
              return null;
            }
          }).filter(item => item !== null);
          
          const uniqueData = removeDuplicates(formattedData, 'title');
          console.log(`Setting ${uniqueData.length} unique records in state`);
          setManhwaData(uniqueData);
          console.log('✅ Database data loaded and set in state successfully!');
        } else {
          console.log('Database returned empty result');
          loadSampleData();
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to load data from database:', response.status, errorText);
        loadSampleData();
      }
    } catch (error) {
      console.error('Error loading data from database:', error);
      loadSampleData();
    } finally {
      setDbLoading(false);
    }
  };

  const saveToDatabase = async (dataToSave = null) => {
    if (!dbConnected || !supabaseConfig.url || !supabaseConfig.anonKey) {
      alert('Please connect to database first');
      return;
    }

    const dataForSave = dataToSave || manhwaData;
    if (dataForSave.length === 0) {
      alert('No data to save');
      return;
    }

    setDbLoading(true);
    try {
      // Improved database clearing for admin mode
      if (adminMode) {
        console.log('Clearing existing database records...');
        try {
          // Try to delete all records with a proper filter
          const deleteResponse = await fetch(`${supabaseConfig.url}/rest/v1/manhwa?id=gte.0`, {
            method: 'DELETE',
            headers: {
              'apikey': supabaseConfig.anonKey,
              'Authorization': `Bearer ${supabaseConfig.anonKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (deleteResponse.ok) {
            console.log('Database cleared successfully');
          } else {
            console.warn('Database clear failed, will use upsert instead');
          }
        } catch (deleteError) {
          console.warn('Database clear failed, will use upsert instead:', deleteError);
        }
        
        // Wait a moment for database to process
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Upload in smaller batches with improved error handling
      const batchSize = 30; // Even smaller batch size
      const totalBatches = Math.ceil(dataForSave.length / batchSize);
      let successfulBatches = 0;
      let failedBatches = 0;
      let duplicateCount = 0;
      let actualUploads = 0;

      console.log(`Starting upload: ${dataForSave.length} records in ${totalBatches} batches`);

      for (let i = 0; i < dataForSave.length; i += batchSize) {
        const batchNumber = Math.floor(i / batchSize) + 1;
        const batch = dataForSave.slice(i, i + batchSize);
        
        try {
          console.log(`Uploading batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);
          
          // Try normal POST first
          let response = await fetch(`${supabaseConfig.url}/rest/v1/manhwa`, {
            method: 'POST',
            headers: {
              'apikey': supabaseConfig.anonKey,
              'Authorization': `Bearer ${supabaseConfig.anonKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(batch)
          });

          // If we get duplicate key error, try upsert instead
          if (response.status === 409) {
            console.log(`Batch ${batchNumber} has duplicates, trying upsert...`);
            
            response = await fetch(`${supabaseConfig.url}/rest/v1/manhwa`, {
              method: 'POST',
              headers: {
                'apikey': supabaseConfig.anonKey,
                'Authorization': `Bearer ${supabaseConfig.anonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=minimal'
              },
              body: JSON.stringify(batch)
            });
            
            if (response.ok) {
              duplicateCount += batch.length;
              console.log(`Batch ${batchNumber} upserted successfully (duplicates handled)`);
            }
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`Batch ${batchNumber} failed:`, response.status, errorText);
            failedBatches++;
            
            // Try uploading individual records from failed batch
            console.log(`Trying individual uploads for batch ${batchNumber}...`);
            for (const record of batch) {
              try {
                const singleResponse = await fetch(`${supabaseConfig.url}/rest/v1/manhwa`, {
                  method: 'POST',
                  headers: {
                    'apikey': supabaseConfig.anonKey,
                    'Authorization': `Bearer ${supabaseConfig.anonKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates,return=minimal'
                  },
                  body: JSON.stringify([record])
                });
                
                if (singleResponse.ok) {
                  actualUploads++;
                }
              } catch (singleError) {
                console.error('Individual record upload failed:', record.title);
              }
            }
          } else {
            console.log(`Batch ${batchNumber} uploaded successfully`);
            successfulBatches++;
            actualUploads += batch.length;
          }

          // Add delay between batches
          if (i + batchSize < dataForSave.length) {
            await new Promise(resolve => setTimeout(resolve, 750)); // Increased delay
          }
        } catch (error) {
          console.error(`Error uploading batch ${batchNumber}:`, error);
          failedBatches++;
        }
      }

      // Provide detailed feedback
      if (failedBatches === 0) {
        alert(`✅ Successfully uploaded all ${dataForSave.length} manhwa entries!\n${duplicateCount > 0 ? `• ${duplicateCount} duplicates were updated\n` : ''}• All records processed successfully`);
      } else {
        alert(`⚠️ Upload completed:\n• Successful batches: ${successfulBatches}/${totalBatches}\n• Failed batches: ${failedBatches}\n• Records uploaded: ~${actualUploads}\n• Duplicates handled: ${duplicateCount}\n\nSome records may have been uploaded individually. Check console for details.`);
      }
    } catch (error) {
      alert(`❌ Error saving to database: ${error.message}`);
      console.error('Database save error:', error);
    } finally {
      setDbLoading(false);
    }
  };

  const disconnectDatabase = () => {
    setDbConnected(false);
    setSupabaseConfig({ url: '', anonKey: '' });
    setShowDbConfig(false);
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
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-600">
            <div className="text-center mb-6">
              <BookOpen size={48} className="text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Manhwa Database!</h2>
            </div>
            
            <div className="text-gray-300 space-y-3 mb-6 text-sm">
              <p><strong>Notice:</strong> This database is still under development, so please be patient with any issues.</p>
              <p><strong>Import Required:</strong> You need to upload your own manhwa CSV file. The database doesn't come pre-loaded.</p>
              <p><strong>Get the Data:</strong> Click the download link below to get the latest manhwa database, then upload it using the file upload section.</p>
            </div>

            <div className="space-y-4">
              <a
                href="https://mega.nz/file/8dYBhJQD#RdQRx7ut45tUFNrlPJTqskCCZ9XeNEKWWkb_cnZ1HJ4"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-block text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors"
              >
                📥 Download Manhwa Database (MEGA)
              </a>
              
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-500 transition-colors"
              >
                Get Started!
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
        {/* Debug Info for Development */}
        {adminMode && (
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6 shadow-lg border border-yellow-600">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  🔧 Debug Information
                </h3>
                <p className="text-sm text-gray-300">
                  Current app state and database connection details
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h4 className="text-white font-medium mb-2">Database Status</h4>
                <p className="text-gray-300">Connected: {dbConnected ? '✅ Yes' : '❌ No'}</p>
                <p className="text-gray-300">Loading: {dbLoading ? '⏳ Yes' : '✅ No'}</p>
                <p className="text-gray-300">URL: {supabaseConfig.url ? '✅ Set' : '❌ Missing'}</p>
                <p className="text-gray-300">Key: {supabaseConfig.anonKey ? '✅ Set' : '❌ Missing'}</p>
              </div>
              
              <div className="bg-slate-700/50 p-3 rounded-lg">
                <h4 className="text-white font-medium mb-2">Data Status</h4>
                <p className="text-gray-300">Records Loaded: {manhwaData.length}</p>
                <p className="text-gray-300">Filtered Results: {filteredData.length}</p>
                <p className="text-gray-300">Search Term: "{searchTerm}"</p>
                <p className="text-gray-300">Active Filters: {Object.values(selectedFilters).flat().length}</p>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  console.log('=== DEBUG INFO ===');
                  console.log('DB Connected:', dbConnected);
                  console.log('DB Loading:', dbLoading);
                  console.log('Manhwa Data Length:', manhwaData.length);
                  console.log('Sample Records:', manhwaData.slice(0, 3));
                  console.log('Supabase Config:', { url: supabaseConfig.url.substring(0, 20) + '...', hasKey: !!supabaseConfig.anonKey });
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors text-sm"
              >
                🐛 Log Debug Info
              </button>
              
              <button
                onClick={async () => {
                  console.log('=== MANUAL DATABASE TEST ===');
                  try {
                    // Test 1: Connection test
                    console.log('1. Testing connection...');
                    const testResponse = await fetch(`${supabaseConfig.url}/rest/v1/manhwa?select=count`, {
                      headers: {
                        'apikey': supabaseConfig.anonKey,
                        'Authorization': `Bearer ${supabaseConfig.anonKey}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    console.log('Connection test status:', testResponse.status);
                    const testData = await testResponse.json();
                    console.log('Connection test data:', testData);

                    // Test 2: Actual data fetch
                    console.log('2. Testing data fetch...');
                    const dataResponse = await fetch(`${supabaseConfig.url}/rest/v1/manhwa?select=*`, {
                      headers: {
                        'apikey': supabaseConfig.anonKey,
                        'Authorization': `Bearer ${supabaseConfig.anonKey}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    console.log('Data fetch status:', dataResponse.status);
                    const data = await dataResponse.json();
                    console.log('Data fetch result:', `${data.length} records`);
                    if (data.length > 0) {
                      console.log('First 3 records:', data.slice(0, 3));
                    }

                    // Test 3: Try to set the data manually
                    if (data.length > 0) {
                      console.log('3. Manually setting data...');
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
                      setManhwaData(formattedData);
                      console.log('✅ Data manually set!', formattedData.length, 'records');
                    }
                  } catch (error) {
                    console.error('Manual test error:', error);
                  }
                }}
                className="px-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors text-sm"
              >
                🔗 Test Connection
              </button>
              
              <button
                onClick={async () => {
                  console.log('=== COMPREHENSIVE DATABASE INSPECTION ===');
                  try {
                    const baseUrl = supabaseConfig.url;
                    const apiKey = supabaseConfig.anonKey;
                    
                    // Test 1: Check table structure
                    console.log('1. Checking table info...');
                    const tableInfoResponse = await fetch(`${baseUrl}/rest/v1/`, {
                      headers: {
                        'apikey': apiKey,
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    console.log('Table info status:', tableInfoResponse.status);
                    
                    // Test 2: Try different query approaches
                    console.log('2. Testing different queries...');
                    
                    // Simple count
                    const countResponse = await fetch(`${baseUrl}/rest/v1/manhwa?select=count()`, {
                      headers: {
                        'apikey': apiKey,
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    console.log('Count query status:', countResponse.status);
                    const countData = await countResponse.json();
                    console.log('Count result:', countData);
                    
                    // Limited select
                    const limitedResponse = await fetch(`${baseUrl}/rest/v1/manhwa?select=*&limit=5`, {
                      headers: {
                        'apikey': apiKey,
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    console.log('Limited query status:', limitedResponse.status);
                    const limitedData = await limitedResponse.json();
                    console.log('Limited result:', limitedData);
                    
                    // Test 3: Check if table exists with different name
                    console.log('3. Checking for alternative table names...');
                    const alternativeNames = ['manhwas', 'manhwa_data', 'manhwa_entries'];
                    
                    for (const tableName of alternativeNames) {
                      try {
                        const altResponse = await fetch(`${baseUrl}/rest/v1/${tableName}?select=count()&limit=1`, {
                          headers: {
                            'apikey': apiKey,
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        console.log(`Table "${tableName}" status:`, altResponse.status);
                        if (altResponse.ok) {
                          const altData = await altResponse.json();
                          console.log(`Table "${tableName}" data:`, altData);
                        }
                      } catch (error) {
                        console.log(`Table "${tableName}" error:`, error.message);
                      }
                    }
                    
                  } catch (error) {
                    console.error('Comprehensive test error:', error);
                  }
                }}
                className="px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-500 transition-colors text-sm"
              >
                🔍 Deep Inspect
              </button>
            </div>
          </div>
        )}
        {adminMode && (
          <div className="bg-gradient-to-br from-yellow-800/90 to-orange-900/90 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6 shadow-lg border-2 border-yellow-500">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Shield size={20} className="text-yellow-400" />
                  Admin: Direct Database Upload
                </h3>
                <p className="text-sm text-yellow-200">
                  Upload CSV files directly to the database. This will replace all existing data.
                </p>
              </div>
            </div>
            
            <div className="border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition-all duration-300 border-yellow-400 hover:border-yellow-300 hover:bg-yellow-400/5">
              <Shield size={32} className="text-yellow-400 mx-auto mb-4" />
              <p className="text-yellow-200 mb-4 font-medium">
                Admin Upload: CSV → Database (Direct)
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleAdminFileUpload(e.target.files[0])}
                className="hidden"
                id="admin-file-upload"
              />
              <label
                htmlFor="admin-file-upload"
                className="inline-block px-6 py-3 bg-yellow-600 text-white rounded-lg cursor-pointer hover:bg-yellow-500 transition-colors font-medium"
              >
                Upload to Database
              </label>
              <p className="text-sm text-yellow-300 mt-3">
                ⚠️ This will replace ALL existing database records
              </p>
            </div>
          </div>
        )}

        {/* Database Configuration */}
        {adminMode && (
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6 shadow-lg border border-blue-600">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Database size={20} className="text-blue-400" />
                  Database Connection
                </h3>
                <p className="text-sm text-gray-300">
                  Connect to your Supabase database to sync and store your manhwa collection online.
                </p>
              </div>
              
              <button
                onClick={() => setShowDbConfig(!showDbConfig)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors text-sm"
              >
                {showDbConfig ? 'Hide Config' : 'Show Config'}
              </button>
            </div>

            {showDbConfig && (
              <div className="space-y-4 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-project.supabase.co"
                    value={supabaseConfig.url}
                    onChange={(e) => setSupabaseConfig(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Supabase Anon Key
                  </label>
                  <input
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                    value={supabaseConfig.anonKey}
                    onChange={(e) => setSupabaseConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={connectToDatabase}
                    disabled={dbLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {dbLoading ? 'Connecting...' : 'Connect'}
                  </button>
                  
                  {dbConnected && (
                    <>
                      <button
                        onClick={saveToDatabase}
                        disabled={dbLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Save size={16} />
                        {dbLoading ? 'Saving...' : 'Save to DB'}
                      </button>
                      
                      <button
                        onClick={loadDataFromDatabase}
                        disabled={dbLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Download size={16} />
                        Load from DB
                      </button>
                      
                      <button
                        onClick={disconnectDatabase}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-500 transition-colors flex items-center gap-2"
                      >
                        <X size={16} />
                        Disconnect
                      </button>
                    </>
                  )}
                </div>
                
                <div className="text-xs text-gray-400 p-3 bg-slate-800/50 rounded border border-slate-600">
                  <strong>Setup Instructions:</strong><br/>
                  1. Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">supabase.com</a><br/>
                  2. Copy your project URL and anon key from Settings → API<br/>
                  3. Run the provided SQL script in the SQL Editor<br/>
                  4. Enter your credentials above and click Connect
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thumbnail Upload Section */}
        {adminMode && (
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6 shadow-lg border border-green-600">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <FileText size={20} className="text-green-400" />
                  Upload Thumbnail Mappings
                </h3>
                <p className="text-sm text-gray-300">
                  Upload a CSV file containing title-image URL mappings to add thumbnails to your manhwa cards.
                </p>
                <p className="text-xs text-green-400 mt-1">
                  Format: Title, Image URL (one per line)
                </p>
              </div>
              
              {thumbnailData.size > 0 && (
                <div className="text-green-400 text-sm font-medium bg-black/20 px-3 py-1 rounded-lg border border-green-400">
                  🖼️ {thumbnailData.size} images loaded
                </div>
              )}
            </div>
            
            <div className="border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 border-green-500 hover:border-green-400 hover:bg-green-400/5">
              {isThumbnailLoading ? (
                <div>
                  <FileText size={32} className="text-green-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-green-300 font-medium">Loading thumbnails...</p>
                </div>
              ) : (
                <>
                  <FileText size={32} className="text-green-400 mx-auto mb-2" />
                  <p className="text-gray-300 mb-3 font-medium">
                    Upload thumbnail mappings
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
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-500 transition-colors text-sm font-medium"
                  >
                    Choose File
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {/* Upload Section */}
        {showUploadSection && manhwaData.length <= 3 && (
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 md:p-6 mb-6 shadow-lg border border-slate-600">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Upload size={20} className="text-blue-400" />
                  Upload Manhwa Database
                </h3>
                <p className="text-sm text-gray-300">
                  {dbConnected ? 
                    "Database is connected but appears empty. Upload your CSV file to populate it." :
                    "First download the database file, then upload it here to load the manhwa collection."
                  }
                </p>
              </div>
              
              <div className="flex gap-2">
                <a
                  href="https://mega.nz/file/8dYBhJQD#RdQRx7ut45tUFNrlPJTqskCCZ9XeNEKWWkb_cnZ1HJ4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors text-sm whitespace-nowrap"
                >
                  📥 Download
                </a>
                
                <button
                  onClick={() => setShowUploadSection(false)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-500 transition-colors text-sm"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-blue-400 bg-blue-400/10' 
                  : 'border-gray-500 hover:border-gray-400 hover:bg-gray-400/5'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload size={32} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-4 font-medium">
                Drop your CSV file here, or click to select
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
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-500 transition-colors font-medium"
              >
                Choose File
              </label>
              <p className="text-sm text-gray-400 mt-3">
                CSV files only • {dbConnected ? 'Data will be saved to database' : 'Data stored locally in your browser'}
              </p>
            </div>
          </div>
        )}

        {/* Collapsed Upload Button */}
        {!showUploadSection && manhwaData.length <= 3 && (
          <div className="mb-6">
            <button
              onClick={() => setShowUploadSection(true)}
              className="px-4 py-2 bg-purple-600/80 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-purple-500 transition-colors text-sm border border-purple-500"
            >
              <Upload size={16} className="inline mr-2" />
              Show Upload Section
            </button>
          </div>
        )}

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
              {adminMode && (
                <div className="relative h-48 bg-slate-700 overflow-hidden">
                  {manhwa.thumbnail && manhwa.thumbnail.trim() !== "" ? (
                    <img
                      src={manhwa.thumbnail}
                      alt={manhwa.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
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
                      <BookOpen size={48} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400 font-medium text-sm px-4">{manhwa.title}</p>
                    </div>
                  </div>
                  
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
              )}

              <div className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-white flex-1 pr-2">
                    {manhwa.title}
                  </h3>
                  {!adminMode && (
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
                  )}
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

                {adminMode && (
                  <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-blue-500 transition-all">
                    Read Online
                  </button>
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
            This database is based on the community-driven manhwa spreadsheet
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManhwaDatabase;
