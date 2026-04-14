// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { ArrowLeft, BellRing, Expand, Pencil, Radio, Target } from "lucide-react";

// import { clamp, rand } from "./app/utils/math";
// import Screw from "./app/common/Screw";
// import MetricBar from "./app/common/MetricBar";
// import TimeMetric from "./app/common/TimeMetric";
// import IntroCard from "./app/common/IntroCard";

// import HorizonTile from "./app/tiles/HorizonTile";
// import AlertLightsTile from "./app/tiles/AlertLightsTile";
// import TanksTile from "./app/tiles/TanksTile";
// import CallsignTile from "./app/tiles/CallsignTile";

// export default function MultitaskingTestCompetitorStyle() {
//   const [screen, setScreen] = useState("live");
//   const [running, setRunning] = useState(true);
//   const [timeLeft, setTimeLeft] = useState(9 * 60 + 52);
//   const [horizonScore, setHorizonScore] = useState(0);
//   const [lightsScore, setLightsScore] = useState(52);
//   const [callsignScore, setCallsignScore] = useState(50);
//   const [feedback, setFeedback] = useState({ text: "", tone: "green" });

//   const [lightsEvent, setLightsEvent] = useState({ row: 0, col: 0, color: "blue", active: false });
//   const [pulse, setPulse] = useState(null);

//   const [tanks, setTanks] = useState([78, 100, 100]);
//   //const [activeTankIndex, setActiveTankIndex] = useState(0);
//   //const [refillingTankIndex, setRefillingTankIndex] = useState(null);
//   const [activeTankIndexes, setActiveTankIndexes] = useState([0]);
//   const [refillingTankIndexes, setRefillingTankIndexes] = useState([]);
//   const [tankBlinkOn, setTankBlinkOn] = useState(true);
//   //const nextTankStartRef = useRef(Date.now() + 1800);
//   const nextTankStartRef = useRef(Date.now() + 1800);
//   const secondTankThresholdRef = useRef(rand(45, 55));

//   const timeLabel = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`;

//   // const speakLevelCall = (value) => {
//   //   if (typeof window === "undefined" || !("speechSynthesis" in window)) {
//   //     return false;
//   //   }

//   //   pendingSpeechRef.current = value;

//   //   if (!speechUnlockedRef.current) {
//   //     setPrompt("Click once to enable audio");
//   //     return false;
//   //   }

//   //   const synth = window.speechSynthesis;
//   //   const speakCallsign = callsign.split("").join(" ");
//   //   const speakDigits = value.split("").join(" ");

//   //   synth.cancel();
//   //   synth.resume();

//   //   const utterance = new SpeechSynthesisUtterance(`${speakCallsign}, new level, ${speakDigits}`);
//   //   const voices = voicesRef.current.length ? voicesRef.current : synth.getVoices();
//   //   const preferredVoice =
//   //     voices.find((voice) => /en/i.test(voice.lang) && /(Google|Samantha|Daniel|Karen|Moira|Alex)/i.test(voice.name)) ||
//   //     voices.find((voice) => /en/i.test(voice.lang)) ||
//   //     null;

//   //   if (preferredVoice) {
//   //     utterance.voice = preferredVoice;
//   //     utterance.lang = preferredVoice.lang;
//   //   } else {
//   //     utterance.lang = "en-US";
//   //   }

//   //   utterance.rate = 0.82;
//   //   utterance.pitch = 1;
//   //   utterance.volume = 1;
//   //   utterance.onstart = () => {
//   //     setPrompt("Listen and enter the level");
//   //   };
//   //   utterance.onend = () => {
//   //     if (pendingSpeechRef.current === value) {
//   //       pendingSpeechRef.current = null;
//   //     }
//   //   };

//   //   setTimeout(() => {
//   //     synth.speak(utterance);
//   //   }, 60);

//   //   return true;
//   // };

//   useEffect(() => {
//     if (screen !== "live" || !running) return;
//     const timer = setInterval(() => {
//       setTimeLeft((prev) => Math.max(prev - 1, 0));
//     }, 1000);
//     return () => clearInterval(timer);
//   }, [screen, running]);

//   useEffect(() => {
//     if (screen !== "live" || !running) return;
//     // REMOVE entire tankLoop setInterval body and its dependency array:
//   //   const tankLoop = setInterval(() => {
//   //     setTanks((prev) => {
//   //       const next = [...prev];

//   //       if (refillingTankIndex !== null) {
//   //         const refillSpeed = refillingTankIndex === 0 ? 7.5 : refillingTankIndex === 1 ? 7.0 : 7.25;
//   //         next[refillingTankIndex] = clamp(next[refillingTankIndex] + refillSpeed, 0, 100);

//   //         if (next[refillingTankIndex] >= 100) {
//   //           next[refillingTankIndex] = 100;
//   //           setRefillingTankIndex(null);
//   //           setActiveTankIndex(null);
//   //           nextTankStartRef.current = Date.now() + rand(900, 2400);
//   //         }

//   //         return next;
//   //       }

//   //       if (activeTankIndex === null) {
//   //         if (Date.now() >= nextTankStartRef.current) {
//   //           setActiveTankIndex(Math.floor(Math.random() * 3));
//   //         }
//   //         return next;
//   //       }

//   //       const drainSpeed = activeTankIndex === 0 ? 0.72 : activeTankIndex === 1 ? 0.62 : 0.67;
//   //       next[activeTankIndex] = clamp(next[activeTankIndex] - drainSpeed - rand(0.01, 0.08), 0, 100);
//   //       return next;
//   //     });
//   //   }, 120);

//   //   return () => clearInterval(tankLoop);
//   // }, [screen, running, activeTankIndex, refillingTankIndex]);
  
//   const tankLoop = setInterval(() => {
//   setTanks((prev) => {
//     const next = [...prev];

//     if (refillingTankIndexes.length > 0) {
//       refillingTankIndexes.forEach((tankIndex) => {
//         const refillSpeed = tankIndex === 0 ? 7.5 : tankIndex === 1 ? 7.0 : 7.25;
//         next[tankIndex] = clamp(next[tankIndex] + refillSpeed, 0, 100);
//       });

