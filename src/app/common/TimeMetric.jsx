import React from "react";

export default function TimeMetric({ timeLabel }) {
  return (
    <div className="space-y-2">
      <div className="text-center text-[18px] font-bold leading-none text-white">Time</div>
      <div className="h-[42px] bg-[#47433f] p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex h-full items-center justify-center bg-[#ff3e3e] text-[16px] font-bold text-white">
          {timeLabel}
        </div>
      </div>
    </div>
  );
}