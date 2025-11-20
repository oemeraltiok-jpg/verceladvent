import React, { useState, useEffect, useRef } from 'react';
import { Lock, Gift, Smile, CheckCircle, X, Snowflake, Sparkles, Star, User as UserIcon, Users, KeyRound } from 'lucide-react';
import { supabase } from './supabaseClient';
import { jokes, SOUNDS } from './constants';
import { Joke, User, DoorStats } from './types';

// --- Configuration ---
const GOOGLE_DRIVE_IMAGE_ID = "1E992lg-EHo5a-8eMaPOmMwTKUInHCUfd"; 
const LOGO_URL = `https://drive.google.com/thumbnail?id=${GOOGLE_DRIVE_IMAGE_ID}&sz=w1000`;

// Static Gatekeeper Credentials
const GATE_USER = "CRM-Tech";
const GATE_PASS = "Start2006!";
const GATE_STORAGE_KEY = "crm_gate_unlocked";

// --- Helper Components ---

const Snow = () => {
  const [flakes, setFlakes] = useState<{ id: number, left: string, animationDuration: string, opacity: number }[]>([]);

  useEffect(() => {
    const newFlakes = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 3 + 5}s`,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setFlakes(newFlakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-[-10px] bg-white rounded-full animate-pulse"
          style={{
            left: flake.left,
            width: '6px',
            height: '6px',
            opacity: flake.opacity,
            animation: `fall ${flake.animationDuration} linear infinite`
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh); }
          100% { transform: translateY(110vh); }
        }
      `}</style>
    </div>
  );
};

// --- Gatekeeper Component ---

interface GatekeeperScreenProps {
    onUnlock: () => void;
}

