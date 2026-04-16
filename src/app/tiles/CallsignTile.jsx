import React, { useEffect, useRef, useState } from "react";

// ── NATO Phonetic Alphabet ────────────────────────────────────────────────────
const NATO = {
  A: "Alpha",    B: "Bravo",    C: "Charlie",  D: "Delta",    E: "Echo",
  F: "Foxtrot",  G: "Golf",     H: "Hotel",    I: "India",    J: "Juliet",
  K: "Kilo",     L: "Lima",     M: "Mike",     N: "November", O: "Oscar",
  P: "Papa",     Q: "Quebec",   R: "Romeo",    S: "Sierra",   T: "Tango",
  U: "Uniform",  V: "Victor",   W: "Whiskey",  X: "X-ray",    Y: "Yankee",
  Z: "Zulu",
  "0": "zero",   "1": "one",    "2": "two",    "3": "three",  "4": "four",
  "5": "five",   "6": "six",    "7": "seven",  "8": "eight",  "9": "niner",
};

function toPhonetic(str) {
  return str.toUpperCase().split("").map((ch) => NATO[ch] ?? ch).join(" ");
}

// Spoken digits for numbers: "275" -> "two seven five"
function digitsToSpoken(numStr) {
  return numStr.split("").map((d) => NATO[d] ?? d).join(" ");
}

function generateCallsign(exclude = "") {
  const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let cs;
  do {
    const l1 = L[Math.floor(Math.random() * L.length)];
    const l2 = L[Math.floor(Math.random() * L.length)];
    const d1 = Math.floor(Math.random() * 10);
    const d2 = Math.floor(Math.random() * 10);
    const d3 = Math.floor(Math.random() * 10);
    cs = `${l1}${l2}${d1}${d2}${d3}`;
  } while (cs === exclude);
  return cs;
}

