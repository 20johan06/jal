import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  endTime?: string | null;
  serverTime?: string | null;
  status?: string;
}

export const Timer: React.FC<TimerProps> = ({ endTime, serverTime, status }) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    isExpired: boolean;
  }>({
    hours: '00',
    minutes: '00',
    seconds: '00',
    isExpired: false
  });

  useEffect(() => {
    if (!endTime || status !== 'ACTIVE') {
      setTimeLeft({ hours: '00', minutes: '00', seconds: '00', isExpired: false });
      return;
    }

    const targetDate = new Date(endTime).getTime();

    // Calculate initial clock offset relative to server
    const serverDate = serverTime ? new Date(serverTime).getTime() : Date.now();
    const localSkew = Date.now() - serverDate;

    const interval = setInterval(() => {
      const now = Date.now() - localSkew;
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00', isExpired: true });
        clearInterval(interval);
        return;
      }

      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
        isExpired: false
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, serverTime, status]);

  const isLowTime = timeLeft.hours === '00' && parseInt(timeLeft.minutes, 10) < 5 && status === 'ACTIVE';

  return (
    <div className={`p-4 rounded-lg border transition-all ${
      status === 'ACTIVE'
        ? isLowTime
          ? 'bg-hts-crimson/10 border-hts-crimson/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
          : 'bg-hts-navy-850 border-hts-green-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
        : 'bg-hts-navy-850/60 border-slate-800'
    }`}>
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-slate-400">
          <Clock className={`w-3.5 h-3.5 ${status === 'ACTIVE' ? 'text-hts-green-400' : 'text-slate-500'}`} />
          Official Event Timer
        </span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
          status === 'ACTIVE' 
            ? 'bg-hts-green-500/20 text-hts-green-400 border border-hts-green-500/30 animate-pulse'
            : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>
          {status || 'STANDBY'}
        </span>
      </div>

      <div className="flex items-center justify-center gap-2 py-2">
        <div className="text-center">
          <div className="font-mono text-3xl sm:text-4xl font-bold tracking-widest text-slate-100">
            {timeLeft.hours}
          </div>
          <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">Hours</div>
        </div>
        <span className="font-mono text-3xl sm:text-4xl font-bold text-slate-500 -mt-3">:</span>
        <div className="text-center">
          <div className="font-mono text-3xl sm:text-4xl font-bold tracking-widest text-slate-100">
            {timeLeft.minutes}
          </div>
          <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">Minutes</div>
        </div>
        <span className="font-mono text-3xl sm:text-4xl font-bold text-slate-500 -mt-3">:</span>
        <div className="text-center">
          <div className={`font-mono text-3xl sm:text-4xl font-bold tracking-widest ${
            isLowTime ? 'text-hts-crimson' : 'text-hts-green-400'
          }`}>
            {timeLeft.seconds}
          </div>
          <div className="text-[10px] uppercase font-mono text-slate-400 mt-0.5">Seconds</div>
        </div>
      </div>

      {status === 'ACTIVE' && isLowTime && (
        <div className="mt-2 flex items-center justify-center gap-1 text-[11px] font-mono text-hts-crimson">
          <AlertTriangle className="w-3.5 h-3.5" /> Final minutes remaining
        </div>
      )}

      {status !== 'ACTIVE' && (
        <div className="mt-2 text-center text-[11px] font-mono text-slate-500">
          Timer will synchronize automatically when an organizer unlocks a round.
        </div>
      )}
    </div>
  );
};
