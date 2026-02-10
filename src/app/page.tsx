"use client";

import Downloader from "@/components/features/Downloader";
import { motion } from "framer-motion";
import { Shield, Zap, Layout, Globe, ArrowRight, Github } from "lucide-react";

export default function Home() {
  // Register Service Worker for PWA
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
    });
  }

  const features = [
    { title: "Ultra Performance", desc: "Native streaming engine for 4x faster fetches.", icon: Zap, color: "neon-blue" },
    { title: "Privacy First", desc: "No tracking. Incognito mode built-in.", icon: Shield, color: "neon-purple" },
    { title: "Adaptive UI", desc: "Theme glows with your content dynamically.", icon: Layout, color: "neon-pink" },
    { title: "PWA Support", desc: "Install as a native application anywhere.", icon: Globe, color: "neon-blue" },
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col">
      {/* Navigation - Hidden on mobile, replaced by bottom bar */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 hidden md:flex backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="SIPHON Logo" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]" />
            <span className="font-black tracking-tighter text-xl text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">SIPHON</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-white/50">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <button className="px-4 py-2 rounded-full glass-button text-white">
              <Github className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -left-[10%] w-[600px] md:w-[800px] h-[600px] md:h-[800px] rounded-full bg-neon-purple/10 blur-[80px] md:blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] -right-[5%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] rounded-full bg-neon-blue/10 blur-[70px] md:blur-[100px]"
        />
      </div>

      <main className="relative z-10 flex-1">
        {/* Hero Section - Maximum Desktop Visibility / Standard Mobile */}
        <section className="flex flex-col items-center justify-center pt-8 md:pt-32 pb-12 md:pb-32 px-4 md:px-6 overflow-hidden">
          <div className="max-w-4xl w-full">
            {/* Mobile-only Centered Header - Logo Only */}
            <div className="md:hidden flex flex-col items-center mb-12">
              <img src="/logo.svg" alt="SIPHON Logo" className="w-24 h-24 drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6 md:mb-20 space-y-3 md:space-y-6"
            >
              <span className="inline-block px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] md:text-xs font-mono tracking-[0.2em] md:tracking-[0.3em] uppercase text-neon-blue">
                SIPHON v1.0 • Bilal Salmani
              </span>
              <h1 className="text-4xl md:text-8xl font-black tracking-tighter leading-none">
                THE FUTURE OF <br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-neon-pink to-neon-purple leading-tight pb-1">MEDIA HARVEST</span>
              </h1>
              <p className="text-white/40 text-[13px] md:text-2xl max-w-2xl mx-auto font-medium px-4 md:px-0">
                AI-powered, adaptive media harvester built for performance.
              </p>
            </motion.div>

            <div className="relative w-full scale-[0.98] md:scale-100">
              <div className="absolute -inset-4 md:-inset-10 bg-neon-blue/20 blur-3xl opacity-20 pointer-events-none" />
              <Downloader />
            </div>
          </div>
        </section>

        {/* Features Grid - Refined "Small Box" layout */}
        <section id="features" className="section-padding py-16 md:py-32 bg-black/50">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="mb-10 md:mb-16 text-center md:text-left flex flex-col items-center md:items-start">
              <h2 className="text-lg md:text-3xl font-black tracking-tight mb-2 uppercase italic text-white/50 tracking-[0.2em] relative">
                Advanced Arsenal
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-12 h-1 bg-neon-blue rounded-full" />
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 4) * 0.1 }}
                  viewport={{ once: true }}
                  className="p-5 md:p-8 rounded-2xl md:rounded-3xl glass-panel group hover:border-white/20 transition-all duration-500 flex flex-col items-center text-center md:items-start md:text-left h-full"
                >
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-${f.color}/10 flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-${f.color}/5`}>
                    <f.icon className={`w-5 h-5 md:w-7 md:h-7 text-${f.color}`} />
                  </div>
                  <h3 className="text-[11px] md:text-xl font-bold mb-1.5 md:mb-3 uppercase tracking-tighter text-white/90">{f.title}</h3>
                  <p className="text-white/30 text-[10px] md:text-[15px] leading-tight md:leading-relaxed line-clamp-2 md:line-clamp-none font-medium text-balance">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Containerized for Desktop */}
        <section id="about" className="section-padding py-24 md:py-48">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24">
            <div className="flex-1 space-y-6 md:space-y-10 text-center md:text-left">
              <h2 className="text-3xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase italic">
                Beyond Simple <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Downloads.</span>
              </h2>
              <p className="text-white/50 text-lg md:text-2xl leading-relaxed px-4 md:px-0">
                NeoLoad isn't just another script wrapper. It's a precision instrument designed for creators, analysts, and enthusiasts who demand efficiency and aesthetic excellence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 px-4 md:px-0 justify-center md:justify-start">
                <button className="px-10 py-5 rounded-2xl bg-neon-blue text-black font-black flex items-center justify-center gap-2 hover:scale-105 transition-transform active:scale-95 shadow-2xl shadow-neon-blue/40">
                  GET STARTED <ArrowRight className="w-6 h-6" />
                </button>
                <button className="px-10 py-5 rounded-2xl glass-panel font-bold hover:bg-white/10 transition-colors border-white/10">
                  DOCUMENTATION
                </button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-xl aspect-square rounded-[3rem] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/20 via-neon-purple/20 to-neon-pink/20 opacity-40 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
              <div className="absolute inset-8 rounded-[2rem] glass-panel border-white/5 flex flex-col items-center justify-center text-center p-8 md:p-14 z-10 transition-all duration-500 group-hover:border-white/20">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-3xl bg-white/5 flex items-center justify-center mb-6 md:mb-10 group-hover:bg-neon-blue/5 transition-colors">
                  <Zap className="w-10 h-10 md:w-14 md:h-14 text-neon-blue animate-pulse" />
                </div>
                <span className="text-4xl md:text-6xl font-black mb-2 md:mb-4 tracking-tighter text-white">Infinite Flow</span>
                <p className="text-neon-blue/40 uppercase text-xs md:text-sm tracking-[0.3em] font-mono">Limitless Content Extraction</p>
              </div>

              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-neon-blue/20 rounded-tl-[3rem]" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-neon-purple/20 rounded-br-[3rem]" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/80 pt-16 pb-32 md:pb-20 px-6 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10 md:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="SIPHON Logo" className="w-8 h-8 opacity-50 contrast-125" />
              <span className="font-black tracking-tighter text-xl text-glow bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple">SIPHON</span>
            </div>
            <p className="text-white/30 text-sm max-w-xs font-medium">The premium media harvester for the modern web ecosystem. Built for speed, privacy, and style.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-10 md:gap-24">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black tracking-widest uppercase text-white/20">Product</h4>
              <ul className="space-y-2 text-sm text-white/40 font-medium">
                <li><a href="#" className="hover:text-neon-blue">Features</a></li>
                <li><a href="#" className="hover:text-neon-blue">Advanced</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black tracking-widest uppercase text-white/20">Company</h4>
              <ul className="space-y-2 text-sm text-white/40 font-medium">
                <li><a href="#" className="hover:text-neon-blue">Privacy</a></li>
                <li><a href="#" className="hover:text-neon-blue">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] md:text-[10px] text-white/20 font-mono tracking-widest uppercase">
          <span>&copy; 2026 SIPHON LABORATORY BY BILAL SALMANI</span>
          <span>EST. IN THE VOID</span>
        </div>
      </footer>
    </div>
  );
}
