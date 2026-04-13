import React from "react";

export default function Screw({ className = "" }) {
  return (
    <div
      className={`absolute h-[30px] w-[30px] rounded-full border border-[#4f535c] bg-[linear-gradient(135deg,#a9a9a9,#7d7d7d)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.35)] ${className}`}
    >
      <div className="absolute left-1/2 top-1/2 h-[2px] w-[22px] -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] bg-[#696969]" />
    </div>
  );
}