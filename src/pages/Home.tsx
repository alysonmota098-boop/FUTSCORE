import { Link } from "react-router-dom";
import { LayoutDashboard, MonitorPlay, Trophy, Tv } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full z-10"
      >
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Trophy className="text-slate-950 w-10 h-10" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none flex items-center gap-3">
                FutScore <span className="text-emerald-400 not-italic font-medium text-lg tracking-widest bg-emerald-400/10 px-3 py-1 rounded">STUDIO</span>
              </h1>
              <p className="text-slate-400 font-mono text-sm mt-2 tracking-widest uppercase opacity-70">Broadcast Management System v1.2</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SERVER LIVE
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Link 
            to="/control"
            id="btn-control"
            className="group relative bg-slate-900 border border-slate-800 p-10 rounded-2xl transition-all hover:bg-slate-800/80 hover:border-emerald-500/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <LayoutDashboard size={80} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center mb-6 border border-emerald-500/20">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight">Match Controller</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Gerencie placares, nomes de times, tempo de jogo e períodos através de uma interface intuitiva de broadcast.
              </p>
              <div className="flex items-center text-xs font-bold text-emerald-400 tracking-widest uppercase">
                ABRIR PAINEL {"->"}
              </div>
            </div>
          </Link>

          <Link 
            to="/overlay"
            id="btn-overlay"
            className="group relative bg-slate-900 border border-slate-800 p-10 rounded-2xl transition-all hover:bg-slate-800/80 hover:border-blue-500/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Tv size={80} />
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center mb-6 border border-blue-500/20">
                <MonitorPlay className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-3 tracking-tight">OBS Overlay</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Link de saída limpa para o OBS Studio. Use como "Navegador" com fundo transparente para sua transmissão.
              </p>
              <div className="flex items-center text-xs font-bold text-blue-400 tracking-widest uppercase">
                ABRIR OVERLAY {"->"}
              </div>
            </div>
          </Link>
        </div>

        <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <p className="text-xs font-mono text-slate-500 uppercase tracking-loose">
              Configuração recomendada: 1920x1080 no OBS Browser Source.
            </p>
          </div>
          <div className="text-[10px] font-mono text-slate-600">
            STABLE BUILD 1.2.0
          </div>
        </div>
      </motion.div>
    </div>
  );
}
