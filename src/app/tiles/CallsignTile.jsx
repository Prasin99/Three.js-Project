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

function digitsToSpoken(numStr) {
  return numStr.split("").map((d) => NATO[d] ?? d).join(" ");
}

// Exported so App.jsx can generate + persist the student's fixed callsign.
export function generateCallsign(exclude = "") {
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

function generateTask(lastValue = "") {
  const isHeading = Math.random() < 0.5;
  let value;
  do {
    if (isHeading) {
      value = String(Math.floor(Math.random() * (360 - 100 + 1)) + 100);
    } else {
      value = String(Math.floor(Math.random() * (410 - 50 + 1)) + 50);
    }
  } while (value === lastValue);

  return {
    type: isHeading ? "heading" : "flightLevel",
    value,
  };
}

// Probability that any given call is addressed to the student's own callsign.
// Remaining calls are distractors (different callsigns) that must be ignored.
const OWN_CALL_RATIO = 0.4;

// Score step size: each correct response adds this, each wrong/missed subtracts this.
const SCORE_STEP = 20;

// ─────────────────────────────────────────────────────────────────────────────
export default function CallsignTile({ screen, running, setCallsignScore, setFeedback, assignedCallsign }) {
  const [currentTask, setCurrentTask]       = useState(null); // { type, value } or null — only set for OWN calls
  const [distractorActive, setDistractorActive] = useState(false); // true during a distractor window
  const [headingInput, setHeadingInput]     = useState("");
  const [callsignStats, setCallsignStats]   = useState({ correct: 0, wrong: 0, missed: 0, total: 0 });

  const inputRef            = useRef(null);
  const lastValueRef        = useRef("");
  const speechUnlockedRef   = useRef(false);
  const pendingRef          = useRef(null);
  const voicesRef           = useRef([]);
  const unlockInProgressRef = useRef(false);
  const answeredRef         = useRef(false);
  const headingInputRef     = useRef("");
  const currentTaskRef      = useRef(null);
  const distractorActiveRef = useRef(false);

  useEffect(() => { headingInputRef.current = headingInput; }, [headingInput]);
  useEffect(() => { currentTaskRef.current = currentTask; }, [currentTask]);
  useEffect(() => { distractorActiveRef.current = distractorActive; }, [distractorActive]);

  // ── Step-based score adjustment (clamped 0..100) ──────────────────────────
  const adjustScore = (delta) =>
    setCallsignScore((s) => Math.max(0, Math.min(100, s + delta)));

  // ── Core speak function ───────────────────────────────────────────────────
  // spokenCs = the callsign to ANNOUNCE (own or distractor); displayed callsign is always the fixed one.
  const speakCall = (spokenCs, task) => {
    if (!("speechSynthesis" in window)) return false;

    pendingRef.current = { cs: spokenCs, task };

    if (!speechUnlockedRef.current) return false;

    const synth = window.speechSynthesis;
    synth.cancel();
    synth.resume();

    const prefix = task.type === "heading" ? "new heading" : "flight level";
    const text = `${toPhonetic(spokenCs)}, ${prefix}, ${digitsToSpoken(task.value)}`;

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
      if (pendingRef.current?.cs === spokenCs && pendingRef.current?.task?.value === task.value) {
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

  // ── Schedule next call (own or distractor) ───────────────────────────────
  useEffect(() => {
    if (screen !== "live" || !running) return;
    if (currentTask || distractorActive) return; // a window is already open

    const delay = lastValueRef.current ? Math.random() * 4000 + 7000 : 2600;

    const timer = setTimeout(() => {
      const nextTask = generateTask(lastValueRef.current);
      const isOwnCall = Math.random() < OWN_CALL_RATIO;

      const spokenCs = isOwnCall
        ? assignedCallsign
        : generateCallsign(assignedCallsign); // never collides with student's own

      lastValueRef.current = nextTask.value;
      answeredRef.current  = false;

      if (isOwnCall) {
        setCurrentTask(nextTask);
      } else {
        setDistractorActive(true);
      }
      setHeadingInput("");

      const spoken = speakCall(spokenCs, nextTask);

      if (!spoken) {
        const retry = setInterval(() => {
          if (speechUnlockedRef.current) {
            speakCall(spokenCs, nextTask);
            clearInterval(retry);
          }
        }, 200);
        setTimeout(() => clearInterval(retry), 4000);
      }

      setTimeout(() => inputRef.current?.focus(), 100);
    }, delay);

    return () => clearTimeout(timer);
  }, [screen, running, currentTask, distractorActive, assignedCallsign]);

  // ── Response timeout ──────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== "live" || !running) return;
    if (!currentTask && !distractorActive) return;

    const timer = setTimeout(() => {
      if (answeredRef.current) return;
      answeredRef.current = true;

      if (currentTaskRef.current) {
        // Own call — missed response counts against the student
        const missedTask = currentTaskRef.current;
        const taskLabel = missedTask.type === "heading" ? "New Heading" : "Flight Level";

        setCallsignStats((prev) => ({
          ...prev,
          missed: prev.missed + 1,
          total:  prev.total  + 1,
        }));
        adjustScore(-SCORE_STEP);
        setFeedback({ text: `${taskLabel}: Response missed`, tone: "yellow" });
        setCurrentTask(null);
      } else if (distractorActiveRef.current) {
        // Distractor correctly ignored — silent pass, no score change, no feedback
        setDistractorActive(false);
      }

      setHeadingInput("");
    }, 10000);

    return () => clearTimeout(timer);
  }, [screen, running, currentTask, distractorActive, setFeedback]);

  // ── Submit answer ─────────────────────────────────────────────────────────
  const submit = () => {
    // Own-call response window open → evaluate normally
    if (currentTaskRef.current) {
      const task = currentTaskRef.current;
      answeredRef.current = true;

      const typed     = headingInputRef.current.trim();
      const isCorrect = typed === task.value;
      const taskLabel = task.type === "heading" ? "Heading" : "Flight Level";

      setCallsignStats((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        wrong:   prev.wrong   + (isCorrect ? 0 : 1),
        missed:  prev.missed,
        total:   prev.total   + 1,
      }));
      adjustScore(isCorrect ? SCORE_STEP : -SCORE_STEP);

      setFeedback({
        text: isCorrect
          ? `${taskLabel}: Correct response ${typed}`
          : `${taskLabel}: Wrong response ${typed || "---"}`,
        tone: isCorrect ? "green" : "red",
      });

      setHeadingInput("");
      setCurrentTask(null);
      return;
    }

    // Distractor window open → any submission is a false alarm
    if (distractorActiveRef.current) {
      answeredRef.current = true;

      setCallsignStats((prev) => ({
        correct: prev.correct,
        wrong:   prev.wrong + 1,
        missed:  prev.missed,
        total:   prev.total + 1,
      }));
      adjustScore(-SCORE_STEP);

      setFeedback({
        text: "Not your callsign — should have been ignored",
        tone: "red",
      });

      setHeadingInput("");
      setDistractorActive(false);
      return;
    }

    // No window open — ignore stray Enter presses
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const windowOpen = Boolean(currentTask || distractorActive);

  return (
    <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#a6afbe)] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex h-full flex-col items-center justify-center text-center text-[#4a4a4a]">

        <div className="text-[21px] font-medium">Your callsign:</div>
        <div className="mt-1 text-[28px] font-black tracking-[0.01em] text-[#0b8f00]">
          {assignedCallsign || "—"}
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
            windowOpen || headingInput ? "bg-[#fff200]" : "bg-white"
          }`}
          placeholder=""
        />

      </div>
    </div>
  );
}