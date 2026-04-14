import React, { useEffect, useRef, useState } from "react";

// ── NATO Phonetic Alphabet ────────────────────────────────────────────────────
const NATO = {
  A: "Alpha",    B: "Bravo",    C: "Charlie",  D: "Delta",    E: "Echo",
  F: "Foxtrot",  G: "Golf",     H: "Hotel",    I: "India",    J: "Juliet",
  K: "Kilo",     L: "Lima",     M: "Mike",     N: "November", O: "Oscar",
  P: "Papa",     Q: "Quebec",   R: "Romeo",    S: "Sierra",   T: "Tango",
  U: "Uniform",  V: "Victor",   W: "Whiskey",  X: "X-ray",    Y: "Yankee",
  Z: "Zulu",
  "0": "Zero",   "1": "One",    "2": "Two",    "3": "Three",  "4": "Four",
  "5": "Five",   "6": "Six",    "7": "Seven",  "8": "Eight",  "9": "Niner",
};

function toPhonetic(str) {
  return str.toUpperCase().split("").map((ch) => NATO[ch] ?? ch).join(" ")
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

const HEADING_POOL = [
  "100","150","200","250","300","350","400","450",
  "500","550","600","650","700","750","800","850","900",
];

// ─────────────────────────────────────────────────────────────────────────────
export default function CallsignTile({ screen, running, setCallsignScore, setFeedback }) {
  const [callsign, setCallsign]               = useState(() => generateCallsign());
  const [announcedHeading, setAnnouncedHeading] = useState("");
  const [headingInput, setHeadingInput]         = useState("");
  const [callsignStats, setCallsignStats]       = useState({ correct: 0, wrong: 0, missed: 0, total: 0 });

  const inputRef            = useRef(null);
  const lastHeadingRef      = useRef("");
  const lastCallsignRef     = useRef("");
  const speechUnlockedRef   = useRef(false);
  const pendingRef          = useRef(null);
  const voicesRef           = useRef([]);
  const unlockInProgressRef = useRef(false);
  const answeredRef         = useRef(false);
  const headingInputRef    = useRef("");
  const announcedRef       = useRef("");

  // ── Sync score to parent whenever stats change (correct React pattern) ────
  useEffect(() => { headingInputRef.current = headingInput; }, [headingInput]);
  useEffect(() => { announcedRef.current = announcedHeading; }, [announcedHeading]); 
  useEffect(() => {
    if (callsignStats.total === 0) {
      setCallsignScore(50); // default starting display
      return;
    }
    setCallsignScore((callsignStats.correct / callsignStats.total) * 100);
  }, [callsignStats, setCallsignScore]);

  // ── Core speak function ───────────────────────────────────────────────────
  const speakCall = (cs, heading) => {
    if (!("speechSynthesis" in window)) return false;

    pendingRef.current = { cs, heading };

    if (!speechUnlockedRef.current) return false;

    const synth = window.speechSynthesis;
    synth.cancel();
    synth.resume();

    const text = `${toPhonetic(cs)}, new heading, ${toPhonetic(heading)}`;
    const utt  = new SpeechSynthesisUtterance(text);

    const voices = voicesRef.current.length ? voicesRef.current : synth.getVoices();
    const preferred =
      voices.find((v) => /en/i.test(v.lang) && /(Google|Samantha|Daniel|Karen|Moira|Alex)/i.test(v.name)) ||
      voices.find((v) => /en/i.test(v.lang)) ||
      null;

    if (preferred) { utt.voice = preferred; utt.lang = preferred.lang; }
    else            { utt.lang = "en-US"; }

    utt.rate   = 0.70;  // slightly slower than normal
    utt.pitch  = 1;
    utt.volume = 1;

    utt.onend = () => {
      if (pendingRef.current?.cs === cs && pendingRef.current?.heading === heading) {
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
          const { cs, heading } = pendingRef.current;
          setTimeout(() => speakCall(cs, heading), 150);
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

  // ── Pause: cancel speech when not running ─────────────────────────────────
useEffect(() => {
  if (!("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;

  if (!running) {
    synth.pause();       // freeze mid-utterance
  } else {
    synth.resume();      // continue from where it stopped
  }
}, [running]);

  // ── Schedule next call ────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "live" || !running || announcedHeading) return;

    const delay = lastHeadingRef.current ? Math.random() * 4000 + 7000 : 2600;

    const timer = setTimeout(() => {
      const options     = HEADING_POOL.filter((v) => v !== lastHeadingRef.current);
      const nextHeading = options[Math.floor(Math.random() * options.length)];
      const nextCS      = generateCallsign(lastCallsignRef.current);

      lastHeadingRef.current  = nextHeading;
      lastCallsignRef.current = nextCS;
      answeredRef.current     = false; // reset for new call

      setCallsign(nextCS);
      setAnnouncedHeading(nextHeading);
      setHeadingInput("");
      //speakCall(nextCS, nextHeading);

      const spoken = speakCall(nextCS, nextHeading);

// Speech was blocked? Keep trying every 200ms
if (!spoken) {
  const retry = setInterval(() => {
    if (speechUnlockedRef.current) {
      speakCall(nextCS, nextHeading);  // try again
      clearInterval(retry);            // stop retrying
    }
  }, 200);
  setTimeout(() => clearInterval(retry), 4000); // give up after 4 sec
}

      setTimeout(() => inputRef.current?.focus(), 100);
    }, delay);

    return () => clearTimeout(timer);
  }, [screen, running, announcedHeading]);

  // ── Response timeout (missed) ─────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "live" || !running || !announcedHeading) return;

    const timer = setTimeout(() => {
      if (answeredRef.current) return; // user already answered — skip miss
      answeredRef.current = true;   
      setCallsignStats((prev) => ({
        ...prev,
        missed: prev.missed + 1,
        total:  prev.total  + 1,
      }));
      setFeedback({ text: "Heading call: Response missed", tone: "yellow" });
      setHeadingInput("");
      setAnnouncedHeading("");
    }, 10000);

    return () => clearTimeout(timer);
  }, [screen, running, announcedHeading]);

  // ── Submit answer ─────────────────────────────────────────────────────────
  const submit = () => {
  const currentHeading = announcedRef.current;
  if (!currentHeading) return;
  answeredRef.current = true;

  const typed     = headingInputRef.current.trim();
  const isCorrect = typed === currentHeading;

  console.log("SUBMIT:", { typed, expected: currentHeading, isCorrect }); // debug

  setCallsignStats((prev) => ({
    correct: prev.correct + (isCorrect ? 1 : 0),
    wrong:   prev.wrong   + (isCorrect ? 0 : 1),
    missed:  prev.missed,
    total:   prev.total   + 1,
  }));

    setFeedback({
      text: isCorrect
        ? `Heading call: Correct response ${typed}`
        : `Heading call: Wrong response ${typed || "---"}`,
      tone: isCorrect ? "green" : "red",
    });

    setHeadingInput("");
    setAnnouncedHeading("");
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#a6afbe)] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex h-full flex-col items-center justify-center text-center text-[#4a4a4a]">

        <div className="text-[21px] font-medium">Your callsign:</div>
        <div className="mt-1 text-[28px] font-black tracking-[0.01em] text-[#0b8f00]">
          {callsign}
        </div>

        <div className="mt-[38px] text-[21px] font-bold">New heading:</div>

        <input
          ref={inputRef}
          inputMode="numeric"
          autoComplete="off"
          value={headingInput}
          onChange={(e) => setHeadingInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          className={`mt-3 h-[48px] w-[160px] border-[3px] border-[#5b5b5b] text-center text-[26px] font-semibold text-black outline-none ${
            announcedHeading || headingInput ? "bg-[#fff200]" : "bg-white"
          }`}
          placeholder=""
        />

      </div>
    </div>
  );
}


