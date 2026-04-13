import React, { useEffect } from "react";
import { clamp, rand } from "../utils/math";

export default function TanksTile({
  screen,
  running,
  tanks,
  setTanks,
  activeTankIndexes,
  setActiveTankIndexes,
  refillingTankIndexes,
  setRefillingTankIndexes,
  tankBlinkOn,
  setTankBlinkOn,
  nextTankStartRef,
  secondTankThresholdRef,
  setLightsScore,
  setFeedback,
}) {
  useEffect(() => {
    if (screen !== "live" || !running) return;

    const tankLoop = setInterval(() => {
      setTanks((prev) => {
        const next = [...prev];

        if (refillingTankIndexes.length > 0) {
          refillingTankIndexes.forEach((tankIndex) => {
            const refillSpeed =
              tankIndex === 0 ? 7.5 : tankIndex === 1 ? 7.0 : 7.25;
            next[tankIndex] = clamp(next[tankIndex] + refillSpeed, 0, 100);
          });

          const completedIndexes = refillingTankIndexes.filter(
            (tankIndex) => next[tankIndex] >= 100
          );

          if (completedIndexes.length > 0) {
            completedIndexes.forEach((tankIndex) => {
              next[tankIndex] = 100;
            });

            setRefillingTankIndexes((prevIndexes) =>
              prevIndexes.filter(
                (tankIndex) => !completedIndexes.includes(tankIndex)
              )
            );

            setActiveTankIndexes((prevIndexes) => {
              const remaining = prevIndexes.filter(
                (tankIndex) => !completedIndexes.includes(tankIndex)
              );

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

        const drainingIndexes = activeTankIndexes.filter(
          (tankIndex) => !refillingTankIndexes.includes(tankIndex)
        );

        drainingIndexes.forEach((tankIndex) => {
          const drainSpeed =
            tankIndex === 0 ? 0.72 : tankIndex === 1 ? 0.62 : 0.67;

          next[tankIndex] = clamp(
            next[tankIndex] - drainSpeed - rand(0.01, 0.08),
            0,
            100
          );
        });

        const belowThresholdExists = drainingIndexes.some(
          (tankIndex) => next[tankIndex] < secondTankThresholdRef.current
        );

        const availableIndexes = [0, 1, 2].filter(
          (tankIndex) =>
            !activeTankIndexes.includes(tankIndex) &&
            !refillingTankIndexes.includes(tankIndex)
        );

        if (
          belowThresholdExists &&
          activeTankIndexes.length < 2 &&
          availableIndexes.length > 0 &&
          Math.random() < 0.03
        ) {
          const extraTank =
            availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
          setActiveTankIndexes((prevIndexes) => [...prevIndexes, extraTank]);
        }

        return next;
      });
    }, 120);

    return () => clearInterval(tankLoop);
  }, [
    screen,
    running,
    activeTankIndexes,
    refillingTankIndexes,
    setTanks,
    setActiveTankIndexes,
    setRefillingTankIndexes,
    nextTankStartRef,
    secondTankThresholdRef,
  ]);

  useEffect(() => {
    if (screen !== "live" || !running) return;

    const tankPenalty = setInterval(() => {
      setTanks((prev) => {
        const anyCriticalActiveTank = activeTankIndexes.some(
          (tankIndex) =>
            prev[tankIndex] <= 2 &&
            !refillingTankIndexes.includes(tankIndex)
        );

        if (!anyCriticalActiveTank) return prev;

        setLightsScore((s) => clamp(s - 4, 0, 100));
        setFeedback({ text: "Performance of tanks is dropping.", tone: "yellow" });
        return prev;
      });
    }, 900);

    return () => clearInterval(tankPenalty);
  }, [
    screen,
    running,
    activeTankIndexes,
    refillingTankIndexes,
    setTanks,
    setLightsScore,
    setFeedback,
  ]);

  useEffect(() => {
    const hasCriticalTank = tanks.some(
      (level, tankIndex) =>
        level <= 10 &&
        activeTankIndexes.includes(tankIndex) &&
        !refillingTankIndexes.includes(tankIndex)
    );

    if (!hasCriticalTank || !running) {
      setTankBlinkOn(true);
      return;
    }

    const blinkTimer = setInterval(() => {
      setTankBlinkOn((prev) => !prev);
    }, 260);

    return () => clearInterval(blinkTimer);
  }, [
    tanks,
    activeTankIndexes,
    refillingTankIndexes,
    running,
    setTankBlinkOn,
  ]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (screen !== "live") return;
      const key = event.key.toLowerCase();

      if (["q", "w", "e"].includes(key)) {
        const index = { q: 0, w: 1, e: 2 }[key];

        setFeedback({ text: "Tank is refilled", tone: "green" });

        setRefillingTankIndexes((prevIndexes) =>
          prevIndexes.includes(index) ? prevIndexes : [...prevIndexes, index]
        );

        if (activeTankIndexes.includes(index)) {
          setLightsScore((s) => clamp(s + 1, 0, 100));
        }

        nextTankStartRef.current = Date.now() + rand(900, 2400);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    screen,
    activeTankIndexes,
    refillingTankIndexes,
    nextTankStartRef,
    setRefillingTankIndexes,
    setLightsScore,
    setFeedback,
  ]);

  return (
    <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#9ca5b5)] px-5 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
      <div className="flex h-full items-center justify-center gap-[18px]">
        {[
          { key: "Q", color: "#e4e800" },
          { key: "W", color: "#ff8b00" },
          { key: "E", color: "#00d800" },
        ].map((item, index) => {
          const isCritical =
            tanks[index] <= 10 &&
            activeTankIndexes.includes(index) &&
            !refillingTankIndexes.includes(index);

          const blinkVisible = !isCritical || tankBlinkOn;

          return (
            <div key={item.key} className="flex flex-col items-center gap-[8px]">
              <div
                className="relative h-[206px] w-[38px] border-[3px] bg-[#b9bfca]"
                style={{
                  borderColor: isCritical && blinkVisible ? "#ff3a3a" : "#2d2d2d",
                  boxShadow:
                    isCritical && blinkVisible
                      ? "0 0 12px rgba(255,58,58,0.45)"
                      : "none",
                }}
              >
                <div
                  className="absolute bottom-0 left-0 w-full transition-all duration-100"
                  style={{
                    height: `${tanks[index]}%`,
                    background: item.color,
                    opacity: blinkVisible ? 1 : 0.18,
                  }}
                />
              </div>

              <div
                className="w-[38px] border-[3px] bg-[#9aa2b1] text-center text-[18px] font-black leading-[36px] text-black"
                style={{
                  borderColor: isCritical && blinkVisible ? "#ff3a3a" : "#2d2d2d",
                  color: isCritical && blinkVisible ? "#ff1a1a" : "#000000",
                }}
              >
                {item.key}
              </div>

              <div
                className="h-[34px] w-[38px] border-[3px]"
                style={{
                  background: item.color,
                  borderColor: isCritical && blinkVisible ? "#ff3a3a" : "#2d2d2d",
                  opacity: blinkVisible ? 1 : 0.18,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}