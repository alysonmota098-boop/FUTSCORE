import { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SCOREBOARD_DOC_PATH, MatchData, defaultMatchData } from "../lib/matchService";
import { Play, Pause, RotateCcw, Timer as TimerIcon, Trophy, ChevronUp, ChevronDown, Copy, Moon, Sun, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const useMatchTimer = (data: MatchData) => {
  const [displaySeconds, setDisplaySeconds] = useState(0);

  useEffect(() => {
    let interval: any;
    
    const update = () => {
      if (data.isTimerRunning && data.timerStartedAt) {
        const elapsed = Math.floor((Date.now() - data.timerStartedAt) / 1000);
        setDisplaySeconds(data.timerValue + elapsed);
      } else {
        setDisplaySeconds(data.timerValue);
      }
    };

    update();
    if (data.isTimerRunning) {
      interval = setInterval(update, 1000);
    }
    
    return () => clearInterval(interval);
  }, [data.isTimerRunning, data.timerStartedAt, data.timerValue]);

  return displaySeconds;
};

export default function Control() {
  const [data, setData] = useState<MatchData>(defaultMatchData);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showCopied, setShowCopied] = useState(false);
  const currentTime = useMatchTimer(data);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, SCOREBOARD_DOC_PATH), (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.data() as MatchData);
      } else {
        setDoc(doc(db, SCOREBOARD_DOC_PATH), defaultMatchData);
      }
      setLoading(false);
    }, (error) => {
      console.error("Snapshot error:", error);
    });

    return () => unsub();
  }, []);

  const updateField = async (fields: Partial<MatchData>) => {
    try {
      await updateDoc(doc(db, SCOREBOARD_DOC_PATH), fields);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTimer = () => {
    if (data.isTimerRunning) {
      updateField({
        isTimerRunning: false,
        timerValue: currentTime,
        timerStartedAt: null
      });
    } else {
      updateField({
        isTimerRunning: true,
        timerStartedAt: Date.now()
      });
    }
  };

  const adjustTimer = (seconds: number) => {
    if (data.isTimerRunning) {
      updateField({
        timerStartedAt: (data.timerStartedAt || Date.now()) - (seconds * 1000)
      });
    } else {
      updateField({
        timerValue: Math.max(0, data.timerValue + seconds)
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyOverlayLink = () => {
    const url = window.location.origin + "/overlay";
    navigator.clipboard.writeText(url);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-emerald-400">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 bg-emerald-500 animate-ping rounded-full"></div>
        INITIALIZING BROADCAST STUDIO...
      </div>
    </div>
  );

  const themeClasses = isDarkMode 
    ? "bg-slate-950 text-slate-100" 
    : "bg-slate-50 text-slate-900";

  const cardClasses = isDarkMode
    ? "bg-slate-900 border-slate-800 shadow-2xl"
    : "bg-white border-slate-200 shadow-xl shadow-slate-200";

  const inputClasses = isDarkMode
    ? "bg-slate-950 border-slate-700 text-emerald-400"
    : "bg-slate-100 border-slate-300 text-emerald-600";

  return (
    <div className={`min-h-screen ${themeClasses} font-sans transition-colors duration-300`}>
      {/* Top Header */}
      <header className={`h-16 flex items-center justify-between px-6 md:px-12 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-lg' : 'bg-white border-slate-200 shadow-md'} border-b sticky top-0 z-50`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-black text-slate-900 text-sm">FS</div>
          <h1 className="text-sm md:text-lg font-bold tracking-tight uppercase">FutScore <span className="text-emerald-500 font-medium text-xs md:text-sm">Broadcast Studio</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} transition-all`}
            title={isDarkMode ? "Ligar modo claro" : "Ligar modo escuro"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>
          <button 
            onClick={copyOverlayLink}
            className={`hidden md:flex items-center gap-2 px-4 py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} rounded-md text-[10px] font-bold uppercase transition-colors border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}
          >
            <Copy size={14} /> 
            {showCopied ? "COPIADO!" : "COPIAR LINK OVERLAY"}
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-md text-[10px] font-black tracking-widest border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            LIVE SYNC
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Score Control */}
        <section className="lg:col-span-2 space-y-8">
          <div className={`${cardClasses} p-8 rounded-2xl border flex flex-col h-full`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Trophy size={14} /> Match Controller
              </h2>
              <span className="text-[10px] font-mono opacity-40 uppercase">Broadcast v1.2</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-12 items-center flex-1">
              {/* Home Team */}
              <div className="space-y-6 text-center">
                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-widest block">Mandante</label>
                <input 
                  type="text" 
                  value={data.homeTeam}
                  onChange={(e) => updateField({ homeTeam: e.target.value.toUpperCase() })}
                  className={`w-full ${inputClasses} border p-4 rounded-xl text-xl md:text-2xl font-black text-center uppercase focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
                />
                <div className="flex items-center justify-center gap-6">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateField({ homeScore: data.homeScore + 1 })}
                    className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-2xl flex items-center justify-center text-4xl font-black hover:bg-emerald-500/20 transition-all shadow-[0_5px_15px_rgba(16,185,129,0.1)]"
                  >+</motion.button>
                  <div className="text-7xl md:text-9xl font-black tracking-tighter tabular-nums min-w-[2ch]">
                    {data.homeScore.toString().padStart(2, '0')}
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateField({ homeScore: Math.max(0, data.homeScore - 1) })}
                    className="w-16 h-16 md:w-20 md:h-20 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl flex items-center justify-center text-4xl font-black hover:bg-red-500/20 transition-all shadow-[0_5px_15px_rgba(239,68,68,0.1)]"
                  >-</motion.button>
                </div>
              </div>

              <div className="text-3xl font-black opacity-10 hidden md:block">VS</div>

              {/* Away Team */}
              <div className="space-y-6 text-center">
                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-widest block">Visitante</label>
                <input 
                  type="text" 
                  value={data.awayTeam}
                  onChange={(e) => updateField({ awayTeam: e.target.value.toUpperCase() })}
                  className={`w-full ${inputClasses} border p-4 rounded-xl text-xl md:text-2xl font-black text-center uppercase focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
                />
                <div className="flex items-center justify-center gap-6">
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateField({ awayScore: data.awayScore + 1 })}
                    className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-2xl flex items-center justify-center text-4xl font-black hover:bg-emerald-500/20 transition-all shadow-[0_5px_15px_rgba(16,185,129,0.1)]"
                  >+</motion.button>
                  <div className="text-7xl md:text-9xl font-black tracking-tighter tabular-nums min-w-[2ch]">
                    {data.awayScore.toString().padStart(2, '0')}
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => updateField({ awayScore: Math.max(0, data.awayScore - 1) })}
                    className="w-16 h-16 md:w-20 md:h-20 bg-red-500/10 border border-red-500/30 text-red-500 rounded-2xl flex items-center justify-center text-4xl font-black hover:bg-red-500/20 transition-all shadow-[0_5px_15px_rgba(239,68,68,0.1)]"
                  >-</motion.button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column - Status & Timer */}
        <section className="space-y-8">
          {/* Timer Card */}
          <div className={`${cardClasses} p-8 rounded-2xl border`}>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <TimerIcon size={14} /> Global Timer
            </h2>
            
            <div className={`${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'} rounded-2xl p-6 text-center border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} mb-6 shadow-inner`}>
              <span className={`text-6xl font-mono font-black tabular-nums tracking-tight ${isDarkMode ? 'text-yellow-500' : 'text-yellow-600'}`}>
                {formatTime(currentTime)}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleToggleTimer}
                className={`w-full py-4 ${data.isTimerRunning ? 'bg-red-600 hover:bg-red-500' : 'bg-emerald-600 hover:bg-emerald-500'} rounded-xl text-xs font-black uppercase text-white shadow-lg transition-all flex items-center justify-center gap-2`}
              >
                {data.isTimerRunning ? <><Pause size={16} /> Parar Cronômetro</> : <><Play size={16} /> Iniciar Cronômetro</>}
              </motion.button>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => adjustTimer(60)}
                  className={`py-3 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} rounded-lg text-[10px] font-bold uppercase transition-colors`}
                >+1 MIN</button>
                <button 
                  onClick={() => adjustTimer(-60)}
                  className={`py-3 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} rounded-lg text-[10px] font-bold uppercase transition-colors`}
                >-1 MIN</button>
                <button 
                  onClick={() => {
                    if (confirm("Resetar cronômetro?")) updateField({ timerValue: 0, isTimerRunning: false, timerStartedAt: null });
                  }}
                  className={`col-span-2 py-3 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} rounded-lg text-[10px] font-bold uppercase transition-colors flex items-center justify-center gap-2`}
                >
                  <RotateCcw size={12} /> Resetar
                </button>
              </div>
            </div>
          </div>

          {/* Period Card */}
          <div className={`${cardClasses} p-8 rounded-2xl border`}>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Match Context</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase text-slate-400 font-bold block mb-2">Período Atual</label>
                <select 
                  value={data.period}
                  onChange={(e) => updateField({ period: e.target.value })}
                  className={`w-full ${isDarkMode ? 'bg-slate-950 border-slate-700 text-slate-100' : 'bg-slate-100 border-slate-200 text-slate-900'} p-4 rounded-xl text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-emerald-500`}
                >
                  <option>1º TEMPO</option>
                  <option>INTERVALO</option>
                  <option>2º TEMPO</option>
                  <option>PRORROGAÇÃO</option>
                  <option>PÊNALTIS</option>
                  <option>FIM DE JOGO</option>
                </select>
              </div>
              <div className={`p-4 ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-blue-500/5 border-blue-500/10'} border rounded-xl`}>
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                  Configuração OBS: Adicione uma fonte de navegador com largura: 1920 e altura: 1080.
                </p>
                <a 
                  href="/overlay" 
                  target="_blank" 
                  className="mt-2 text-[10px] text-emerald-500 font-bold uppercase flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Visualizar Overlay <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Status */}
      <footer className={`h-10 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} border-t px-12 flex items-center justify-between text-[10px] text-slate-500 font-mono tracking-widest`}>
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> SYSTEM: READY</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> DB: CONNECTED</span>
        </div>
        <div className="italic opacity-40">v1.2.0-STABLE_BUILD</div>
      </footer>
    </div>
  );
}
