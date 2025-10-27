// apyx.blog - Starter React App (single-file)
// Save this as `App.jsx` inside a create-react-app / Vite React project.
// Uses Tailwind CSS for styling (classes are present).

import React, { useEffect, useState, useRef } from 'react';

// Core colours: highlight #F07694, background white #FFFFFF, contrast #00A5FF
// Note: When using custom colors in Tailwind, we use bracket notation like: bg-[#F07694]

// --- Helper Functions and Data ---

function sampleDocs(){
  return [
    { id: 'd1', title: 'The Glimmering Sea', section: 'Short_fiction/Excerpts', logline: 'A mysterious artifact found beneath the waves.', content: 'This is the full content of the first document. It should be visible when the document view is active. The artifact pulses with a faint blue light, reminiscent of the deep ocean.', fileUrl: 'https://example.com/the_glimmering_sea.pdf', fileType: 'pdf', likes: 5, dislikes: 1, comments: [] },
    { id: 'd2', title: 'Echoes of the Void', section: 'Experimental', logline: 'A stream-of-consciousness narrative experiment.', content: 'Document 2 content. Exploring non-linear storytelling and typographic limits.', fileUrl: 'https://example.com/echoes_of_the_void.pdf', fileType: 'pdf', likes: 12, dislikes: 0, comments: [] },
    { id: 'd3', title: 'Sonnet for the Tired Mind', section: 'Poetry/Lyrics', logline: 'A 14-line reflection on modern anxiety.', content: 'Content for the Sonnet. Rhyme scheme ABAB CDCD EFEF GG.', fileUrl: 'https://example.com/sonnet_for_the_tired_mind.pdf', fileType: 'pdf', likes: 8, dislikes: 3, comments: [] },
  ];
}

function sampleAudios(){
  return [
    { id: 'a1', title: 'Ambient Drift I', section: 'Music', logline: 'First track in a series of calming soundscapes.', fileUrl: 'https://example.com/ambient_drift.mp3', fileType: 'audio/mp3', likes: 20, dislikes: 0, comments: [] },
  ];
}


// --- Nav Item Component (New/Modified) ---

