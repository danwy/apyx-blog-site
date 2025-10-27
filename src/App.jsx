// apyx.blog - Starter React App (single-file)
// Save this as `App.jsx` inside a create-react-app / Vite React project.
// Uses Tailwind CSS for styling (classes are present). Instructions to run included below.

import React, { useEffect, useState, useRef } from 'react';

// Core colours: highlight #F07694, background white #FFFFFF, contrast #00A5FF

export default function App(){
  const CORE = { highlight: '#F07694', bg: '#FFFFFF', contrast: '#00A5FF' };

  // Views: home, section, doc, about, contact, profile
  const [view, setView] = useState({name:'home', payload:null});

  // simple in-memory "database" + localStorage persistence
  const [docs, setDocs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('apyx_docs')) || sampleDocs(); } catch(e){ return sampleDocs(); }
  });
  const [audioList, setAudioList] = useState(() => {
    try { return JSON.parse(localStorage.getItem('apyx_audio')) || []; } catch(e){ return []; }
  });

  useEffect(()=> localStorage.setItem('apyx_docs', JSON.stringify(docs)), [docs]);
  useEffect(()=> localStorage.setItem('apyx_audio', JSON.stringify(audioList)), [audioList]);

  const [user, setUser] = useState(()=> JSON.parse(localStorage.getItem('apyx_user')) || null);
  useEffect(()=> localStorage.setItem('apyx_user', JSON.stringify(user)), [user]);

  const [bgImage, setBgImage] = useState(()=> localStorage.getItem('apyx_bg') || '');
  useEffect(()=> { if(bgImage) localStorage.setItem('apyx_bg', bgImage); }, [bgImage]);

  // search index: titles + optional fullText field on each doc
  const [query, setQuery] = useState('');

  // UI helpers
  function gotoHome(){ setView({name:'home', payload:null}); }
  function gotoSection(name){ setView({name:'section', payload:name}); }
  function gotoDoc(id){ setView({name:'doc', payload:id}); }

  // File upload handlers (pdf, audio)
  function handleUploadPDF(e){
    const f = e.target.files[0];
    if(!f) return;
    const id = 'doc_'+Date.now();
    const url = URL.createObjectURL(f);
    const newDoc = { id, title: f.name, blob: url, type: 'pdf', category: 'Short fiction/Excerpts', created: Date.now(), description:'', fullText:'' };
    setDocs(d=>[newDoc,...d]);
    e.target.value = '';
    alert('PDF added to library. Edit its title or description in the doc page.');
  }

  function handleUploadAudio(e){
    const f = e.target.files[0]; if(!f) return;
    const id = 'aud_'+Date.now();
    const url = URL.createObjectURL(f);
    const newAud = { id, title: f.name, blob: url, type:'audio', created: Date.now(), description:'' };
    setAudioList(a=>[newAud,...a]);
    e.target.value='';
    alert('Audio added to library.');
  }

  // basic like/favorite/comment storage in localStorage keyed by item id
  function toggleFav(id){
    const favs = JSON.parse(localStorage.getItem('apyx_favs')||'[]');
    const idx = favs.indexOf(id);
    if(idx===-1) favs.push(id); else favs.splice(idx,1);
    localStorage.setItem('apyx_favs', JSON.stringify(favs));
    // trigger refresh by updating user object copy
    setUser(u=>u?{...u}:u);
  }
  function getFavs(){ return JSON.parse(localStorage.getItem('apyx_favs')||'[]'); }

  // comments
  function addComment(id, name, text){
    const all = JSON.parse(localStorage.getItem('apyx_comments')||'{}');
    if(!all[id]) all[id]=[];
    all[id].push({name, text, ts:Date.now(), id:'c_'+Date.now()});
    localStorage.setItem('apyx_comments', JSON.stringify(all));
    setUser(u=>u?{...u}:u);
  }
  function getComments(id){ const all = JSON.parse(localStorage.getItem('apyx_comments')||'{}'); return all[id]||[]; }

  // search function (searches title, description, fullText)
  function searchItems(q){
    q = q.toLowerCase().trim();
    if(!q) return [...docs, ...audioList];
    const res = [];
    [...docs,...audioList].forEach(it=>{
      const hay = ((it.title||'') + ' ' + (it.description||'') + ' ' + (it.fullText||'')).toLowerCase();
      if(hay.includes(q)) res.push(it);
    });
    return res;
  }

  // pick random document for featured
  function randomDoc(list){ if(!list || list.length===0) return null; return list[Math.floor(Math.random()*list.length)]; }

  // small responsive layout for main page as requested
  return (
    <div className="min-h-screen" style={{backgroundColor:CORE.bg, backgroundImage: bgImage?`url(${bgImage})`:undefined, backgroundSize:'cover'}}>
      <TopBar onHome={gotoHome} onSection={gotoSection} user={user} onSignIn={()=>{ const name = prompt('Enter display name (this is local only)'); if(name) setUser({name, id:'u_'+Date.now(), stats:{read:0,comments:0,likes:0}}); }} onProfile={()=>setView({name:'profile'})} />

      <div className="max-w-6xl mx-auto p-6">
        {view.name==='home' && (
          <HomeView docs={docs} audios={audioList} onUploadPDF={handleUploadPDF} onUploadAudio={handleUploadAudio} gotoSection={gotoSection} gotoDoc={gotoDoc} randomDoc={randomDoc([...docs,...audioList])} />
        )}

        {view.name==='section' && (
          <SectionView name={view.payload} items={searchItems('')} gotoDoc={gotoDoc} searchFn={searchItems} bgImage={bgImage} setBgImage={setBgImage} />
        )}

        {view.name==='doc' && (
          <DocumentView id={view.payload} docs={docs} audios={audioList} onEdit={(updated)=>{
            setDocs(docs.map(x=> x.id===updated.id?{...x,...updated}:x));
            setAudioList(audioList.map(x=> x.id===updated.id?{...x,...updated}:x));
          }} addComment={addComment} getComments={getComments} toggleFav={toggleFav} getFavs={getFavs} />
        )}

        {view.name==='about' && (
          <SimpleTextPage title="About" initialText={'Put your about text here.'} />
        )}

        {view.name==='contact' && (
          <SimpleTextPage title="Contact" initialText={'Put contact info here.'} />
        )}

        {view.name==='profile' && (
          <ProfilePage user={user} setUser={setUser} getFavs={getFavs} docs={docs} audios={audioList} gotoDoc={gotoDoc} />
        )}

        {/* allow navigation to named views for convenience */}
        <div className="mt-6 text-sm text-gray-500">Quick links: <button className="underline mr-2" onClick={()=>setView({name:'section',payload:'Experimental'})}>Experimental</button> <button className="underline mr-2" onClick={()=>setView({name:'section',payload:'Music'})}>Music</button> <button className="underline" onClick={()=>setView({name:'about'})}>About</button></div>
      </div>

    </div>
  );
}

