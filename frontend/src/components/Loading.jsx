import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ message = 'Synthesizing Forest Rights Intelligence...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 space-y-4 min-h-[350px]">
      <div className="relative">
        <Loader2 className="w-10 h-10 text-[#ccd5ae] animate-spin" />
        <span className="absolute inset-0 w-10 h-10 rounded-full border-2 border-[#a3b18a]/30 animate-ping" />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#a3b18a]">{message}</p>
    </div>
  );
};

export default Loading;
