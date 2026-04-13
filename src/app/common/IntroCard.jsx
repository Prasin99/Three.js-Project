import React from "react";

export default function IntroCard({ icon, title, text }) {
  return (
    <div className="rounded-[14px] border border-[#d8e0ea] bg-white px-8 py-8 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <div className="mb-4 flex items-center gap-3 text-[#163f73]">
        <div>{icon}</div>
        <div className="text-[18px] font-semibold">{title}</div>
      </div>
      <div className="max-w-[430px] text-[17px] leading-8 text-[#3c5e87]">{text}</div>
    </div>
  );
}