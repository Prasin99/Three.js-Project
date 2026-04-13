import React from "react";
import { clamp } from "../utils/math";

export default function MetricBar({ label, value }) {
  const safe = clamp(value, 0, 100);

  return (
    <div className="space-y-2">
      <div className="text-center text-[18px] font-bold leading-none text-white">{label}</div>
      <div className="h-[42px] bg-[#47433f] p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="relative h-full w-full overflow-hidden bg-[#47433f]">
          <div
            className="absolute inset-0 origin-left bg-[#1d86ff] transition-transform duration-100 ease-linear"
            style={{ transform: `scaleX(${safe / 100})` }}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[16px] font-bold text-white">
            {Math.round(safe)} %
          </div>
        </div>
      </div>
    </div>
  );
}