//       const completedIndexes = refillingTankIndexes.filter((tankIndex) => next[tankIndex] >= 100);
//       if (completedIndexes.length > 0) {
//         completedIndexes.forEach((tankIndex) => { next[tankIndex] = 100; });
//         setRefillingTankIndexes((prev) => prev.filter((i) => !completedIndexes.includes(i)));
//         setActiveTankIndexes((prev) => {
//           const remaining = prev.filter((i) => !completedIndexes.includes(i));
//           if (remaining.length === 0) {
//             nextTankStartRef.current = Date.now() + rand(900, 2400);
//             secondTankThresholdRef.current = rand(45, 55);
//           }
//           return remaining;
//         });
//       }
//     }

//     if (activeTankIndexes.length === 0 && refillingTankIndexes.length === 0) {
//       if (Date.now() >= nextTankStartRef.current) {
//         setActiveTankIndexes([Math.floor(Math.random() * 3)]);
//         secondTankThresholdRef.current = rand(45, 55);
//       }
//       return next;
//     }

//     const drainingIndexes = activeTankIndexes.filter((i) => !refillingTankIndexes.includes(i));
//     drainingIndexes.forEach((tankIndex) => {
//       const drainSpeed = tankIndex === 0 ? 0.72 : tankIndex === 1 ? 0.62 : 0.67;
//       next[tankIndex] = clamp(next[tankIndex] - drainSpeed - rand(0.01, 0.08), 0, 100);
//     });

//     const belowThreshold = drainingIndexes.some((i) => next[i] < secondTankThresholdRef.current);
//     const availableIndexes = [0, 1, 2].filter(
//       (i) => !activeTankIndexes.includes(i) && !refillingTankIndexes.includes(i)
//     );
//     if (belowThreshold && activeTankIndexes.length < 2 && availableIndexes.length > 0 && Math.random() < 0.03) {
//       const extraTank = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
//       setActiveTankIndexes((prev) => [...prev, extraTank]);
//     }

//     return next;
//   });
// }, 120);

// return () => clearInterval(tankLoop);
// }, [screen, running, activeTankIndexes, refillingTankIndexes]);

//   useEffect(() => {
//     if (screen !== "live" || !running) return;
//   //   const tankPenalty = setInterval(() => {
//   //     setTanks((prev) => {
//   //       if (refillingTankIndex !== null) return prev;
//   //       if (prev[activeTankIndex] > 2) return prev;
//   //       setLightsScore((s) => clamp(s - 4, 0, 100));
//   //       setFeedback({ text: "Performance of tanks is dropping.", tone: "yellow" });
//   //       return prev;
//   //     });
//   //   }, 900);
//   //   return () => clearInterval(tankPenalty);
//   // }, [screen, running, activeTankIndex, refillingTankIndex]);

//   const tankPenalty = setInterval(() => {
//   setTanks((prev) => {
//     const anyCritical = activeTankIndexes.some(
//       (i) => prev[i] <= 2 && !refillingTankIndexes.includes(i)
//     );
//     if (!anyCritical) return prev;
//     setLightsScore((s) => clamp(s - 4, 0, 100));
//     setFeedback({ text: "Performance of tanks is dropping.", tone: "yellow" });
//     return prev;
//   });
// }, 900);
// return () => clearInterval(tankPenalty);
// }, [screen, running, activeTankIndexes, refillingTankIndexes]);

//   useEffect(() => {
//     //const hasCriticalTank = tanks.some((level, index) => level <= 10 && refillingTankIndex !== index);
//     const hasCriticalTank = tanks.some(
//   (level, index) => level <= 10 && activeTankIndexes.includes(index) && !refillingTankIndexes.includes(index)
//   );
//     if (!hasCriticalTank || !running) {
//       setTankBlinkOn(true);
//       return;
//     }

//     const blinkTimer = setInterval(() => {
//       setTankBlinkOn((prev) => !prev);
//     }, 260);

//     return () => clearInterval(blinkTimer);
//     // }, [tanks, refillingTankIndex, running]);
//   }, [tanks, activeTankIndexes, refillingTankIndexes, running]);

//   useEffect(() => {
//     if (screen !== "live" || !running) return;

//     let cancelled = false;
//     let yellowTimeout = null;
//     let blueTimeout = null;
//     let nextCycleTimeout = null;

//     const runLightSequence = () => {
//       if (cancelled) return;

//       const yellowRow = Math.random() > 0.5 ? 1 : 0;
//       const yellowCol = Math.floor(Math.random() * 4);

//       setLightsEvent({
//         row: yellowRow,
//         col: yellowCol,
//         color: "yellow",
//         active: true,
//       });

//       blueTimeout = setTimeout(() => {
//         if (cancelled) return;

//         const blueRow = Math.random() > 0.5 ? 1 : 0;
//         const blueCol = Math.floor(Math.random() * 4);

//         setLightsEvent({
//           row: blueRow,
//           col: blueCol,
//           color: "blue",
//           active: true,
//         });

//         nextCycleTimeout = setTimeout(() => {
//           runLightSequence();
//         }, rand(4000, 5000));
//       }, rand(4000, 6000));
//     };

//     yellowTimeout = setTimeout(() => {
//       runLightSequence();
//     }, rand(1200, 2200));

//     return () => {
//       cancelled = true;
//       if (yellowTimeout) clearTimeout(yellowTimeout);
//       if (blueTimeout) clearTimeout(blueTimeout);
//       if (nextCycleTimeout) clearTimeout(nextCycleTimeout);
//     };
//   }, [screen, running]);

//   useEffect(() => {
//     if (screen !== "live" || !running || !lightsEvent.active) return;
//     const missTimer = setTimeout(() => {
//       setLightsEvent((prev) => {
//         if (!prev.active) return prev;
//         if (prev.color === "blue") {
//           setLightsScore((s) => clamp(s - 7, 0, 100));
//           setFeedback({ text: "Alert lights: Response missed", tone: "green" });
//         }
//         return { ...prev, active: false };
//       });
//     }, 7000);
//     return () => clearTimeout(missTimer);
//   }, [screen, running, lightsEvent]);