const GatekeeperScreen: React.FC<GatekeeperScreenProps> = ({ onUnlock }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === GATE_USER && password === GATE_PASS) {
            localStorage.setItem(GATE_STORAGE_KEY, 'true');
            onUnlock();
        } else {
            setError("Zugriff verweigert. Falsche Daten.");
            setPassword("");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 relative z-10">
            <div className="mb-8 relative z-20 transform hover:scale-105 transition-transform duration-500">
                <img 
                    src={LOGO_URL} 
                    alt="Logo" 
                    className="w-48 md:w-64 h-auto drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
            </div>

            <div className="animate-float bg-white/95 backdrop-blur-xl border-8 border-christmas-red rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-lg text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-red" />
                
                <h1 className="relative z-10 font-display text-3xl font-bold mb-2 text-christmas-red">Zugriffskontrolle</h1>
                <p className="relative z-10 font-body text-gray-600 text-sm mb-6">Bitte authentifiziere dich für den Team-Bereich.</p>

                {error && <div className="relative z-10 mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200 animate-[shake_0.5s_ease-in-out]">{error}</div>}

                <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4 text-left">
                    <div className="relative group/input">
                        <UserIcon className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Team-Benutzername" 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 text-christmas-darkGreen font-body text-base rounded-xl border-2 border-gray-200 focus:border-christmas-gold focus:bg-white outline-none placeholder:text-gray-400 transition-all" 
                            required 
                        />
                    </div>
                    <div className="relative group/input">
                        <KeyRound className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Team-Passwort" 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 text-christmas-darkGreen font-body text-base rounded-xl border-2 border-gray-200 focus:border-christmas-gold focus:bg-white outline-none placeholder:text-gray-400 transition-all" 
                            required 
                        />
                    </div>

                    <button type="submit" className="mt-4 bg-christmas-green text-white font-display font-bold text-xl py-3 px-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all hover:bg-christmas-darkGreen">
                        Zugang freischalten
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Auth & App Components ---

interface AuthScreenProps {
    onLogin: (u: string, p: string) => Promise<{success: boolean; message?: string}>;
    onRegister: (u: string, p: string, f: string, l: string) => Promise<{success: boolean; message?: string}>;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister }) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setLoading(true);

        try {
            if (mode === 'login') {
                const res = await onLogin(username, password);
                if (!res.success) setError(res.message || "Login fehlgeschlagen");
            } else {
                if (!firstName || !lastName || !username || !password) {
                    setError("Bitte alle Felder ausfüllen.");
                    setLoading(false);
                    return;
                }
                const res = await onRegister(username, password, firstName, lastName);
                if (res.success) {
                    setSuccessMsg("Registrierung erfolgreich! Du kannst dich jetzt anmelden.");
                    setMode('login');
                    setPassword("");
                } else {
                    setError(res.message || "Registrierung fehlgeschlagen");
                }
            }
        } catch (err) {
            setError("Ein unerwarteter Fehler ist aufgetreten.");
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode: 'login' | 'register') => {
        setMode(newMode);
        setError(null);
        setSuccessMsg(null);
        setPassword("");
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 relative z-10">
            
            {/* LOGO POSITION - Über der Box */}
            <div className="mb-8 relative z-20 transform hover:scale-105 transition-transform duration-500">
                <img 
                    src={LOGO_URL} 
                    alt="Logo" 
                    className="w-48 md:w-64 h-auto drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                        // Fallback, falls das Bild gar nicht lädt (versteckt das kaputte Icon)
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            </div>

            <div className="animate-float bg-white/95 backdrop-blur-xl border-8 border-christmas-red rounded-3xl p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] w-full max-w-lg text-center relative overflow-hidden group">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-christmas-red via-christmas-gold to-christmas-red" />
                <div className="absolute -right-10 -top-10 text-christmas-gold/10 transform rotate-12">
                    <Snowflake size={150} />
                </div>

                <p className="relative z-10 font-body text-gray-600 text-sm font-bold uppercase tracking-widest mb-2">CRM Tech Team präsentiert</p>
                <h1 className="relative z-10 font-display text-4xl font-bold mb-8 text-christmas-red drop-shadow-sm">Adventskalender</h1>

                {/* Toggle */}
                <div className="relative z-10 flex mb-6 bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => switchMode('login')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-christmas-red shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>Anmelden</button>
                    <button onClick={() => switchMode('register')} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'register' ? 'bg-white text-christmas-red shadow-md' : 'text-gray-500 hover:text-gray-700'}`}>Registrieren</button>
                </div>

                {error && <div className="relative z-10 mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">{error}</div>}
                {successMsg && <div className="relative z-10 mb-4 p-3 bg-green-100 text-green-700 text-sm rounded-lg border border-green-200 flex items-center justify-center gap-2"><CheckCircle size={16} /> {successMsg}</div>}

                <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4 text-left">
                    {mode === 'register' && (
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Vorname" className="w-full px-4 py-3 bg-gray-50 text-christmas-darkGreen font-body text-base rounded-xl border-2 border-gray-200 focus:border-christmas-gold focus:bg-white outline-none placeholder:text-gray-400 transition-all" required />
                            </div>
                            <div className="relative flex-1">
                                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nachname" className="w-full px-4 py-3 bg-gray-50 text-christmas-darkGreen font-body text-base rounded-xl border-2 border-gray-200 focus:border-christmas-gold focus:bg-white outline-none placeholder:text-gray-400 transition-all" required />
                            </div>
                        </div>
                    )}
                    <div className="relative group/input">
                        <UserIcon className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Benutzername" className="w-full pl-12 pr-4 py-3 bg-gray-50 text-christmas-darkGreen font-body text-base rounded-xl border-2 border-gray-200 focus:border-christmas-gold focus:bg-white outline-none placeholder:text-gray-400 transition-all" required />
                    </div>
                    <div className="relative group/input">
                        <Lock className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passwort" className="w-full pl-12 pr-4 py-3 bg-gray-50 text-christmas-darkGreen font-body text-base rounded-xl border-2 border-gray-200 focus:border-christmas-gold focus:bg-white outline-none placeholder:text-gray-400 transition-all" required />
                        {mode === 'login' && <Sparkles className="absolute right-4 top-3.5 text-christmas-gold animate-pulse w-5 h-5 pointer-events-none" />}
                    </div>

                    <button type="submit" disabled={loading} className="mt-4 bg-gradient-to-r from-christmas-gold to-yellow-400 text-christmas-red font-display font-bold text-xl py-3 px-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? "Lade..." : (mode === 'login' ? "Einloggen" : "Registrieren")}
                    </button>
                </form>

                <p className="relative z-10 mt-6 text-xs text-gray-400 font-body">
                    {mode === 'login' ? "Melde dich an, um deine Türchen zu öffnen." : "Erstelle ein Konto, um teilzunehmen."}
                </p>
            </div>
        </div>
    );
};

interface DoorProps {
    day: number;
    isOpen: boolean;
    isLocked: boolean;
    onOpen: (day: number) => void;
}

const Door: React.FC<DoorProps> = ({ day, isOpen, isLocked, onOpen }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleClick = () => {
        if (isLocked && !isOpen) return;
        
        // If already open, allow clicking to show the joke again (modal)
        if (isOpen) {
            onOpen(day);
            return;
        }

        // If closed, play sound and open
        if (!audioRef.current) {
            audioRef.current = new Audio(SOUNDS.bell);
            audioRef.current.volume = 0.6;
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.log("Audio error", e));
        onOpen(day);
    };

    return (
      <div
        onClick={handleClick}
        className={`
        relative w-full aspect-[4/5] group perspective-1000
        ${(isLocked && !isOpen) ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
      >
        {/* Door Card (Front/Back) */}
        <div className={`
        relative w-full h-full transition-transform duration-1000 transform-style-3d origin-left
        ${isOpen ? '[transform:rotateY(-110deg)]' : '[transform:rotateY(0deg)]'}
      `}>
          {/* FRONT */}
          <div className={`
          absolute inset-0 backface-hidden
          bg-christmas-red border-2 border-dashed border-christmas-gold rounded-lg shadow-lg
          flex flex-col items-center justify-center overflow-hidden
          ${(!isOpen && !isLocked) ? 'group-hover:brightness-110 group-hover:shadow-2xl transition-all' : ''}
          ${isLocked ? 'opacity-90' : ''}
        `}>
            <div className="absolute inset-0 opacity-30 bg-felt-pattern mix-blend-multiply pointer-events-none"></div>
            {/* Ribbon */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-full bg-christmas-redLight/30"></div>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-4 bg-christmas-redLight/30"></div>

            <div className="z-10 flex flex-col items-center transform transition-transform duration-300 group-hover:scale-110">
              <span className="font-display text-5xl font-bold text-christmas-gold drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">{day}</span>
              <div className="mt-2 text-christmas-gold/90 drop-shadow-md">
                {isLocked ? <Lock size={20} /> : <Gift size={24} className="animate-bounce" />}
              </div>
            </div>
          </div>

          {/* BACK (Visible when open) */}
          <div className={`
          absolute inset-0 backface-hidden [transform:rotateY(180deg)]
          bg-christmas-redLight border-2 border-christmas-gold rounded-lg shadow-inner
          flex items-center justify-center
        `}>
             <div className="absolute inset-0 opacity-30 bg-felt-pattern mix-blend-multiply pointer-events-none"></div>
          </div>
        </div>

        {/* Inside Content (Behind the door) */}
        <div className={`
        absolute inset-0 -z-10
        bg-christmas-darkGreen rounded-lg shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]
        border-2 border-christmas-gold/20 flex items-center justify-center
      `}>
           {isOpen ? (
               <span className="font-display text-white/50 text-lg animate-pulse">Offen</span>
           ) : (
               <div className="w-full h-full flex items-center justify-center bg-black/20" />
           )}
        </div>
      </div>
    );
};

