import React, { useEffect, useRef, useState } from "react";
import { rand } from "../utils/math";

export default function CallsignTile({
  screen,
  running,
  setCallsignScore,
  setFeedback,
}) {
  const [callsign] = useState("GS743");
  const [prompt, setPrompt] = useState("Stand by");
  const [announcedNumber, setAnnouncedNumber] = useState("");
  const [headingInput, setHeadingInput] = useState("");
  const [callsignStats, setCallsignStats] = useState({
    correct: 1,
    wrong: 1,
    missed: 0,
    total: 2,
  });

  const inputRef = useRef(null);
  const lastCallRef = useRef("");
  const speechUnlockedRef = useRef(false);
  const pendingSpeechRef = useRef(null);
  const voicesRef = useRef([]);
  const unlockInProgressRef = useRef(false);
  const levelPoolRef = useRef([
    "100",
    "150",
    "200",
    "250",
    "300",
    "350",
    "400",
    "450",
    "500",
    "550",
    "600",
    "650",
    "700",
    "750",
    "800",
    "850",
    "900",
  ]);

  const speakLevelCall = (value) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }

    pendingSpeechRef.current = value;

    if (!speechUnlockedRef.current) {
      setPrompt("Click once to enable audio");
      return false;
    }

    const synth = window.speechSynthesis;
    const speakCallsign = callsign.split("").join(" ");
    const speakDigits = value.split("").join(" ");

    synth.cancel();
    synth.resume();

    const utterance = new SpeechSynthesisUtterance(
      `${speakCallsign}, new level, ${speakDigits}`
    );

    const voices = voicesRef.current.length
      ? voicesRef.current
      : synth.getVoices();

    const preferredVoice =
      voices.find(
        (voice) =>
          /en/i.test(voice.lang) &&
          /(Google|Samantha|Daniel|Karen|Moira|Alex)/i.test(voice.name)
      ) ||
      voices.find((voice) => /en/i.test(voice.lang)) ||
      null;

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    } else {
      utterance.lang = "en-US";
    }

    utterance.rate = 0.82;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setPrompt("Listen and enter the level");
    };

    utterance.onend = () => {
      if (pendingSpeechRef.current === value) {
        pendingSpeechRef.current = null;
      }
    };

    setTimeout(() => {
      synth.speak(utterance);
    }, 60);

    return true;
  };

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      if (availableVoices.length) {
        voicesRef.current = availableVoices;
      }
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    const unlockSpeech = () => {
      if (speechUnlockedRef.current || unlockInProgressRef.current) return;
      unlockInProgressRef.current = true;
      speechUnlockedRef.current = true;
      synth.resume();

      const warmup = new SpeechSynthesisUtterance("audio enabled");
      warmup.volume = 0.01;
      warmup.rate = 1;
      warmup.pitch = 1;

      warmup.onend = () => {
        unlockInProgressRef.current = false;
        if (pendingSpeechRef.current) {
          const queuedValue = pendingSpeechRef.current;
          setTimeout(() => {
            speakLevelCall(queuedValue);
          }, 120);
        }
      };

      synth.cancel();
      synth.speak(warmup);
    };

    window.addEventListener("pointerdown", unlockSpeech);
    window.addEventListener("mousedown", unlockSpeech);
    window.addEventListener("touchstart", unlockSpeech);
    window.addEventListener("keydown", unlockSpeech);

    return () => {
      window.removeEventListener("pointerdown", unlockSpeech);
      window.removeEventListener("mousedown", unlockSpeech);
      window.removeEventListener("touchstart", unlockSpeech);
      window.removeEventListener("keydown", unlockSpeech);
      synth.onvoiceschanged = null;
    };
  }, [callsign]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && !running) {
      window.speechSynthesis.cancel();
    }
  }, [running]);

  useEffect(() => {
    if (screen !== "live" || !running || announcedNumber) return;

    const delay = lastCallRef.current ? rand(7000, 11000) : 2600;

    const nextCallTimer = setTimeout(() => {
      const options = levelPoolRef.current.filter(
        (value) => value !== lastCallRef.current
      );
      const next = options[Math.floor(Math.random() * options.length)];

      lastCallRef.current = next;
      setAnnouncedNumber(next);
      setHeadingInput("");
      setPrompt("Listen and enter the level");
      speakLevelCall(next);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }, delay);

    return () => {
      clearTimeout(nextCallTimer);
    };
  }, [screen, running, announcedNumber, callsign]);

  useEffect(() => {
    if (screen !== "live" || !running || !announcedNumber) return;

    const responseTimer = setTimeout(() => {
      setCallsignStats((prev) => {
        const next = {
          correct: prev.correct,
          wrong: prev.wrong,
          missed: prev.missed + 1,
          total: prev.total + 1,
        };
        setCallsignScore((next.correct / next.total) * 100);
        return next;
      });

      setFeedback({ text: "Level call: Response missed", tone: "yellow" });
      setPrompt("Stand by");
      setHeadingInput("");
      setAnnouncedNumber("");
    }, 5600);

    return () => clearTimeout(responseTimer);
  }, [screen, running, announcedNumber, setCallsignScore, setFeedback]);

  const submitHeading = () => {
    if (!announcedNumber) return;

    const typed = headingInput.trim();
    const isCorrect = typed === announcedNumber;

    setCallsignStats((prev) => {
      const next = {
        correct: prev.correct + (isCorrect ? 1 : 0),
        wrong: prev.wrong + (isCorrect ? 0 : 1),
        missed: prev.missed,
        total: prev.total + 1,
      };
      setCallsignScore((next.correct / next.total) * 100);
      return next;
    });

    setFeedback({
      text: isCorrect
        ? `Level call: Correct response ${typed}`
        : `Level call: Wrong response ${typed || "---"}`,
      tone: isCorrect ? "green" : "red",
    });

    setPrompt(isCorrect ? "Correct, stand by" : "Incorrect, stand by");
    setHeadingInput("");
    setAnnouncedNumber("");
  };

  return (
    <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#a6afbe)] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex h-full flex-col items-center justify-center text-center text-[#4a4a4a]">
        <div className="text-[21px] font-medium">Your callsign:</div>
        <div className="mt-1 text-[28px] font-black tracking-[0.01em] text-[#0b8f00]">
          {callsign}
        </div>

        <div className="mt-[38px] text-[14px] font-semibold uppercase tracking-[0.12em] text-[#676767]">
          {prompt}
        </div>

        <div className="mt-[10px] text-[21px] font-bold">New level:</div>

        <input
          ref={inputRef}
          inputMode="numeric"
          autoComplete="off"
          value={headingInput}
          onChange={(e) =>
            setHeadingInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") submitHeading();
          }}
          className={`mt-4 h-[48px] w-[146px] border-[3px] border-[#5b5b5b] text-center text-[26px] font-semibold text-black outline-none ${
            announcedNumber || headingInput ? "bg-[#fff200]" : "bg-white"
          }`}
          placeholder=""
        />

        <div className="mt-[10px] text-[13px] font-semibold text-[#5e5e5e]">
          {speechUnlockedRef.current
            ? "Type 3 digits and press Enter"
            : "Click once to enable audio"}
        </div>
      </div>
    </div>
  );
}