//   useEffect(() => {
//     const timeout = setTimeout(() => setPulse(null), 320);
//     return () => clearTimeout(timeout);
//   }, [pulse]);

//   useEffect(() => {
//     if (!feedback.text) return;
//     const clearTimer = setTimeout(() => {
//       setFeedback((prev) => (prev.text ? { text: "", tone: "green" } : prev));
//     }, 2200);
//     return () => clearTimeout(clearTimer);
//   }, [feedback.text]);

//   useEffect(() => {
//     const onKeyDown = (event) => {
//       if (screen !== "live") return;
//       const key = event.key.toLowerCase();

//       if (["q", "w", "e"].includes(key)) {
//         const index = { q: 0, w: 1, e: 2 }[key];

//         setFeedback({ text: "Tank is refilled", tone: "green" });
//         // setRefillingTankIndex(index);
//         // if (index === activeTankIndex) {
//         // Add
//         setRefillingTankIndexes((prev) => prev.includes(index) ? prev : [...prev, index]);
// if (activeTankIndexes.includes(index)) {
//           setLightsScore((s) => clamp(s + 1, 0, 100));
//         }

//         nextTankStartRef.current = Date.now() + rand(900, 2400);
//       }

//       if (["a", "s", "d", "f"].includes(key)) {
//         const col = { a: 0, s: 1, d: 2, f: 3 }[key];
//         const correct = lightsEvent.active && lightsEvent.color === "blue" && lightsEvent.col === col;
//         const wrongYellow = lightsEvent.active && lightsEvent.color === "yellow" && lightsEvent.col === col;

//         if (correct) {
//           setPulse({ key: key.toUpperCase(), ok: true });
//           setLightsScore((s) => clamp(s + 4, 0, 100));
//           setFeedback({ text: "Alert lights: Correct response", tone: "green" });
//         } else if (wrongYellow) {
//           setPulse({ key: key.toUpperCase(), ok: false });
//           setLightsScore((s) => clamp(s - 6, 0, 100));
//           setFeedback({ text: "Alert lights: Yellow must be ignored", tone: "red" });
//         } else {
//           setPulse({ key: key.toUpperCase(), ok: false });
//           setLightsScore((s) => clamp(s - 4, 0, 100));
//           setFeedback({ text: "Alert lights: Wrong response", tone: "red" });
//         }

//         setLightsEvent((prev) => ({ ...prev, active: false }));
//       }
//     };

//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   //}, [screen, lightsEvent, activeTankIndex]);
//   }, [screen, lightsEvent, activeTankIndexes]);

//   const combinedLightTankScore = useMemo(() => {
//     const tankPart = tanks.reduce((sum, tank) => sum + tank, 0) / tanks.length;
//     return clamp(tankPart * 0.58 + lightsScore * 0.42, 0, 100);
//   }, [tanks, lightsScore]);

//   const warningText = useMemo(() => {
//     //if (tanks.some((level, index) => level < 34 && refillingTankIndex !== index)) {
//     if (tanks.some((level, index) => level < 34 && activeTankIndexes.includes(index) && !refillingTankIndexes.includes(index))) {

//       return "Performance of tanks is dropping.";
//     }
//     //if (refillingTankIndex !== null) {
//     if (refillingTankIndexes.length > 0) {

//       return "Tank is refilling.";
//     }
//     //if (activeTankIndex !== null && combinedLightTankScore < 70) {
//     if (activeTankIndexes.length > 0 && combinedLightTankScore < 70) {

//       return "Performance of tanks is dropping.";
//     }
//     return "";
//   //}, [combinedLightTankScore, tanks, refillingTankIndex, activeTankIndex]);
//   }, [combinedLightTankScore, tanks, refillingTankIndexes, activeTankIndexes]);

//   if (screen === "intro") {
//     return (
//       <div className="min-h-screen bg-[#eff2f6] px-6 py-8 text-[#163f73]">
//         <div className="mx-auto max-w-[1180px]">
//           <div className="mb-7 flex items-center justify-between">
//             <button className="flex items-center gap-3 text-[17px] font-semibold text-[#163f73]">
//               <ArrowLeft className="h-5 w-5" />
//               <span>Back</span>
//             </button>
//             <button className="rounded-[10px] border border-[#d7dde8] bg-white px-7 py-3 text-[17px] font-semibold text-[#163f73] shadow-sm">
//               <span className="inline-flex items-center gap-3">
//                 <Expand className="h-5 w-5" />
//                 Fullscreen
//               </span>
//             </button>
//           </div>

//           <div className="rounded-[16px] border border-[#d6dde8] bg-white px-8 py-9 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
//             <div className="mb-8 flex items-center gap-3">
//               <Target className="h-8 w-8 text-[#163f73]" />
//               <h1 className="text-[29px] font-bold tracking-[-0.02em] text-[#163f73]">Multitasking Test</h1>
//               <Pencil className="h-5 w-5 text-[#163f73]" />
//             </div>

//             <p className="max-w-[980px] text-[18px] leading-10 text-[#35567f]">
//               This test integrates tasks of different performance aspects: Alertness, psychomotor coordination,
//               stress tolerance and selective attention are tested alongside each other and at the same time.
//               Task setup and operation require a coordinated approach and prioritization of subtasks under high workload.
//             </p>

//             <div className="mt-8 grid grid-cols-2 gap-6">
//               <IntroCard
//                 icon={<Target className="h-5 w-5" />}
//                 title="Horizon Tracking"
//                 text="Track the flight director crossing point with your mouse cursor. Keep the circle green within the tolerance area."
//               />
//               <IntroCard
//                 icon={<BellRing className="h-5 w-5" />}
//                 title="Alert Lights"
//                 text="Press the assigned letter key when blue lights flash. Ignore yellow signals. Wrong or missed responses reduce your score."
//               />
//               <IntroCard
//                 icon={<div className="text-[20px] font-bold">⌸</div>}
//                 title="Color Tanks"
//                 text="Monitor tank levels and refill only when a level falls below one third. Refill the correct tank and avoid early responses."
//               />
//               <IntroCard
//                 icon={<Radio className="h-5 w-5" />}
//                 title="Callsign Response"
//                 text="A random number is announced for your callsign. Type the announced value and press Enter before the next call arrives."
//               />
//             </div>

