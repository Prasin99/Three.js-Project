import React, { useEffect, useState } from "react";
import { clamp, rand } from "../utils/math";

export default function AlertLightsTile({
  screen,
  running,
  setLightsScore,
  setFeedback,
}) {
  const [lightsEvent, setLightsEvent] = useState({
    row: 0,
    col: 0,
    color: "blue",
    active: false,
  });
  const [pulse, setPulse] = useState(null);

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

      setLightsEvent({
        row: yellowRow,
        col: yellowCol,
        color: "yellow",
        active: true,
      });

      blueTimeout = setTimeout(() => {
        if (cancelled) return;

        const blueRow = Math.random() > 0.5 ? 1 : 0;
        const blueCol = Math.floor(Math.random() * 4);

        setLightsEvent({
          row: blueRow,
          col: blueCol,
          color: "blue",
          active: true,
        });

        nextCycleTimeout = setTimeout(() => {
          runLightSequence();
        }, rand(4200, 5200));  //blue
      }, rand(3000, 5000));  //yellow
    };

    yellowTimeout = setTimeout(() => {
      runLightSequence();
    }, rand(1200, 2200));

    return () => {
      cancelled = true;
      if (yellowTimeout) clearTimeout(yellowTimeout);
      if (blueTimeout) clearTimeout(blueTimeout);
      if (nextCycleTimeout) clearTimeout(nextCycleTimeout);
    };
  }, [screen, running]);

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
    }, 4000);

    return () => clearTimeout(missTimer);
  }, [screen, running, lightsEvent, setLightsScore, setFeedback]);

  useEffect(() => {
    const timeout = setTimeout(() => setPulse(null), 320);
    return () => clearTimeout(timeout);
  }, [pulse]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (screen !== "live") return;
      const key = event.key.toLowerCase();

      if (["a", "s", "d", "f"].includes(key)) {
        const col = { a: 0, s: 1, d: 2, f: 3 }[key];
        const correct =
          lightsEvent.active &&
          lightsEvent.color === "blue" &&
          lightsEvent.col === col;
        const wrongYellow =
          lightsEvent.active &&
          lightsEvent.color === "yellow" &&
          lightsEvent.col === col;

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
  }, [screen, lightsEvent, setLightsScore, setFeedback]);

  return (
    <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#9ca5b5)] px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex h-full flex-col items-center justify-center gap-9">
        <div className="grid grid-cols-4 gap-x-[18px] gap-y-[18px]">
          {Array.from({ length: 8 }).map((_, index) => {
            const col = index % 4;
            const row = Math.floor(index / 3);
            const active =
              lightsEvent.active &&
              lightsEvent.col === col &&
              lightsEvent.row === row;

            const color = active
              ? lightsEvent.color === "blue"
                ? "#4d9fff"
                : "#ffca05"
              : "#454545";

            const glow = active
              ? lightsEvent.color === "blue"
                ? "0 0 12px rgba(77,159,255,0.45)"
                : "0 0 10px rgba(255,202,5,0.35)"
              : "none";

            return (
              <div
                key={index}
                className="h-[46px] w-[46px] rounded-full border-[4px] border-black"
                style={{ background: color, boxShadow: glow }}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-4 gap-x-[18px] text-[30px] font-black leading-none text-black">
          {["A", "S", "D", "F"].map((key) => (
            <div key={key} className="flex flex-col items-center gap-2">
              <span>{key}</span>
              <div
                className={`h-[6px] w-[34px] rounded-full ${
                  pulse?.key === key
                    ? pulse.ok
                      ? "bg-[#1fff5d]"
                      : "bg-[#ff3a3a]"
                    : "bg-transparent"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}