function NavItem({ text, onClick, isCategories=false, CORE }) {
  
  const categories = [
    { text: "Experimental", view: 'Experimental' },
    { text: "Short fiction/Excerpts", view: 'Short_fiction/Excerpts' },
    { text: "Poetry/Lyrics", view: 'Poetry/Lyrics' },
    { text: "Music", view: 'Music' },
  ];
  
  return (
    <div
      onClick={isCategories ? null : onClick} // Only handle click if it's NOT the Categories button
      className={`
        text-white 
        cursor-pointer 
        p-2 px-4 
        rounded-lg 
        transition-colors duration-200 
        hover:bg-white/20 
        relative 
        ${isCategories ? 'group' : ''} // This 'group' class is key for the hover dropdown
      `}
    >
      {text}
      
      {/* Categories Dropdown Box (Appears on Hover) */}
      {isCategories && (
        <div 
          className={`
            absolute top-full left-1/2 -translate-x-1/2 
            mt-3 w-64 
            bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg 
            p-2 
            opacity-0 invisible group-hover:opacity-100 group-hover:visible 
            transition-opacity duration-300 z-50
          `}
        >
          {categories.map((cat, index) => (
            <div 
              key={cat.text} 
              // onClick is now responsible for sending the user to the section
              onClick={() => onClick(cat.view)} 
              className={`
                p-2 text-gray-800 
                hover:bg-gray-200/50 
                rounded-md 
                ${index < categories.length - 1 ? `border-b border-[${CORE.contrast}]/50 mb-1` : ''} 
              `}
            >
              {cat.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// --- Top Bar Component (Modified to use new styling) ---

function TopBar({setView, CORE, user, logOut, logIn, openCategories}){
  const logoPath = "/path/to/your/logo.png"; // <-- REMINDER: CHANGE THIS TO YOUR ACTUAL LOGO PATH

  return (
    <div 
      className={`
        fixed top-0 left-0 right-0 z-50  
        h-[100px] // Set height to about 100 pixels
        bg-[${CORE.highlight}] 
        shadow-xl 
        flex items-center justify-between 
        px-4 md:px-12
      `}
    >
      {/* Container for Logo (Left) */}
      <div className="flex items-center space-x-4">
        {/* Logo and Home Button */}
        <div 
          className="cursor-pointer text-white text-2xl font-bold" 
          onClick={() => setView({name:'home', payload:null})}
        >
          {/* Placeholder for your Logo */}
          <img 
            src={logoPath} // Path to your logo (Change this!)
            alt="Apyx.blog Logo" 
            className="h-16 w-auto" // Adjust size as needed
            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x64/F07694/FFFFFF?text=Logo" }}
          /> 
        </div>
      </div>

      {/* Container for Section Buttons (Center) */}
      <div className="hidden md:flex space-x-4 text-lg font-semibold h-full items-center">
        {/* The Menu Buttons */}
        <NavItem text="Home" onClick={() => setView({name:'home', payload:null})} CORE={CORE} />
        {/* Note: The 'openCategories' function now expects the section name as an argument */}
        <NavItem text="Categories" isCategories={true} onClick={(sectionName) => setView({name:'section', payload:sectionName})} CORE={CORE} />
        <NavItem text="About" onClick={() => setView({name:'about', payload:null})} CORE={CORE} />
        <NavItem text="Contact" onClick={() => setView({name:'contact', payload:null})} CORE={CORE} />
      </div>

      {/* Container for Sign In/Profile (Right) */}
      <div className="text-white text-base">
        {user ? (
          // If signed in
          <NavItem text="Profile" onClick={() => setView({name:'profile', payload:null})} CORE={CORE} />
        ) : (
          // If NOT signed in
          <div className="flex space-x-2">
            <NavItem text="Sign In / Register" onClick={logIn} CORE={CORE} />
          </div>
        )}
      </div>
    </div>
  );
}


// --- Search and Filtering Function ---

function SearchFilter({ allItems, setFilteredItems, initialSection }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(initialSection || 'All');

  // Logic to apply filters and search
  useEffect(() => {
    let results = allItems;
    
    // 1. Filter by Section
    if (activeFilter !== 'All') {
      results = results.filter(item => item.section === activeFilter);
    }

    // 2. Search by Term (title or content/logline)
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      results = results.filter(item => 
        item.title.toLowerCase().includes(lowerCaseSearch) ||
        item.logline.toLowerCase().includes(lowerCaseSearch) ||
        (item.content && item.content.toLowerCase().includes(lowerCaseSearch))
      );
    }
    
    setFilteredItems(results);
  }, [searchTerm, activeFilter, allItems, setFilteredItems]);

  const categories = ['All', 'Experimental', 'Short fiction/Excerpts', 'Poetry/Lyrics', 'Music'];

  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8 items-start mb-6">
      {/* Search Bar */}
      <input
        type="text"
        placeholder={`Search in ${initialSection || 'All'}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-3 border border-gray-300 rounded-lg shadow-sm w-full md:w-1/2 focus:ring-2 focus:ring-[#F07694]"
      />

      {/* Filter Tabs (Optional for Section view, helpful for Home/All) */}
      <div className="flex space-x-2 overflow-x-auto p-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`
              px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap 
              transition-colors duration-150
              ${activeFilter === cat 
                ? 'bg-[#F07694] text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {cat.replace(/_/g, ' ').replace(/\//g, ' / ')}
          </button>
        ))}
      </div>
    </div>
  );
}


// --- Home Page Component ---

function HomePage({ docs, audios, gotoDoc, CORE }) {
  const allItems = [...docs, ...audios].sort(() => 0.5 - Math.random());
  const randomItem = allItems[0] || {title: "Welcome", logline: "No content yet. Start uploading!", section: "Info"};
  
  const categories = [
    { name: "Experimental", color: '#F07694' },
    { name: "Short fiction/Excerpts", color: '#00A5FF' },
    { name: "Poetry/Lyrics", color: '#F07694' },
    { name: "Music", color: '#00A5FF' }
  ];

  const categoryCounts = allItems.reduce((acc, item) => {
    acc[item.section] = (acc[item.section] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
      {/* Main Content Area (3:4 aspect ratio simulation) */}
      <div className="md:col-span-2 space-y-6">
        
        {/* Random Document Showcase (Top Left) */}
        <div className={`p-6 rounded-xl shadow-lg bg-white/90 border border-gray-100`}>
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-3">Today's Showcase</h3>
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => gotoDoc(randomItem.id)}>
            <div className={`w-16 h-16 flex items-center justify-center rounded-md text-white font-bold text-lg 
                            bg-[${randomItem.section === 'Music' ? CORE.contrast : CORE.highlight}]`}>
              {randomItem.section === 'Music' ? '♪' : 'A'} 
            </div>
            <div>
              <h4 className="text-lg font-semibold hover:text-gray-600 transition-colors">{randomItem.title}</h4>
              <p className="text-sm text-gray-500 truncate max-w-sm">{randomItem.logline}</p>
            </div>
          </div>
        </div>

        {/* Categories Grid (Right of Showcase, using the same column area) */}
        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat, index) => (
            <div 
              key={cat.name} 
              onClick={() => gotoDoc(null, cat.name)} 
              className={`p-4 rounded-xl shadow-lg cursor-pointer transform hover:scale-[1.02] transition-transform duration-200 
                          text-white font-bold text-lg flex flex-col justify-between h-32`}
              style={{ backgroundColor: cat.color }}
            >
              <span className="text-2xl">{cat.name.split('/')[0]}</span>
              <span className="text-sm opacity-80">{categoryCounts[cat.name] || 0} works</span>
            </div>
          ))}
        </div>
        
      </div>

      {/* Sidebar/Empty Space on a 16:9 monitor (Right Column) */}
      <div className="hidden md:block md:col-span-1">
        {/* This column is the 'cut-off' on the 3:4 design */}
        <div className="p-6 bg-white/50 rounded-xl border border-dashed border-gray-300 h-full">
          <h3 className="text-lg font-semibold text-gray-700">Apyx.blog Vitals</h3>
          <p className="text-sm text-gray-500 mt-2">
            This column visually narrows the content area to achieve a near 3:4 aesthetic, providing background context or space for future widgets.
          </p>
        </div>
      </div>
    </div>
  );
}


// --- Section Page Component ---

function SectionPage({ sectionName, docs, audios, gotoDoc, CORE }) {
  const allItems = [...docs, ...audios];
  const itemsInSection = allItems.filter(item => item.section === sectionName);
  const [filteredItems, setFilteredItems] = useState(itemsInSection);

  useEffect(() => {
    // Reset filtered items when the section changes
    setFilteredItems(itemsInSection);
  }, [sectionName, docs, audios]);

  const randomItem = itemsInSection[Math.floor(Math.random() * itemsInSection.length)] || {title: "No works yet", logline: "Be the first to upload!", section: sectionName};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
      {/* Main 3:4 Content Area */}
      <div className="md:col-span-2 space-y-8">
        <h2 className={`text-3xl font-bold text-gray-800 border-b-2 pb-2`} style={{borderColor: CORE.highlight}}>
          {sectionName.replace(/_/g, ' ').replace(/\//g, ' / ')}
        </h2>

        {/* Random Document Showcase */}
        <div className={`p-6 rounded-xl shadow-lg bg-white/90 border border-gray-100`}>
          <h3 className="text-xl font-bold text-gray-800 border-b pb-2 mb-3">Featured {sectionName.split('/')[0]}</h3>
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => gotoDoc(randomItem.id)}>
            <div className={`w-16 h-16 flex items-center justify-center rounded-md text-white font-bold text-lg 
                            bg-[${randomItem.section === 'Music' ? CORE.contrast : CORE.highlight}]`}>
              {randomItem.section === 'Music' ? '♪' : 'A'} 
            </div>
            <div>
              <h4 className="text-lg font-semibold hover:text-gray-600 transition-colors">{randomItem.title}</h4>
              <p className="text-sm text-gray-500 truncate max-w-sm">{randomItem.logline}</p>
            </div>
          </div>
        </div>
        
        {/* Search and List */}
        <SearchFilter 
          allItems={itemsInSection} 
          setFilteredItems={setFilteredItems} 
          initialSection={sectionName} 
        />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div key={item.id} className="cursor-pointer space-y-2" onClick={() => gotoDoc(item.id)}>
              {/* Icon Placeholder */}
              <div 
                className={`w-full h-40 flex items-center justify-center rounded-lg shadow-md hover:shadow-xl transition-shadow 
                            bg-gray-200 text-gray-600 text-6xl font-extrabold`}
              >
                {item.section === 'Music' ? '🎵' : '📄'}
              </div>
              <p className="text-sm font-semibold text-gray-800 text-center truncate">{item.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar/Empty Space on a 16:9 monitor */}
      <div className="hidden md:block md:col-span-1">
        <div className="p-6 bg-white/50 rounded-xl border border-dashed border-gray-300 h-full">
          <h3 className="text-lg font-semibold text-gray-700">Section Sidebar</h3>
          <p className="text-sm text-gray-500 mt-2">
            This area maintains the 3:4 content ratio for consistency across sections.
          </p>
        </div>
      </div>
    </div>
  );
}


// --- Document Page Components (No changes needed, only kept for completeness) ---

function DocumentPage({ item, CORE, saveComment, setFav, isFav, user, toggleLike, toggleDislike }) {
  // View states: 'top_bottom', 'single_page', 'double_page'
  const [docView, setDocView] = useState('top_bottom'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState(user?.name || 'Anonymous');
  const totalPages = 5; // Placeholder for actual PDF page count
  
  const handleCommentSubmit = () => {
    if(commentText){
      saveComment(item.id, { name: commentName, text: commentText, likes: 0, dislikes: 0, id: Date.now() });
      setCommentText('');
    }
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">{item.title}</h2>
      <p className="text-xl font-light text-gray-600 border-b pb-4">{item.logline}</p>

      {/* Document Overview */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        <p className="text-sm text-gray-700">{item.content.substring(0, 150)}...</p>
        <button className={`text-[${CORE.contrast}] font-semibold mt-2 hover:underline`}>Show More</button>
      </div>

      {/* Document/File Viewer Area */}
      <div className="bg-white p-6 border rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold mb-4">Document Viewer</h3>
        
        {/* Viewer Controls */}
        <div className="flex space-x-4 mb-4 items-center">
          <label className="text-sm font-medium">View Mode:</label>
          <button onClick={() => setDocView('top_bottom')} className={`px-3 py-1 rounded text-sm ${docView === 'top_bottom' ? `bg-[${CORE.highlight}] text-white` : 'bg-gray-200'}`}>Top to Bottom</button>
          <button onClick={() => setDocView('single_page')} className={`px-3 py-1 rounded text-sm ${docView === 'single_page' ? `bg-[${CORE.highlight}] text-white` : 'bg-gray-200'}`}>Single Page</button>
          <button onClick={() => setDocView('double_page')} className={`px-3 py-1 rounded text-sm ${docView === 'double_page' ? `bg-[${CORE.highlight}] text-white` : 'bg-gray-200'}`}>Double Page</button>
        </div>

        {/* PDF/File Display */}
        <div className="border border-gray-300 rounded-lg overflow-hidden h-96">
          <iframe 
            src={item.fileUrl} 
            className="w-full h-full" 
            title={item.title} 
            // Simulate single/double page view by manipulating the display area if necessary
          />
        </div>

        {/* Page Navigation for Single/Double View */}
        {(docView === 'single_page' || docView === 'double_page') && (
          <div className="flex justify-center space-x-4 mt-4">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded">Previous</button>
            <span className="self-center">Page {currentPage} of {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border rounded">Next</button>
          </div>
        )}
      </div>

      {/* Interaction Field */}
      <div className="flex justify-between items-center p-4 border-t border-b border-gray-200">
        <div className="flex space-x-6">
          <button onClick={() => toggleLike(item.id)} className="flex items-center space-x-1 text-green-600 hover:text-green-800">
            <span>👍</span>
            <span>{item.likes}</span>
          </button>
          <button onClick={() => toggleDislike(item.id)} className="flex items-center space-x-1 text-red-600 hover:text-red-800">
            <span>👎</span>
            <span>{item.dislikes}</span>
          </button>
        </div>
        <button onClick={() => setFav(item.id)} className={`flex items-center space-x-1 ${isFav(item.id) ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`}>
          <span>❤️</span>
          <span>{isFav(item.id) ? 'Favorited' : 'Favorite'}</span>
        </button>
      </div>

      {/* Comments and Similar Documents Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Similar Documents (Left) */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2">Similar Works</h3>
          <div className="space-y-2">
            {/* Placeholder for similar documents */}
            <div className="p-2 border rounded hover:bg-gray-100 cursor-pointer">The Silent Chord (Music)</div>
            <div className="p-2 border rounded hover:bg-gray-100 cursor-pointer">A Haiku on Rain (Poetry)</div>
          </div>
        </div>

        {/* Comments (Right) */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2">Comments</h3>
          
          {/* New Comment Input */}
          <div className="border p-4 rounded-lg bg-gray-50">
            <input 
              type="text" 
              placeholder="Your name (optional)" 
              value={commentName} 
              onChange={e => setCommentName(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <textarea 
              placeholder="Leave a comment..." 
              value={commentText} 
              onChange={e => setCommentText(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              rows={3}
            />
            <button onClick={handleCommentSubmit} className={`bg-[${CORE.contrast}] text-white px-4 py-2 rounded hover:opacity-90`}>
              Post Comment
            </button>
          </div>

          {/* Existing Comments */}
          <div className="space-y-3">
            {item.comments.length > 0 ? (
              item.comments.map(comment => (
                <div key={comment.id} className="p-3 border-b border-gray-200">
                  <p className="font-semibold">{comment.name}</p>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                  <div className="flex space-x-4 text-xs mt-1">
                    <span className="text-green-600 cursor-pointer">👍 {comment.likes}</span>
                    <span className="text-red-600 cursor-pointer">👎 {comment.dislikes}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function MusicPage({ item, CORE, saveComment, setFav, isFav, user, toggleLike, toggleDislike }) {
  // Uses the simplified AudioPlayer from my previous suggestion
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800">{item.title}</h2>
      <p className="text-xl font-light text-gray-600 border-b pb-4">{item.logline}</p>

      {/* Audio Player Area */}
      <div className="bg-white p-6 border rounded-lg shadow-xl">
        <h3 className="text-xl font-semibold mb-4">Music Player</h3>
        
        {/* Simple HTML Audio Player with controls */}
        <div className="w-full">
            {/* The audio element provides runtime dial, play button, and volume control */}
            <audio controls src={item.fileUrl} className="w-full" />
            <p className="text-sm text-gray-500 mt-2">Waveform visualization placeholder removed for stability.</p>
        </div>
      </div>

      {/* Interaction Field - Same as Document Page */}
      <div className="flex justify-between items-center p-4 border-t border-b border-gray-200">
        <div className="flex space-x-6">
          <button onClick={() => toggleLike(item.id)} className="flex items-center space-x-1 text-green-600 hover:text-green-800">
            <span>👍</span>
            <span>{item.likes}</span>
          </button>
          <button onClick={() => toggleDislike(item.id)} className="flex items-center space-x-1 text-red-600 hover:text-red-800">
            <span>👎</span>
            <span>{item.dislikes}</span>
          </button>
        </div>
        <button onClick={() => setFav(item.id)} className={`flex items-center space-x-1 ${isFav(item.id) ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`}>
          <span>❤️</span>
          <span>{isFav(item.id) ? 'Favorited' : 'Favorite'}</span>
        </button>
      </div>

      {/* Comments and Similar Documents Split - Same as Document Page */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2">Similar Works</h3>
          <div className="space-y-2">
            <div className="p-2 border rounded hover:bg-gray-100 cursor-pointer">Rhythmic Structure (Experimental)</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2">Comments</h3>
          {/* New Comment Input */}
          <div className="border p-4 rounded-lg bg-gray-50">
            <input 
              type="text" 
              placeholder="Your name (optional)" 
              value={'Anonymous'} 
              className="w-full p-2 border rounded mb-2"
            />
            <textarea 
              placeholder="Leave a comment..." 
              className="w-full p-2 border rounded mb-2"
              rows={3}
            />
            <button className={`bg-[${CORE.contrast}] text-white px-4 py-2 rounded hover:opacity-90`}>
              Post Comment (Functionality not fully implemented here)
            </button>
          </div>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">No comments yet (Placeholder).</p>
          </div>
        </div>
      </div>
    </div>
  );
}


function SimpleTextPage({title, initialText, CORE}){
  // This component needs to be simplified as per your request (just text input)
  const [text, setText] = useState(initialText);
  return (
    <div className="prose max-w-none p-4">
      <h2 className={`text-3xl font-bold border-b-2 pb-2`} style={{borderColor: CORE.highlight}}>{title}</h2>
      <textarea className="w-full h-96 border mt-4 p-3" value={text} onChange={e=>setText(e.target.value)} />
    </div>
  );
}

function ProfilePage({user, setUser, getFavs, docs, audios, gotoDoc, CORE}){
  const favs = getFavs();
  const favItems = [...docs,...audios].filter(i=> favs.includes(i.id));
  if(!user) return <div className="p-4">Not signed in.</div>;
  
  // Placeholder data for trackers
  const trackerData = [
    { label: "Documents Read", count: user.readCount || 5 },
    { label: "Comments Left", count: user.commentCount || 12 },
    { label: "Likes Received", count: user.likesReceived || 45 },
  ];

  return (
    <div className="p-4 space-y-8">
      <h2 className={`text-3xl font-bold border-b-2 pb-2`} style={{borderColor: CORE.highlight}}>User Profile: {user.name}</h2>
      
      {/* Profile Customization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-white shadow-lg rounded-xl">
        <div className="flex flex-col items-center space-y-4">
          {/* PFP (Placeholder) */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl text-white font-bold`} style={{backgroundColor: CORE.contrast}}>
            {user.name[0].toUpperCase()}
          </div>
          <button className={`text-sm font-medium text-[${CORE.contrast}] hover:underline`}>Change Profile Picture</button>
        </div>
        
        <div className="md:col-span-2 space-y-4">
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea 
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F07694]" 
            rows={3} 
            value={user.bio||'No bio set.'} 
            onChange={e=>setUser({...user,bio:e.target.value})} 
          />
          <button className={`bg-[${CORE.highlight}] text-white px-4 py-2 rounded hover:opacity-90`}>Save Changes</button>
        </div>
      </div>

      {/* Tracker Section */}
      <div className="space-y-4">
        <h4 className="text-xl font-semibold border-b pb-2">Activity Tracker</h4>
        <div className="grid grid-cols-3 gap-4">
          {trackerData.map(t => (
            <div key={t.label} className="p-4 bg-gray-100 rounded-lg text-center shadow-md">
              <div className={`text-3xl font-bold text-[${CORE.contrast}]`}>{t.count}</div>
              <p className="text-sm text-gray-600">{t.label}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Favourites Section */}
      <div className="space-y-4">
        <h4 className="text-xl font-semibold border-b pb-2">Favourites</h4>
        <div className="mt-2 space-y-2">
          {favItems.length > 0 ? (
            favItems.map(it=> (
              <div 
                key={it.id} 
                className="p-3 border rounded cursor-pointer hover:bg-gray-50 flex justify-between items-center" 
                onClick={()=>gotoDoc(it.id)}
              >
                <span className="font-medium">{it.title}</span>
                <span className="text-sm text-gray-500">{it.section}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">You have no favourited items yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}


// --- Main App Component ---

export default function App(){
  const CORE = { highlight: '#F07694', bg: '#FFFFFF', contrast: '#00A5FF' };

  // Views: home, section, doc, about, contact, profile
  const [view, setView] = useState({name:'home', payload:null});

  // simple in-memory "database" + localStorage persistence
  const [docs, setDocs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('apyx_docs')) || sampleDocs(); } catch(e){ return sampleDocs(); }
  });
  const [audioList, setAudioList] = useState(() => {
    try { return JSON.parse(localStorage.getItem('apyx_audio')) || sampleAudios(); } catch(e){ return sampleAudios(); }
  });

  useEffect(()=> localStorage.setItem('apyx_docs', JSON.stringify(docs)), [docs]);
  useEffect(()=> localStorage.setItem('apyx_audio', JSON.stringify(audioList)), [audioList]);

  const [user, setUser] = useState(()=> JSON.parse(localStorage.getItem('apyx_user')) || null);
  useEffect(()=> localStorage.setItem('apyx_user', JSON.stringify(user)), [user]);

  const [bgImage, setBgImage] = useState(() => localStorage.getItem('apyx_bg_image') || 'https://images.unsplash.com/photo-1549491763-958a5c370213?fit=crop&q=80&w=1974&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
  useEffect(()=> localStorage.setItem('apyx_bg_image', bgImage), [bgImage]);


  // --- Helper Methods ---

  const allItems = [...docs, ...audioList];

  const gotoDoc = (id, sectionName) => {
    if (id) {
      setView({name: 'doc', payload: id});
    } else if (sectionName) {
      setView({name: 'section', payload: sectionName});
    }
  }

  const findItem = (id) => allItems.find(item => item.id === id);

  const getFavs = () => user?.favorites || [];
  const isFav = (id) => getFavs().includes(id);

  const setFav = (id) => {
    if(!user) return alert('Please sign in to favorite an item.');
    setUser(prevUser => {
      let newFavs = prevUser.favorites || [];
      if (newFavs.includes(id)) {
        newFavs = newFavs.filter(f => f !== id);
      } else {
        newFavs = [...newFavs, id];
      }
      return {...prevUser, favorites: newFavs};
    });
  };

  const updateItem = (id, updates) => {
    setDocs(prevDocs => prevDocs.map(doc => doc.id === id ? {...doc, ...updates} : doc));
    setAudioList(prevAudios => prevAudios.map(audio => audio.id === id ? {...audio, ...updates} : audio));
  };

  const toggleLike = (id) => {
    const item = findItem(id);
    if (!item) return;
    updateItem(id, { likes: (item.likes || 0) + 1 });
  };

  const toggleDislike = (id) => {
    const item = findItem(id);
    if (!item) return;
    updateItem(id, { dislikes: (item.dislikes || 0) + 1 });
  };

  const saveComment = (id, comment) => {
    const item = findItem(id);
    if (!item) return;
    updateItem(id, { comments: [...(item.comments || []), comment] });
  };

  const logIn = () => {
    const username = prompt("Enter a username to sign in/register:");
    if (username) {
      setUser({
        name: username, 
        bio: '', 
        favorites: [], 
        readCount: Math.floor(Math.random() * 20),
        commentCount: Math.floor(Math.random() * 5),
        likesReceived: Math.floor(Math.random() * 100),
      });
    }
  };
  const logOut = () => setUser(null);


  // --- View Rendering Logic ---

  let pageContent;
  switch(view.name){
    case 'home':
      pageContent = <HomePage docs={docs} audios={audioList} gotoDoc={gotoDoc} CORE={CORE} />;
      break;
    case 'section':
      pageContent = <SectionPage sectionName={view.payload} docs={docs} audios={audioList} gotoDoc={gotoDoc} CORE={CORE} />;
      break;
    case 'doc':
      const item = findItem(view.payload);
      if(!item) {
        pageContent = <div>Document not found.</div>;
        break;
      }
      if(item.section === 'Music'){
        pageContent = <MusicPage item={item} CORE={CORE} saveComment={saveComment} setFav={setFav} isFav={isFav} user={user} toggleLike={toggleLike} toggleDislike={toggleDislike} />;
      } else {
        pageContent = <DocumentPage item={item} CORE={CORE} saveComment={saveComment} setFav={setFav} isFav={isFav} user={user} toggleLike={toggleLike} toggleDislike={toggleDislike} />;
      }
      break;
    case 'about':
      pageContent = <SimpleTextPage title="About Apyx.blog" initialText="This is where I'll put my information about the website and myself." CORE={CORE} />;
      break;
    case 'contact':
      pageContent = <SimpleTextPage title="Contact" initialText="You can reach me at [email@example.com]" CORE={CORE} />;
      break;
    case 'profile':
      pageContent = <ProfilePage user={user} setUser={setUser} getFavs={getFavs} docs={docs} audios={audioList} gotoDoc={gotoDoc} CORE={CORE} />;
      break;
    default:
      pageContent = <div>404 Page Not Found</div>;
  }

  // --- Final Render ---

  return (
    <div 
      className="min-h-screen relative" 
      style={{ backgroundImage: `url(${bgImage})`, backgroundAttachment: 'fixed', backgroundSize: 'cover' }}
    >
      
      {/* Top Navigation Bar (Fixed) */}
      <TopBar 
        setView={setView} 
        CORE={CORE} 
        user={user} 
        logOut={logOut} 
        logIn={logIn} 
        // We pass setView here, which NavItem now uses directly for navigation
        openCategories={(sectionName) => setView({name:'section', payload: sectionName})} 
      />

      {/* Main Content Area */}
      {/* pt-[100px] ensures content is pushed down, clearing the 100px fixed TopBar */}
      <main className="min-h-screen pt-[100px] bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {pageContent}
        </div>
        
        {/* Simple Footer/Debug Info */}
        <footer className="py-4 text-center text-gray-500 text-xs mt-12 border-t border-gray-300">
          Apyx.blog | Built with React and Tailwind CSS.
          <button 
            onClick={() => setBgImage('https://images.unsplash.com/photo-1577742111364-58580007559c?fit=crop&q=80&w=1935&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')} 
            className="ml-4 text-[${CORE.contrast}] hover:underline"
          >
            Change BG Image
          </button>
        </footer>
      </main>

    </div>
  );
}