//             <div className="mt-8 flex justify-end">
//               <button
//                 onClick={() => setScreen("live")}
//                 className="rounded-[10px] bg-[#2e79e6] px-7 py-3 text-[16px] font-semibold text-white shadow-sm hover:bg-[#2368cc]"
//               >
//                 Start Test
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="h-screen overflow-hidden bg-[#4d5565] text-white">
//       <div className="mx-auto flex h-full max-w-[1660px] flex-col px-[56px] pb-[34px] pt-[10px]">
//         <div className="flex h-[112px] items-start justify-end">
//           <div className="flex items-center gap-[10px] rounded-bl-[26px] rounded-br-[10px] bg-[#315fc0] px-[28px] py-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
//             <div className="min-w-[188px] text-[20px] font-bold tracking-[0.01em] text-white">Time: {timeLabel}</div>
//             <button
//               onClick={() => setRunning((prev) => !prev)}
//               className="min-w-[124px] rounded-[10px] bg-[#f4f4f4] px-6 py-[9px] text-[17px] font-bold text-[#2f2f2f] shadow-[0_1px_0_rgba(0,0,0,0.1)] hover:bg-white"
//             >
//               {running ? "Pause" : "Resume"}
//             </button>
//             <button
//               onClick={() => setScreen("intro")}
//               className="min-w-[104px] rounded-[10px] bg-[#f4f4f4] px-6 py-[9px] text-[17px] font-bold text-[#2f2f2f] shadow-[0_1px_0_rgba(0,0,0,0.1)] hover:bg-white"
//             >
//               Exit
//             </button>
//           </div>
//         </div>

//         <div className="mx-auto flex flex-1 w-full max-w-[1490px] flex-col justify-center gap-[26px]">
//           <div className="relative rounded-[18px] bg-[linear-gradient(90deg,#151923,#2b2f39,#151923)] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
//             <Screw className="left-[10px] top-[10px]" />
//             <Screw className="left-[10px] bottom-[10px]" />
//             <Screw className="right-[10px] top-[10px]" />
//             <Screw className="right-[10px] bottom-[10px]" />
//             <Screw className="left-[24.5%] top-[10px]" />
//             <Screw className="left-[24.5%] bottom-[10px]" />
//             <Screw className="left-[50.3%] top-[10px]" />
//             <Screw className="left-[50.3%] bottom-[10px]" />
//             <Screw className="left-[75.9%] top-[10px]" />
//             <Screw className="left-[75.9%] bottom-[10px]" />

//             {!running ? (
//               <div className="pointer-events-none absolute inset-0 z-[30] flex items-center justify-center rounded-[18px] bg-[rgba(26,31,40,0.18)]">
//                 <div className="min-w-[520px] bg-[#315fc0] px-[34px] py-[12px] text-center text-[26px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
//                   Pause
//                 </div>
//               </div>
//             ) : null}

//             <div className="grid h-[370px] grid-cols-[1.02fr_1fr_0.96fr_0.96fr] gap-[12px]">
//               <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#9ca5b5)] p-[12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
//                 <div className="h-full overflow-hidden rounded-[26px] bg-[#96a0b2]">
//                   <HorizonTile running={running} onScore={setHorizonScore} />
//                 </div>
//               </div>

//               <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#9ca5b5)] px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
//                 <div className="flex h-full flex-col items-center justify-center gap-9">
//                   <div className="grid grid-cols-4 gap-x-[18px] gap-y-[18px]">
//                     {Array.from({ length: 8 }).map((_, index) => {
//                       const col = index % 4;
//                       const row = Math.floor(index / 3);
//                       const active = lightsEvent.active && lightsEvent.col === col && lightsEvent.row === row;
//                       const color = active
//                         ? lightsEvent.color === "blue"
//                           ? "#4d9fff"
//                           : "#ffca05"
//                         : "#454545";
//                       const glow = active
//                         ? lightsEvent.color === "blue"
//                           ? "0 0 12px rgba(77,159,255,0.45)"
//                           : "0 0 10px rgba(255,202,5,0.35)"
//                         : "none";
//                       return (
//                         <div
//                           key={index}
//                           className="h-[46px] w-[46px] rounded-full border-[4px] border-black"
//                           style={{ background: color, boxShadow: glow }}
//                         />
//                       );
//                     })}
//                   </div>

//                   <div className="grid grid-cols-4 gap-x-[18px] text-[30px] font-black leading-none text-black">
//                     {['A', 'S', 'D', 'F'].map((key) => (
//                       <div key={key} className="flex flex-col items-center gap-2">
//                         <span>{key}</span>
//                         <div
//                           className={`h-[6px] w-[34px] rounded-full ${
//                             pulse?.key === key ? (pulse.ok ? "bg-[#1fff5d]" : "bg-[#ff3a3a]") : "bg-transparent"
//                           }`}
//                         />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#9ca5b5)] px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
//                 <div className="flex h-full items-center justify-center gap-[18px]">
//                   {[
//                     { key: "Q", color: "#e4e800" },
//                     { key: "W", color: "#ff8b00" },
//                     { key: "E", color: "#00d800" },
//                   ].map((item, index) => {
//                     //const isCritical = tanks[index] <= 10 && refillingTankIndex !== index;
//                     const isCritical = tanks[index] <= 10 && activeTankIndexes.includes(index) && !refillingTankIndexes.includes(index);

