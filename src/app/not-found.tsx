import Link from 'next/link';
import { Home } from 'lucide-react';
import './globals.css';

export default function NotFound() {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased font-sans">
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Animated 404 Text */}
            <div className="relative mb-8">
              <h1 className="text-[10rem] md:text-[16rem] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary via-primary/80 to-primary/40 select-none drop-shadow-sm">
                404
              </h1>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-background/5 backdrop-blur-[1px] rounded-full pointer-events-none" />
            </div>

            {/* Content */}
            <div className="max-w-2xl mx-auto space-y-6 -mt-8">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
                Page not found
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                The page you're looking for seems to have wandered off. Let's get you back on track.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
                <Link
                  href="/"
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold transition-all duration-300 ease-out hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 w-full sm:w-auto"
                >
                  <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>Return Home</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