interface CalendarScreenProps {
    user: User;
    openedDoors: Record<number, number>;
    canOpenDoor: (day: number) => boolean;
    onDoorOpen: (day: number) => void;
    onLogout: () => void;
    selectedDayStats: DoorStats;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ user, openedDoors, canOpenDoor, onDoorOpen, onLogout, selectedDayStats }) => {
    const days = Array.from({ length: 24 }, (_, i) => i + 1);

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto p-4 z-10 relative mb-10">
            <header className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-christmas-green backdrop-blur-md p-6 rounded-2xl shadow-2xl border-b-8 border-christmas-gold transform hover:scale-[1.005] transition-transform duration-500 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-felt-pattern mix-blend-overlay pointer-events-none"></div>
                
                <div className="flex items-center gap-6 z-10">
                    {/* Logo added back here as well for consistency */}
                     <div className="w-24 h-24 bg-white/10 border-[3px] border-christmas-gold/50 flex items-center justify-center relative overflow-hidden shadow-lg shrink-0 rounded-xl backdrop-blur-sm">
                        <img 
                            src={LOGO_URL} 
                            alt="Logo" 
                            className="w-full h-full object-contain p-1"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>

                    <div className="flex flex-col">
                        <h1 className="font-display text-3xl md:text-4xl text-christmas-gold font-bold drop-shadow-md">CRM Tech - Adventskalender</h1>
                        <div className="flex items-center gap-2 text-christmas-snow font-body">
                            <span>Hallo</span>
                            <span className="font-bold text-christmas-darkGreen bg-christmas-gold px-3 py-0.5 rounded-full shadow-sm">
                                {user.firstName} {user.lastName}
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={onLogout} className="z-10 px-8 py-3 rounded-full border-2 border-christmas-gold text-christmas-gold font-bold hover:bg-christmas-gold hover:text-christmas-darkGreen transition-all duration-300 uppercase text-xs tracking-widest shadow-md hover:shadow-lg active:scale-95">
                    Abmelden
                </button>
            </header>

            <div className="w-full relative perspective-1000 mb-12">
                <div className="bg-[#5d4037] p-4 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                    <div className="absolute inset-0 opacity-40 bg-wood-pattern pointer-events-none"></div>
                    <div className="bg-christmas-green rounded-[2rem] p-6 md:p-10 border-[6px] border-christmas-gold/50 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] relative">
                        <div className="absolute inset-0 opacity-20 bg-felt-pattern mix-blend-overlay pointer-events-none rounded-[2rem]"></div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-8 relative z-10">
                            {days.map(day => {
                                const locked = !canOpenDoor(day);
                                return (
                                    <Door
                                        key={day}
                                        day={day}
                                        isOpen={!!openedDoors[day]}
                                        isLocked={locked}
                                        onOpen={onDoorOpen}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

             {/* Stats Section */}
             <div className="w-full max-w-3xl animate-float">
                <div className="bg-white/90 backdrop-blur rounded-xl border-4 border-christmas-gold p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-christmas-red"></div>
                    <div className="flex items-center gap-3 mb-4 border-b border-gray-200 pb-3">
                        <div className="bg-christmas-red p-2 rounded-full text-white">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="font-display text-2xl text-christmas-red font-bold leading-none">Türchen {selectedDayStats.day}</h3>
                            <p className="text-xs text-gray-500 font-body uppercase tracking-wider font-bold">Hall of Fame</p>
                        </div>
                    </div>
                    
                    {selectedDayStats.users.length === 0 ? (
                         <div className="text-center py-4 text-gray-500 italic font-body">Noch niemand hat dieses Türchen geöffnet. Sei der Erste!</div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {selectedDayStats.users.map((u) => (
                                <div key={u.id + selectedDayStats.day} className="flex items-center gap-2 bg-christmas-green/10 border border-christmas-green/20 text-christmas-darkGreen px-3 py-1.5 rounded-full font-body text-sm font-semibold">
                                     <div className="w-6 h-6 bg-christmas-green text-christmas-gold rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                        {u.firstName[0]}{u.lastName[0]}
                                     </div>
                                     {u.firstName} {u.lastName}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <footer className="mt-12 text-white/90 font-body text-center pb-8 drop-shadow-lg">
                <p className="text-lg mb-2 font-display">Frohe Weihnachten & Happy New Year</p>
                <p className="text-sm opacity-75">wünscht das CRM Tech Team</p>
            </footer>
        </div>
    );
};

const JokeModal = ({ joke, onClose, isOpen }: { joke: Joke | null, onClose: () => void, isOpen: boolean }) => {
    if (!isOpen || !joke) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
            <div className="relative bg-christmas-snow text-christmas-red border-4 border-christmas-gold rounded-2xl p-8 w-full max-w-lg shadow-2xl transform transition-all scale-100 animate-[shake_0.5s_ease-in-out]">
                <button onClick={onClose} className="absolute top-4 right-4 text-christmas-red/50 hover:text-christmas-red transition-colors">
                    <X size={24} />
                </button>
                
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4">
                        <Star className="w-12 h-12 text-christmas-gold fill-current animate-spin-slow" />
                    </div>
                    <h2 className="font-display text-3xl font-bold mb-6 text-christmas-redLight">Ho Ho Ho!</h2>
                    
                    <div className="prose prose-lg font-body leading-relaxed mb-8 text-gray-800">
                        <p className="text-xl font-bold">{joke.text}</p>
                    </div>

                    <button onClick={onClose} className="flex items-center gap-2 bg-christmas-green text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-green-800 transition-colors">
                        <Smile size={20} />
                        <span>Hahaha, der war gut!</span>
                    </button>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-christmas-gold rounded-tl-lg"></div>
                <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-christmas-gold rounded-br-lg"></div>
            </div>
        </div>
    );
};

// --- Main App ---

const App = () => {
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [openedDoors, setOpenedDoors] = useState<Record<number, number>>({});
  const [currentJoke, setCurrentJoke] = useState<Joke | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayStats, setSelectedDayStats] = useState<DoorStats>({ day: new Date().getDate(), users: [] });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Start Date Configuration (Set to past for testing, or current date)
  const START_DATE = new Date("2025-11-30T00:00:00");

  useEffect(() => {
      // Check Gatekeeper Status
      const gateStatus = localStorage.getItem(GATE_STORAGE_KEY);
      if (gateStatus === 'true') {
          setIsGateOpen(true);
      }

      // Check User Session
      const checkSession = async () => {
          const storedUserId = localStorage.getItem('team_advent_user_id');
          if (storedUserId) {
              // Simplified session check (In real app, verify token)
              const { data: userData, error } = await supabase
                  .from('app_users')
                  .select('*')
                  .eq('id', storedUserId)
                  .single();

              if (userData && !error) {
                  setUser({
                      id: userData.id,
                      username: userData.username,
                      firstName: userData.first_name,
                      lastName: userData.last_name
                  });
                  loadOpenedDoors(userData.id);
              } else {
                  localStorage.removeItem('team_advent_user_id');
              }
          }
      };
      checkSession();
  }, []);

  const loadOpenedDoors = async (userId: string) => {
      const { data } = await supabase
          .from('door_opens')
          .select('day, joke_id')
          .eq('user_id', userId);
      
      if (data) {
          const opened: Record<number, number> = {};
          data.forEach((d: any) => {
              opened[d.day] = d.joke_id; // Store ID instead of boolean if needed later
          });
          setOpenedDoors(opened);
      }
  };

  // Realtime Stats for the current selected day
  useEffect(() => {
    const fetchStats = async () => {
        if (!selectedDayStats.day) return;
        
        const { data, error } = await supabase
            .from('door_opens')
            .select(`
                user_id,
                app_users (
                    id,
                    first_name,
                    last_name
                )
            `)
            .eq('day', selectedDayStats.day);

        if (data && !error) {
            const users = data.map((entry: any) => ({
                id: entry.app_users.id,
                username: 'hidden',
                firstName: entry.app_users.first_name,
                lastName: entry.app_users.last_name
            }));
            // Remove duplicates based on ID
            const uniqueUsers = Array.from(new Map(users.map((u:any) => [u.id, u])).values());
            setSelectedDayStats(prev => ({ ...prev, users: uniqueUsers as any }));
        }
    };

    fetchStats();

    // Subscribe to changes
    const channel = supabase.channel('public:door_opens')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'door_opens', filter: `day=eq.${selectedDayStats.day}` }, () => {
        fetchStats();
    })
    .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
  }, [selectedDayStats.day]);


  const handleRegister = async (u: string, p: string, f: string, l: string) => {
      // Check if user exists
      const { data: existing } = await supabase.from('app_users').select('id').eq('username', u).single();
      if (existing) return { success: false, message: "Benutzername bereits vergeben!" };

      const { error } = await supabase.from('app_users').insert({
          username: u,
          password: p, // Note: In prod, Hash this!
          first_name: f,
          last_name: l
      });

      if (error) return { success: false, message: error.message };
      return { success: true };
  };

  const handleLogin = async (u: string, p: string) => {
      const { data: userData, error } = await supabase
          .from('app_users')
          .select('*')
          .eq('username', u)
          .eq('password', p) // Note: In prod, check Hash!
          .single();

      if (userData && !error) {
          const userObj = {
              id: userData.id,
              username: userData.username,
              firstName: userData.first_name,
              lastName: userData.last_name
          };
          setUser(userObj);
          localStorage.setItem('team_advent_user_id', userObj.id);
          loadOpenedDoors(userObj.id);
          return { success: true };
      }
      return { success: false, message: "Benutzername oder Passwort falsch." };
  };

  const handleLogout = () => {
      localStorage.removeItem('team_advent_user_id');
      setUser(null);
      setOpenedDoors({});
  };

  // Admin/Test bypass
  const isTester = (u?: User) => u?.username.toLowerCase() === 'test';

  const canOpenDoor = (day: number) => {
      if (isTester(user!)) return true;
      
      const now = new Date();
      const doorDate = new Date(START_DATE);
      doorDate.setDate(doorDate.getDate() + (day - 1));
      doorDate.setHours(0, 0, 0, 0);
      
      return now >= doorDate;
  };

  const getDoorDateString = (day: number) => {
      const doorDate = new Date(START_DATE);
      doorDate.setDate(doorDate.getDate() + (day - 1));
      return doorDate.toLocaleDateString('de-DE');
  };

  const handleDoorOpen = async (day: number) => {
      if (!user) return;

      // Update stats view immediately to show stats for this door
      setSelectedDayStats(prev => ({ ...prev, day }));

      if (!canOpenDoor(day)) {
          alert(`Geduld! Dieses Türchen öffnet sich erst am ${getDoorDateString(day)}.`);
          return;
      }

      // Check if already opened
      if (openedDoors[day]) {
           const storedJokeId = openedDoors[day];
           const joke = jokes.find(j => j.id === storedJokeId);
           if (joke) {
               setCurrentJoke(joke);
               setIsModalOpen(true);
           }
           return;
      }

      // New Open
      const usedJokeIds = Object.values(openedDoors);
      const availableJokes = jokes.filter(j => !usedJokeIds.includes(j.id));
      const pool = availableJokes.length > 0 ? availableJokes : jokes;
      const randomJoke = pool[Math.floor(Math.random() * pool.length)];

      const { error } = await supabase.from('door_opens').insert({
          user_id: user.id,
          day: day,
          joke_id: randomJoke.id
      });

      if (error) {
          alert("Fehler beim Speichern. Bitte versuche es erneut.");
      } else {
          setOpenedDoors(prev => ({ ...prev, [day]: randomJoke.id }));
          setCurrentJoke(randomJoke);
          setIsModalOpen(true);
      }
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setCurrentJoke(null);
      if (!audioRef.current) {
        audioRef.current = new Audio(SOUNDS.laugh);
        audioRef.current.volume = 0.5;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio error", e));
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-christmas-red via-christmas-redLight to-christmas-red relative selection:bg-christmas-gold selection:text-christmas-red overflow-x-hidden">
      <Snow />
      <main className="relative z-10 min-h-screen flex flex-col">
        {!isGateOpen ? (
            <GatekeeperScreen onUnlock={() => setIsGateOpen(true)} />
        ) : (
            user ? (
                <CalendarScreen 
                    user={user} 
                    openedDoors={openedDoors} 
                    canOpenDoor={canOpenDoor} 
                    onDoorOpen={handleDoorOpen}
                    onLogout={handleLogout}
                    selectedDayStats={selectedDayStats}
                />
            ) : (
                <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />
            )
        )}
      </main>
      <JokeModal isOpen={isModalOpen} joke={currentJoke} onClose={handleCloseModal} />
    </div>
  );
};

export default App;