//                     const blinkVisible = !isCritical || tankBlinkOn;
//                     return (
//                       <div key={item.key} className="flex flex-col items-center gap-[8px]">
//                         <div
//                           className="relative h-[206px] w-[38px] border-[3px] bg-[#b9bfca]"
//                           style={{
//                             borderColor: isCritical && blinkVisible ? "#ff3a3a" : "#2d2d2d",
//                             boxShadow: isCritical && blinkVisible ? "0 0 12px rgba(255,58,58,0.45)" : "none",
//                           }}
//                         >
//                           <div
//                             className="absolute bottom-0 left-0 w-full transition-all duration-100"
//                             style={{
//                               height: `${tanks[index]}%`,
//                               background: item.color,
//                               opacity: blinkVisible ? 1 : 0.18,
//                             }}
//                           />
//                         </div>
//                         <div
//                           className="w-[38px] border-[3px] bg-[#9aa2b1] text-center text-[18px] font-black leading-[36px] text-black"
//                           style={{
//                             borderColor: isCritical && blinkVisible ? "#ff3a3a" : "#2d2d2d",
//                             color: isCritical && blinkVisible ? "#ff1a1a" : "#000000",
//                           }}
//                         >
//                           {item.key}
//                         </div>
//                         <div
//                           className="h-[34px] w-[38px] border-[3px]"
//                           style={{
//                             background: item.color,
//                             borderColor: isCritical && blinkVisible ? "#ff3a3a" : "#2d2d2d",
//                             opacity: blinkVisible ? 1 : 0.18,
//                           }}
//                         />
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               <CallsignTile
//   screen={screen}
//   running={running}
//   setCallsignScore={setCallsignScore}
//   setFeedback={setFeedback}
// />
//             </div>
//           </div>

//           <div className="relative rounded-[18px] bg-[linear-gradient(90deg,#151923,#2b2f39,#151923)] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
//             <Screw className="left-[10px] top-[10px]" />
//             <Screw className="left-[10px] bottom-[10px]" />
//             <Screw className="right-[10px] top-[10px]" />
//             <Screw className="right-[10px] bottom-[10px]" />

//             <div className="rounded-[26px] bg-[linear-gradient(180deg,#97a0b1,#8f98a9)] px-[26px] py-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
//               <div className="grid grid-cols-[0.95fr_1.05fr_0.95fr] gap-[42px]">
//                 <div className="space-y-[22px]">
//                   <MetricBar label="Horizon Performance" value={horizonScore} />
//                   <TimeMetric timeLabel={timeLabel} />
//                 </div>

//                 <div className="space-y-[18px]">
//                   <MetricBar label="Lights and Tanks Performance" value={combinedLightTankScore} />
//                   <div className="min-h-[74px] pl-[8px] text-left">
//                     <div className="text-[21px] font-bold text-[#ffff00]">Warning</div>
//                     <div className="mt-1 text-[21px] leading-[1.2] text-[#ffff00]">{warningText || " "}</div>
//                   </div>
//                 </div>

//                 <div className="space-y-[22px]">
//                   <MetricBar label="Callsign Performance" value={callsignScore} />
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="flex min-h-[42px] items-center justify-center text-center text-[18px] font-bold tracking-[0.01em]">
//             {feedback.text ? (
//               <span
//                 className={
//                   feedback.tone === "green"
//                     ? "text-[#24ff24]"
//                     : feedback.tone === "yellow"
//                     ? "text-[#ffff00]"
//                     : "text-[#ff4e4e]"
//                 }
//               >
//                 {feedback.text}
//               </span>
//             ) : (
//               <span className="text-transparent">status</span>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BellRing, Expand, Pencil, Radio, Target } from "lucide-react";

import { clamp, rand } from "./app/utils/math";
import Screw from "./app/common/Screw";
import MetricBar from "./app/common/MetricBar";
import TimeMetric from "./app/common/TimeMetric";
import IntroCard from "./app/common/IntroCard";

import HorizonTile from "./app/tiles/HorizonTile";
import AlertLightsTile from "./app/tiles/AlertLightsTile";
import TanksTile from "./app/tiles/TanksTile";
import CallsignTile from "./app/tiles/CallsignTile";