// ---------- Subcomponents ----------
function TopBar({onHome,onSection,user,onSignIn,onProfile}){
  return (
    <header className="w-full border-b py-3 bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={onHome} className="text-lg font-semibold">apyx.blog</button>
          <nav className="hidden md:flex gap-3 items-center text-sm">
            <button onClick={onHome} className="hover:underline">Home</button>
            <div className="relative group">
              <button className="hover:underline">Categories</button>
              <div className="absolute left-0 mt-2 p-2 bg-white shadow rounded hidden group-hover:block" style={{transition:'300ms'}}>
                <div className="text-sm"><button onClick={()=>onSection('Experimental')}>Experimental</button></div>
                <div className="text-sm"><button onClick={()=>onSection('Short fiction/Excerpts')}>Short fiction/Excerpts</button></div>
                <div className="text-sm"><button onClick={()=>onSection('Poetry/Lyrics')}>Poetry/Lyrics</button></div>
                <div className="text-sm"><button onClick={()=>onSection('Music')}>Music</button></div>
              </div>
            </div>
            <button onClick={()=>window.scrollTo(0,0)} className="hover:underline">About</button>
            <button onClick={()=>window.scrollTo(0,0)} className="hover:underline">Contact</button>
          </nav>
        </div>
        <div>
          {user ? (
            <button onClick={onProfile} className="text-sm px-3 py-1 border rounded">Profile</button>
          ) : (
            <button onClick={onSignIn} className="text-sm px-3 py-1 border rounded">Sign in</button>
          )}
        </div>
      </div>
    </header>
  );
}

