import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { SCOREBOARD_DOC_PATH, MatchData, defaultMatchData } from "../lib/matchService";
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

export default function Overlay() {
  const [data, setData] = useState<MatchData>(defaultMatchData);
  const currentTime = useMatchTimer(data);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, SCOREBOARD_DOC_PATH), (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.data() as MatchData);
      }
    });

    return () => unsub();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-screen overflow-hidden pointer-events-none p-12 font-sans select-none flex justify-center items-start">
      {/* Professional TV Scoreboard Bug */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="flex items-stretch h-14 bg-slate-900/95 backdrop-blur-md rounded-lg overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.6)] border border-white/10"
      >
        {/* Timer Box */}
        <div className="bg-yellow-500 text-slate-950 px-6 flex flex-col justify-center items-center font-black min-w-[100px] border-r border-black/10">
          <span className="text-2xl font-mono tabular-nums leading-none tracking-tighter">
            {formatTime(currentTime)}
          </span>
          <span className="text-[10px] uppercase leading-none mt-1 tracking-widest text-slate-950/80">
            {data.period}
          </span>
        </div>

        {/* Home Team Section */}
        <div className="flex items-center">
          <div className="px-5 py-3 h-full flex items-center justify-center bg-slate-800/50">
             <span className="text-xl font-black text-white italic tracking-tighter drop-shadow-sm uppercase">
               {data.homeTeam || "HOME"}
             </span>
          </div>
          <div className="w-14 h-full bg-slate-950 flex items-center justify-center text-3xl font-black text-emerald-400 font-mono tracking-tighter tabular-nums border-x border-white/5">
             <AnimatePresence mode="wait">
                <motion.span
                  key={data.homeScore}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="inline-block"
                >
                  {data.homeScore}
                </motion.span>
             </AnimatePresence>
          </div>
        </div>

        {/* Vs / Separator */}
        <div className="w-px h-full bg-white/10"></div>

        {/* Away Team Section */}
        <div className="flex items-center">
          <div className="w-14 h-full bg-slate-950 flex items-center justify-center text-3xl font-black text-blue-400 font-mono tracking-tighter tabular-nums border-x border-white/5">
             <AnimatePresence mode="wait">
                <motion.span
                  key={data.awayScore}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="inline-block"
                >
                  {data.awayScore}
                </motion.span>
             </AnimatePresence>
          </div>
          <div className="px-5 py-3 h-full flex items-center justify-center bg-slate-800/50">
             <span className="text-xl font-black text-white italic tracking-tighter drop-shadow-sm uppercase">
               {data.awayTeam || "AWAY"}
             </span>
          </div>
        </div>

        {/* Decorative Strip */}
        <div className="w-1 bg-gradient-to-b from-emerald-400 to-blue-500 h-full"></div>
      </motion.div>
    </div>
  );
}