export default function MultitaskingTestCompetitorStyle() {
  const [screen, setScreen] = useState("live");
  const [running, setRunning] = useState(true);
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 52);
  const [horizonScore, setHorizonScore] = useState(0);
  const [lightsScore, setLightsScore] = useState(52);
  const [callsignScore, setCallsignScore] = useState(50);
  const [feedback, setFeedback] = useState({ text: "", tone: "green" });

  const [lightsEvent, setLightsEvent] = useState({ row: 0, col: 0, color: "blue", active: false });
  const [pulse, setPulse] = useState(null);

  const [tanks, setTanks] = useState([78, 100, 100]);
  const [activeTankIndexes, setActiveTankIndexes] = useState([0]);
  const [refillingTankIndexes, setRefillingTankIndexes] = useState([]);
  const [tankBlinkOn, setTankBlinkOn] = useState(true);
  const nextTankStartRef = useRef(Date.now() + 1800);
  const secondTankThresholdRef = useRef(rand(45, 55));

  const timeLabel = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`;

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "live" || !running) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, running]);

  // ── Tank drain / refill loop ───────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "live" || !running) return;

    const tankLoop = setInterval(() => {
      setTanks((prev) => {
        const next = [...prev];

        if (refillingTankIndexes.length > 0) {
          refillingTankIndexes.forEach((tankIndex) => {
            const refillSpeed = tankIndex === 0 ? 7.5 : tankIndex === 1 ? 7.0 : 7.25;
            next[tankIndex] = clamp(next[tankIndex] + refillSpeed, 0, 100);
          });

          const completedIndexes = refillingTankIndexes.filter((tankIndex) => next[tankIndex] >= 100);
          if (completedIndexes.length > 0) {
            completedIndexes.forEach((tankIndex) => { next[tankIndex] = 100; });
            setRefillingTankIndexes((prev) => prev.filter((i) => !completedIndexes.includes(i)));
            setActiveTankIndexes((prev) => {
              const remaining = prev.filter((i) => !completedIndexes.includes(i));
              if (remaining.length === 0) {
                nextTankStartRef.current = Date.now() + rand(900, 2400);
                secondTankThresholdRef.current = rand(45, 55);
              }
              return remaining;
            });
          }
        }

        if (activeTankIndexes.length === 0 && refillingTankIndexes.length === 0) {
          if (Date.now() >= nextTankStartRef.current) {
            setActiveTankIndexes([Math.floor(Math.random() * 3)]);
            secondTankThresholdRef.current = rand(45, 55);
          }
          return next;
        }

        const drainingIndexes = activeTankIndexes.filter((i) => !refillingTankIndexes.includes(i));
        drainingIndexes.forEach((tankIndex) => {
          const drainSpeed = tankIndex === 0 ? 0.72 : tankIndex === 1 ? 0.62 : 0.67;
          next[tankIndex] = clamp(next[tankIndex] - drainSpeed - rand(0.01, 0.08), 0, 100);
        });

        const belowThreshold = drainingIndexes.some((i) => next[i] < secondTankThresholdRef.current);
        const availableIndexes = [0, 1, 2].filter(
          (i) => !activeTankIndexes.includes(i) && !refillingTankIndexes.includes(i)
        );
        if (belowThreshold && activeTankIndexes.length < 2 && availableIndexes.length > 0 && Math.random() < 0.03) {
          const extraTank = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
          setActiveTankIndexes((prev) => [...prev, extraTank]);
        }

        return next;
      });
    }, 120);

    return () => clearInterval(tankLoop);
  }, [screen, running, activeTankIndexes, refillingTankIndexes]);

  // ── Tank penalty ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "live" || !running) return;

    const tankPenalty = setInterval(() => {
      setTanks((prev) => {
        const anyCritical = activeTankIndexes.some(
          (i) => prev[i] <= 2 && !refillingTankIndexes.includes(i)
        );
        if (!anyCritical) return prev;
        setLightsScore((s) => clamp(s - 4, 0, 100));
        setFeedback({ text: "Performance of tanks is dropping.", tone: "yellow" });
        return prev;
      });
    }, 900);

    return () => clearInterval(tankPenalty);
  }, [screen, running, activeTankIndexes, refillingTankIndexes]);

  // ── Tank blink ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const hasCriticalTank = tanks.some(
      (level, index) => level <= 10 && activeTankIndexes.includes(index) && !refillingTankIndexes.includes(index)
    );
    if (!hasCriticalTank || !running) {
      setTankBlinkOn(true);
      return;
    }
    const blinkTimer = setInterval(() => {
      setTankBlinkOn((prev) => !prev);
    }, 260);
    return () => clearInterval(blinkTimer);
  }, [tanks, activeTankIndexes, refillingTankIndexes, running]);

  // ── Lights sequence ────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "live" || !running) return;

    let cancelled = false;
    let yellowTimeout = null;
    let blueTimeout = null;
    let nextCycleTimeout = null;

    const runLightSequence = () => {
      if (cancelled) return;
      const yellowRow = Math.random() > 0.5 ? 1 : 0;
      const yellowCol = Math.floor(Math.random() * 4);
      setLightsEvent({ row: yellowRow, col: yellowCol, color: "yellow", active: true });

      blueTimeout = setTimeout(() => {
        if (cancelled) return;
        const blueRow = Math.random() > 0.5 ? 1 : 0;
        const blueCol = Math.floor(Math.random() * 4);
        setLightsEvent({ row: blueRow, col: blueCol, color: "blue", active: true });
        nextCycleTimeout = setTimeout(() => { runLightSequence(); }, rand(4000, 5000));
      }, rand(4000, 6000));
    };

    yellowTimeout = setTimeout(() => { runLightSequence(); }, rand(1200, 2200));

    return () => {
      cancelled = true;
      if (yellowTimeout) clearTimeout(yellowTimeout);
      if (blueTimeout) clearTimeout(blueTimeout);
      if (nextCycleTimeout) clearTimeout(nextCycleTimeout);
    };
  }, [screen, running]);

  // ── Lights miss timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "live" || !running || !lightsEvent.active) return;
    const missTimer = setTimeout(() => {
      setLightsEvent((prev) => {
        if (!prev.active) return prev;
        if (prev.color === "blue") {
          setLightsScore((s) => clamp(s - 7, 0, 100));
          setFeedback({ text: "Alert lights: Response missed", tone: "green" });
        }
        return { ...prev, active: false };
      });
    }, 7000);
    return () => clearTimeout(missTimer);
  }, [screen, running, lightsEvent]);

  // ── Pulse clear ────────────────────────────────────────────────────────────
  useEffect(() => {
    const timeout = setTimeout(() => setPulse(null), 320);
    return () => clearTimeout(timeout);
  }, [pulse]);

  // ── Feedback clear ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!feedback.text) return;
    const clearTimer = setTimeout(() => {
      setFeedback((prev) => (prev.text ? { text: "", tone: "green" } : prev));
    }, 2200);
    return () => clearTimeout(clearTimer);
  }, [feedback.text]);

  // ── Keyboard: tanks + lights ONLY — no speech cancel here ─────────────────
  useEffect(() => {
    const onKeyDown = (event) => {
      if (screen !== "live") return;
      const key = event.key.toLowerCase();

      if (["q", "w", "e"].includes(key)) {
        const index = { q: 0, w: 1, e: 2 }[key];
        setFeedback({ text: "Tank is refilled", tone: "green" });
        setRefillingTankIndexes((prev) => prev.includes(index) ? prev : [...prev, index]);
        if (activeTankIndexes.includes(index)) {
          setLightsScore((s) => clamp(s + 1, 0, 100));
        }
        nextTankStartRef.current = Date.now() + rand(900, 2400);
      }

      if (["a", "s", "d", "f"].includes(key)) {
        const col = { a: 0, s: 1, d: 2, f: 3 }[key];
        const correct = lightsEvent.active && lightsEvent.color === "blue" && lightsEvent.col === col;
        const wrongYellow = lightsEvent.active && lightsEvent.color === "yellow" && lightsEvent.col === col;

        if (correct) {
          setPulse({ key: key.toUpperCase(), ok: true });
          setLightsScore((s) => clamp(s + 4, 0, 100));
          setFeedback({ text: "Alert lights: Correct response", tone: "green" });
        } else if (wrongYellow) {
          setPulse({ key: key.toUpperCase(), ok: false });
          setLightsScore((s) => clamp(s - 6, 0, 100));
          setFeedback({ text: "Alert lights: Yellow must be ignored", tone: "red" });
        } else {
          setPulse({ key: key.toUpperCase(), ok: false });
          setLightsScore((s) => clamp(s - 4, 0, 100));
          setFeedback({ text: "Alert lights: Wrong response", tone: "red" });
        }

        setLightsEvent((prev) => ({ ...prev, active: false }));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [screen, lightsEvent, activeTankIndexes]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const combinedLightTankScore = useMemo(() => {
    const tankPart = tanks.reduce((sum, tank) => sum + tank, 0) / tanks.length;
    return clamp(tankPart * 0.58 + lightsScore * 0.42, 0, 100);
  }, [tanks, lightsScore]);

  const warningText = useMemo(() => {
    if (tanks.some((level, index) => level < 34 && activeTankIndexes.includes(index) && !refillingTankIndexes.includes(index))) {
      return "Performance of tanks is dropping.";
    }
    if (refillingTankIndexes.length > 0) return "Tank is refilling.";
    if (activeTankIndexes.length > 0 && combinedLightTankScore < 70) return "Performance of tanks is dropping.";
    return "";
  }, [combinedLightTankScore, tanks, refillingTankIndexes, activeTankIndexes]);

  // ── Intro screen ───────────────────────────────────────────────────────────
  if (screen === "intro") {
    return (
      <div className="min-h-screen bg-[#eff2f6] px-6 py-8 text-[#163f73]">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-7 flex items-center justify-between">
            <button className="flex items-center gap-3 text-[17px] font-semibold text-[#163f73]">
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <button className="rounded-[10px] border border-[#d7dde8] bg-white px-7 py-3 text-[17px] font-semibold text-[#163f73] shadow-sm">
              <span className="inline-flex items-center gap-3">
                <Expand className="h-5 w-5" />
                Fullscreen
              </span>
            </button>
          </div>

          <div className="rounded-[16px] border border-[#d6dde8] bg-white px-8 py-9 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
            <div className="mb-8 flex items-center gap-3">
              <Target className="h-8 w-8 text-[#163f73]" />
              <h1 className="text-[29px] font-bold tracking-[-0.02em] text-[#163f73]">Multitasking Test</h1>
              <Pencil className="h-5 w-5 text-[#163f73]" />
            </div>
            <p className="max-w-[980px] text-[18px] leading-10 text-[#35567f]">
              This test integrates tasks of different performance aspects: Alertness, psychomotor coordination,
              stress tolerance and selective attention are tested alongside each other and at the same time.
              Task setup and operation require a coordinated approach and prioritization of subtasks under high workload.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <IntroCard icon={<Target className="h-5 w-5" />} title="Horizon Tracking" text="Track the flight director crossing point with your mouse cursor. Keep the circle green within the tolerance area." />
              <IntroCard icon={<BellRing className="h-5 w-5" />} title="Alert Lights" text="Press the assigned letter key when blue lights flash. Ignore yellow signals. Wrong or missed responses reduce your score." />
              <IntroCard icon={<div className="text-[20px] font-bold">⌸</div>} title="Color Tanks" text="Monitor tank levels and refill only when a level falls below one third. Refill the correct tank and avoid early responses." />
              <IntroCard icon={<Radio className="h-5 w-5" />} title="Callsign Response" text="A random callsign is announced phonetically with a new heading. Type the heading value and press Enter before the next call." />
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setScreen("live")} className="rounded-[10px] bg-[#2e79e6] px-7 py-3 text-[16px] font-semibold text-white shadow-sm hover:bg-[#2368cc]">
                Start Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Live screen ────────────────────────────────────────────────────────────
  return (
    <div className="h-screen overflow-hidden bg-[#4d5565] text-white">
      <div className="mx-auto flex h-full max-w-[1660px] flex-col px-[56px] pb-[34px] pt-[10px]">
        <div className="flex h-[112px] items-start justify-end">
          <div className="flex items-center gap-[10px] rounded-bl-[26px] rounded-br-[10px] bg-[#315fc0] px-[28px] py-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div className="min-w-[188px] text-[20px] font-bold tracking-[0.01em] text-white">Time: {timeLabel}</div>
            <button onClick={() => setRunning((prev) => !prev)} className="min-w-[124px] rounded-[10px] bg-[#f4f4f4] px-6 py-[9px] text-[17px] font-bold text-[#2f2f2f] shadow-[0_1px_0_rgba(0,0,0,0.1)] hover:bg-white">
              {running ? "Pause" : "Resume"}
            </button>
            <button onClick={() => setScreen("intro")} className="min-w-[104px] rounded-[10px] bg-[#f4f4f4] px-6 py-[9px] text-[17px] font-bold text-[#2f2f2f] shadow-[0_1px_0_rgba(0,0,0,0.1)] hover:bg-white">
              Exit
            </button>
          </div>
        </div>

        <div className="mx-auto flex flex-1 w-full max-w-[1490px] flex-col justify-center gap-[26px]">
          <div className="relative rounded-[18px] bg-[linear-gradient(90deg,#151923,#2b2f39,#151923)] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <Screw className="left-[10px] top-[10px]" />
            <Screw className="left-[10px] bottom-[10px]" />
            <Screw className="right-[10px] top-[10px]" />
            <Screw className="right-[10px] bottom-[10px]" />
            <Screw className="left-[24.5%] top-[10px]" />
            <Screw className="left-[24.5%] bottom-[10px]" />
            <Screw className="left-[50.3%] top-[10px]" />
            <Screw className="left-[50.3%] bottom-[10px]" />
            <Screw className="left-[75.9%] top-[10px]" />
            <Screw className="left-[75.9%] bottom-[10px]" />

            {!running ? (
              <div className="pointer-events-none absolute inset-0 z-[30] flex items-center justify-center rounded-[18px] bg-[rgba(26,31,40,0.18)]">
                <div className="min-w-[520px] bg-[#315fc0] px-[34px] py-[12px] text-center text-[26px] font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                  Pause
                </div>
              </div>
            ) : null}

            <div className="grid h-[370px] grid-cols-[1.02fr_1fr_0.96fr_0.96fr] gap-[12px]">

              {/* Tile 1: Horizon */}
              <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#9ca5b5)] p-[12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <div className="h-full overflow-hidden rounded-[26px] bg-[#96a0b2]">
                  <HorizonTile running={running} onScore={setHorizonScore} />
                </div>
              </div>

              {/* Tile 2: Alert Lights */}
              <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#9ca5b5)] px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <div className="flex h-full flex-col items-center justify-center gap-9">
                  <div className="grid grid-cols-4 gap-x-[18px] gap-y-[18px]">
                    {Array.from({ length: 8 }).map((_, index) => {
                      const col = index % 4;
                      const row = Math.floor(index / 3);
                      const active = lightsEvent.active && lightsEvent.col === col && lightsEvent.row === row;
                      const color = active ? (lightsEvent.color === "blue" ? "#4d9fff" : "#ffca05") : "#454545";
                      const glow = active ? (lightsEvent.color === "blue" ? "0 0 12px rgba(77,159,255,0.45)" : "0 0 10px rgba(255,202,5,0.35)") : "none";
                      return (
                        <div key={index} className="h-[46px] w-[46px] rounded-full border-[4px] border-black" style={{ background: color, boxShadow: glow }} />
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-4 gap-x-[18px] text-[30px] font-black leading-none text-black">
                    {['A', 'S', 'D', 'F'].map((key) => (
                      <div key={key} className="flex flex-col items-center gap-2">
                        <span>{key}</span>
                        <div className={`h-[6px] w-[34px] rounded-full ${pulse?.key === key ? (pulse.ok ? "bg-[#1fff5d]" : "bg-[#ff3a3a]") : "bg-transparent"}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tile 3: Tanks */}
              <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#9ca5b5)] px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <div className="flex h-full items-center justify-center gap-[18px]">
                  {[{ key: "Q", color: "#e4e800" }, { key: "W", color: "#ff8b00" }, { key: "E", color: "#00d800" }].map((item, index) => {
                    const isCritical = tanks[index] <= 10 && activeTankIndexes.includes(index) && !refillingTankIndexes.includes(index);
                    const blinkVisible = !isCritical || tankBlinkOn;
                    return (
                      <div key={item.key} className="flex flex-col items-center gap-[8px]">
                        <div className="relative h-[206px] w-[38px] border-[3px] bg-[#b9bfca]" style={{ borderColor: isCritical && blinkVisible ? "#ff3a3a" : "#2d2d2d", boxShadow: isCritical && blinkVisible ? "0 0 12px rgba(255,58,58,0.45)" : "none" }}>
                          <div className="absolute bottom-0 left-0 w-full transition-all duration-100" style={{ height: `${tanks[index]}%`, background: item.color, opacity: blinkVisible ? 1 : 0.18 }} />
                        </div>
                        <div className="w-[38px] border-[3px] bg-[#9aa2b1] text-center text-[18px] font-black leading-[36px] text-black" style={{ borderColor: isCritical && blinkVisible ? "#ff3a3a" : "#2d2d2d", color: isCritical && blinkVisible ? "#ff1a1a" : "#000000" }}>
                          {item.key}
                        </div>
                        <div className="h-[34px] w-[38px] border-[3px]" style={{ background: item.color, borderColor: isCritical && blinkVisible ? "#ff3a3a" : "#2d2d2d", opacity: blinkVisible ? 1 : 0.18 }} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tile 4: Callsign — ALL logic inside CallsignTile, nothing here */}
              <CallsignTile
                screen={screen}
                running={running}
                setCallsignScore={setCallsignScore}
                setFeedback={setFeedback}
              />

            </div>
          </div>

          {/* Performance bar */}
          <div className="relative rounded-[18px] bg-[linear-gradient(90deg,#151923,#2b2f39,#151923)] p-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <Screw className="left-[10px] top-[10px]" />
            <Screw className="left-[10px] bottom-[10px]" />
            <Screw className="right-[10px] top-[10px]" />
            <Screw className="right-[10px] bottom-[10px]" />
            <div className="rounded-[26px] bg-[linear-gradient(180deg,#97a0b1,#8f98a9)] px-[26px] py-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
              <div className="grid grid-cols-[0.95fr_1.05fr_0.95fr] gap-[42px]">
                <div className="space-y-[22px]">
                  <MetricBar label="Horizon Performance" value={horizonScore} />
                  <TimeMetric timeLabel={timeLabel} />
                </div>
                <div className="space-y-[18px]">
                  <MetricBar label="Lights and Tanks Performance" value={combinedLightTankScore} />
                  <div className="min-h-[74px] pl-[8px] text-left">
                    <div className="text-[21px] font-bold text-[#ffff00]">Warning</div>
                    <div className="mt-1 text-[21px] leading-[1.2] text-[#ffff00]">{warningText || " "}</div>
                  </div>
                </div>
                <div className="space-y-[22px]">
                  <MetricBar label="Callsign Performance" value={callsignScore} />
                </div>
              </div>
            </div>
          </div>

          {/* Feedback bar */}
          <div className="flex min-h-[42px] items-center justify-center text-center text-[18px] font-bold tracking-[0.01em]">
            {feedback.text ? (
              <span className={feedback.tone === "green" ? "text-[#24ff24]" : feedback.tone === "yellow" ? "text-[#ffff00]" : "text-[#ff4e4e]"}>
                {feedback.text}
              </span>
            ) : (
              <span className="text-transparent">status</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