function HomeView({docs,audios,onUploadPDF,onUploadAudio,gotoSection,gotoDoc,randomDoc}){
  const rand = randomDoc;
  return (
    <div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="text-2xl font-semibold mb-3">Featured</h2>
          {rand? (
            <div className="p-4 border rounded flex gap-4 items-start">
              <div className="w-2/5">
                {rand.type==='audio' ? (
                  <div className="h-48 flex items-center justify-center bg-gray-100">Audio: {rand.title}</div>
                ) : (
                  <iframe title={rand.title} src={rand.blob + '#page=1'} className="w-full h-96 border" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium">{rand.title}</h3>
                <p className="text-sm text-gray-600">{rand.description || 'No description yet.'}</p>
                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-1 border rounded" onClick={()=>gotoDoc(rand.id)}>Open</button>
                </div>
              </div>
            </div>
          ) : (<div>No items yet. Upload a PDF or audio to get started.</div>)}
        </div>

        <div className="col-span-1">
          <h3 className="font-semibold mb-2">Categories</h3>
          <div className="grid grid-cols-2 gap-3">
            <CategoryCard onClick={()=>gotoSection('Experimental')} title="Experimental" />
            <CategoryCard onClick={()=>gotoSection('Short fiction/Excerpts')} title="Short fiction/Excerpts" />
            <CategoryCard onClick={()=>gotoSection('Poetry/Lyrics')} title="Poetry/Lyrics" />
            <CategoryCard onClick={()=>gotoSection('Music')} title="Music" />
          </div>

          <div className="mt-6">
            <h4 className="font-medium">Upload</h4>
            <div className="mt-2">
              <label className="block text-xs text-gray-600">PDF (writing)</label>
              <input type="file" accept="application/pdf" onChange={onUploadPDF} />
            </div>
            <div className="mt-2">
              <label className="block text-xs text-gray-600">Audio</label>
              <input type="file" accept="audio/*" onChange={onUploadAudio} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function CategoryCard({title,onClick}){
  return (
    <button className="p-4 border rounded text-left hover:shadow" onClick={onClick}>
      <div className="font-semibold">{title}</div>
    </button>
  );
}

function SectionView({name, items, gotoDoc, searchFn, bgImage, setBgImage}){
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  useEffect(()=> setResults(searchFn(q)), [q]);

  // show only items in category
  const filtered = results.filter(it=> it.category===name || (name==='Music' && it.type==='audio'));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">{name}</h2>
        <div>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search titles or text" className="border p-2 rounded" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-6">
        {filtered.map(it=> (
          <div key={it.id} className="p-3 border rounded cursor-pointer" onClick={()=>gotoDoc(it.id)}>
            <div className="h-48 bg-gray-100 flex items-center justify-center">{it.type==='audio' ? 'Audio' : 'PDF'}</div>
            <div className="mt-2 text-sm font-medium">{it.title}</div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="text-sm text-gray-600">Section background</h4>
        <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files[0]; if(!f) return; const u=URL.createObjectURL(f); setBgImage(u); }} />
      </div>
    </div>
  );
}

function DocumentView({id, docs, audios, onEdit, addComment, getComments, toggleFav, getFavs}){
  const item = [...docs,...audios].find(x=>x.id===id);
  const [viewMode, setViewMode] = useState('scroll'); // scroll, single, double
  const [page, setPage] = useState(1);
  if(!item) return <div>Item not found</div>;

  return (
    <div className="mt-6 grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <h2 className="text-xl font-semibold">{item.title}</h2>
        <p className="text-sm text-gray-600">{item.description}</p>

        <div className="mt-4">
          {item.type==='audio' ? (
            <AudioPlayer src={item.blob} />
          ) : (
            <div>
              <div className="flex gap-2 items-center mb-2">
                <label className="text-sm">View:</label>
                <select value={viewMode} onChange={e=>setViewMode(e.target.value)} className="border p-1">
                  <option value="scroll">Top-to-bottom (scroll)</option>
                  <option value="single">Single page</option>
                  <option value="double">Double page</option>
                </select>
              </div>

              {viewMode==='scroll' && (
                <iframe src={item.blob + '#toolbar=0'} className="w-full h-[70vh] border" />
              )}

              {viewMode!=='scroll' && (
                <div>
                  <div className="flex gap-2 mb-2">
                    <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-2 py-1 border rounded">Prev</button>
                    <div>Page {page}</div>
                    <button onClick={()=>setPage(p=>p+1)} className="px-2 py-1 border rounded">Next</button>
                  </div>
                  <iframe src={`${item.blob}#page=${page}&view=FitH`} className="w-full h-[70vh] border" />
                </div>
              )}
            </div>
          )}
        </div>

        <InteractionPanel id={item.id} addComment={addComment} getComments={getComments} toggleFav={toggleFav} getFavs={getFavs} />

      </div>

      <aside className="col-span-1">
        <h4 className="font-semibold">Overview</h4>
        <p className="text-sm text-gray-700">{item.description || 'No overview yet.'}</p>

        <div className="mt-4">
          <h5 className="font-medium">Similar works</h5>
          <div className="text-sm text-gray-600">(Auto-suggest based on category)</div>
        </div>
      </aside>
    </div>
  );
}

function InteractionPanel({id, addComment, getComments, toggleFav, getFavs}){
  const [name, setName] = useState('Anonymous');
  const [text, setText] = useState('');
  const comments = getComments(id);
  const favs = getFavs();
  const isFav = favs.includes(id);
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2">
        <button onClick={()=>toggleFav(id)} className={`px-3 py-1 border rounded ${isFav? 'bg-pink-100':''}`}>♥ Fav</button>
        <button className="px-3 py-1 border rounded">Like</button>
        <button className="px-3 py-1 border rounded">Dislike</button>
      </div>

      <div className="mt-4">
        <h5 className="font-medium">Comments</h5>
        <div className="mt-2">
          <input className="border p-1 w-48" value={name} onChange={e=>setName(e.target.value)} />
          <textarea className="block w-full border mt-2 p-2" rows={3} value={text} onChange={e=>setText(e.target.value)} />
          <div className="mt-2">
            <button onClick={()=>{ if(text.trim()){ addComment(id, name||'Anonymous', text.trim()); setText(''); } }} className="px-3 py-1 border rounded">Post</button>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {comments.map(c=> (
            <div key={c.id} className="p-2 border rounded">
              <div className="text-sm font-semibold">{c.name}</div>
              <div className="text-sm">{c.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AudioPlayer({src}){
  const audioRef = useRef();
  const canvasRef = useRef();
  useEffect(()=>{
    // draw waveform using WebAudio API
    let ctx, analyser, data;
    const audio = new Audio(src);
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const srcNode = ac.createMediaElementSource(audio);
    analyser = ac.createAnalyser();
    srcNode.connect(analyser); analyser.connect(ac.destination);
    analyser.fftSize = 2048; const bufferLength = analyser.frequencyBinCount; data = new Uint8Array(bufferLength);
    const canvas = canvasRef.current; const c = canvas.getContext('2d');
    function draw(){ analyser.getByteTimeDomainData(data); c.clearRect(0,0,canvas.width,canvas.height); c.beginPath(); const slice = canvas.width / data.length; let x=0; for(let i=0;i<data.length;i++){ const v = data[i]/128.0; const y = v * canvas.height/2; if(i===0) c.moveTo(x,y); else c.lineTo(x,y); x += slice; } c.stroke(); requestAnimationFrame(draw); }
    audio.play().catch(()=>{}); draw();
    // cleanup
    return ()=>{ audio.pause(); try{ ac.close(); }catch(e){} }
  },[src]);

  return (
    <div>
      <audio controls src={src} style={{width:'100%'}} />
      <canvas ref={canvasRef} width={800} height={100} className="w-full mt-2 border" />
    </div>
  );
}

function SimpleTextPage({title, initialText}){
  const [text, setText] = useState(initialText);
  return (
    <div className="prose max-w-none">
      <h2>{title}</h2>
      <textarea className="w-full h-96 border mt-4 p-3" value={text} onChange={e=>setText(e.target.value)} />
    </div>
  );
}

function ProfilePage({user, setUser, getFavs, docs, audios, gotoDoc}){
  const favs = getFavs();
  const favItems = [...docs,...audios].filter(i=> favs.includes(i.id));
  if(!user) return <div>Not signed in.</div>;
  return (
    <div>
      <h2 className="text-xl font-semibold">{user.name}</h2>
      <div className="mt-4">
        <label className="block text-sm">Bio</label>
        <textarea className="w-full border" rows={3} value={user.bio||''} onChange={e=>setUser({...user,bio:e.target.value})} />
      </div>

      <div className="mt-6">
        <h4>Favourites</h4>
        <div className="mt-2 space-y-2">
          {favItems.map(it=> (<div key={it.id} className="p-2 border rounded cursor-pointer" onClick={()=>gotoDoc(it.id)}>{it.title}</div>))}
        </div>
      </div>
    </div>
  );
}

// ---------- Sample data ----------
function sampleDocs(){
  return [
    { id:'doc_example1', title:'Experimental — fragment', blob:'', type:'pdf', category:'Experimental', description:'A short experimental fragment. Upload a PDF to replace.', created: Date.now(), fullText:'example text' },
  ];
}