// ── NEW: generate the task (type + value) ─────────────────────────────────────
function generateTask(lastValue = "") {
  const isHeading = Math.random() < 0.5;
  let value;
  do {
    if (isHeading) {
      // Heading: 100–360
      value = String(Math.floor(Math.random() * (360 - 100 + 1)) + 100);
    } else {
      // Flight Level: 50–410
      value = String(Math.floor(Math.random() * (410 - 50 + 1)) + 50);
    }
  } while (value === lastValue);

  return {
    type: isHeading ? "heading" : "flightLevel",
    value,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
export default function CallsignTile({ screen, running, setCallsignScore, setFeedback }) {
  const [callsign, setCallsign]             = useState("");
  const [currentTask, setCurrentTask]       = useState(null); // { type, value } or null
  const [headingInput, setHeadingInput]     = useState("");
  const [callsignStats, setCallsignStats]   = useState({ correct: 0, wrong: 0, missed: 0, total: 0 });

  const inputRef            = useRef(null);
  const lastValueRef        = useRef("");
  const lastCallsignRef     = useRef("");
  const speechUnlockedRef   = useRef(false);
  const pendingRef          = useRef(null);
  const voicesRef           = useRef([]);
  const unlockInProgressRef = useRef(false);
  const answeredRef         = useRef(false);
  const headingInputRef     = useRef("");
  const currentTaskRef      = useRef(null);

  useEffect(() => { headingInputRef.current = headingInput; }, [headingInput]);
  useEffect(() => { currentTaskRef.current = currentTask; }, [currentTask]);

  // ── Sync score to parent ──────────────────────────────────────────────────
  useEffect(() => {
    if (callsignStats.total === 0) {
      setCallsignScore(50);
      return;
    }
    setCallsignScore((callsignStats.correct / callsignStats.total) * 100);
  }, [callsignStats, setCallsignScore]);

  // ── Core speak function ───────────────────────────────────────────────────
  const speakCall = (cs, task) => {
    if (!("speechSynthesis" in window)) return false;

    pendingRef.current = { cs, task };

    if (!speechUnlockedRef.current) return false;

    const synth = window.speechSynthesis;
    synth.cancel();
    synth.resume();

    // Build text based on task type
    const prefix = task.type === "heading" ? "new heading" : "flight level";
    const text = `${toPhonetic(cs)}, ${prefix}, ${digitsToSpoken(task.value)}`;

    const utt = new SpeechSynthesisUtterance(text);

    const voices = voicesRef.current.length ? voicesRef.current : synth.getVoices();
    const preferred =
      voices.find((v) => /en/i.test(v.lang) && /(Google|Samantha|Daniel|Karen|Moira|Alex)/i.test(v.name)) ||
      voices.find((v) => /en/i.test(v.lang)) ||
      null;

    if (preferred) { utt.voice = preferred; utt.lang = preferred.lang; }
    else            { utt.lang = "en-US"; }

    utt.rate   = 0.70;
    utt.pitch  = 1;
    utt.volume = 1;

    utt.onend = () => {
      if (pendingRef.current?.cs === cs && pendingRef.current?.task?.value === task.value) {
        pendingRef.current = null;
      }
    };

    setTimeout(() => synth.speak(utt), 60);
    return true;
  };

  // ── Load voices + one-time speech unlock on first user gesture ───────────
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const v = synth.getVoices();
      if (v.length) voicesRef.current = v;
    };
    loadVoices();
    synth.onvoiceschanged = loadVoices;

    const unlock = () => {
      if (speechUnlockedRef.current || unlockInProgressRef.current) return;
      unlockInProgressRef.current = true;
      speechUnlockedRef.current   = true;
      synth.resume();

      const warmup  = new SpeechSynthesisUtterance(".");
      warmup.volume = 0.001;
      warmup.onend  = () => {
        unlockInProgressRef.current = false;
        if (pendingRef.current) {
          const { cs, task } = pendingRef.current;
          setTimeout(() => speakCall(cs, task), 150);
        }
      };
      synth.cancel();
      synth.speak(warmup);
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown",     unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown",     unlock);
      synth.onvoiceschanged = null;
    };
  }, []);

  // ── Pause/Resume speech ───────────────────────────────────────────────────
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    if (!running) synth.pause();
    else          synth.resume();
  }, [running]);

  // ── Schedule next call ────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "live" || !running || currentTask) return;

    const delay = lastValueRef.current ? Math.random() * 4000 + 7000 : 2600;

    const timer = setTimeout(() => {
      const nextTask = generateTask(lastValueRef.current);
      const nextCS   = generateCallsign(lastCallsignRef.current);

      lastValueRef.current    = nextTask.value;
      lastCallsignRef.current = nextCS;
      answeredRef.current     = false;

      setCallsign(nextCS);
      setCurrentTask(nextTask);
      setHeadingInput("");

      const spoken = speakCall(nextCS, nextTask);

      if (!spoken) {
        const retry = setInterval(() => {
          if (speechUnlockedRef.current) {
            speakCall(nextCS, nextTask);
            clearInterval(retry);
          }
        }, 200);
        setTimeout(() => clearInterval(retry), 4000);
      }

      setTimeout(() => inputRef.current?.focus(), 100);
    }, delay);

    return () => clearTimeout(timer);
  }, [screen, running, currentTask]);

  // ── Response timeout (missed) ─────────────────────────────────────────────
  // ── Response timeout (missed) ─────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "live" || !running || !currentTask) return;

    const timer = setTimeout(() => {
      if (answeredRef.current) return;
      answeredRef.current = true;

      // Read the task type from ref to show the right label
      const missedTask = currentTaskRef.current;
      const taskLabel = missedTask?.type === "heading" ? "New Heading" : "Flight Level";

      setCallsignStats((prev) => ({
        ...prev,
        missed: prev.missed + 1,
        total:  prev.total  + 1,
      }));
      setFeedback({ text: `${taskLabel}: Response missed`, tone: "yellow" });
      setHeadingInput("");
      setCurrentTask(null);
    }, 10000);

    return () => clearTimeout(timer);
  }, [screen, running, currentTask]);

  // ── Submit answer ─────────────────────────────────────────────────────────
  const submit = () => {
    const task = currentTaskRef.current;
    if (!task) return;
    answeredRef.current = true;

    const typed     = headingInputRef.current.trim();
    const isCorrect = typed === task.value;

    const taskLabel = task.type === "heading" ? "Heading" : "Flight Level";

    console.log("SUBMIT:", { typed, expected: task.value, type: task.type, isCorrect });

    setCallsignStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong:   prev.wrong   + (isCorrect ? 0 : 1),
      missed:  prev.missed,
      total:   prev.total   + 1,
    }));

    setFeedback({
      text: isCorrect
        ? `${taskLabel}: Correct response ${typed}`
        : `${taskLabel}: Wrong response ${typed || "---"}`,
      tone: isCorrect ? "green" : "red",
    });

    setHeadingInput("");
    setCurrentTask(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#a6afbe)] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex h-full flex-col items-center justify-center text-center text-[#4a4a4a]">

        <div className="text-[21px] font-medium">Your callsign:</div>
        <div className="mt-1 text-[28px] font-black tracking-[0.01em] text-[#0b8f00]">
          {callsign}
        </div>

        <div className="mt-[38px] text-[21px] font-bold">New Heading / Flight Level:</div>

        <input
          ref={inputRef}
          inputMode="numeric"
          autoComplete="off"
          value={headingInput}
          onChange={(e) => setHeadingInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          className={`mt-3 h-[48px] w-[160px] border-[3px] border-[#5b5b5b] text-center text-[26px] font-semibold text-black outline-none ${
            currentTask || headingInput ? "bg-[#fff200]" : "bg-white"
          }`}
          placeholder=""
        />

      </div>
    </div>
  );
}