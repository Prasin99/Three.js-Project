import React, { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ArrowLeft, BellRing, Expand, Pencil, Radio, Target } from "lucide-react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const rand = (min, max) => Math.random() * (max - min) + min;

function Screw({ className = "" }) {
  return (
    <div
      className={`absolute h-[30px] w-[30px] rounded-full border border-[#4f535c] bg-[linear-gradient(135deg,#a9a9a9,#7d7d7d)] shadow-[inset_0_1px_2px_rgba(255,255,255,0.35)] ${className}`}
    >
      <div className="absolute left-1/2 top-1/2 h-[2px] w-[22px] -translate-x-1/2 -translate-y-1/2 rotate-[-45deg] bg-[#696969]" />
    </div>
  );
}

function FrameScrews({ stops }) {
  return (
    <>
      {stops.map((left, index) => (
        <React.Fragment key={`${left}-${index}`}>
          <Screw className="top-[-17px]" style={{ left }} />
          <Screw className="bottom-[-17px]" style={{ left }} />
        </React.Fragment>
      ))}
    </>
  );
}

function MetricBar({ label, value }) {
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

function TimeMetric({ timeLabel }) {
  return (
    <div className="space-y-2">
      <div className="text-center text-[18px] font-bold leading-none text-white">Time</div>
      <div className="h-[42px] bg-[#47433f] p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="flex h-full items-center justify-center bg-[#ff3e3e] text-[16px] font-bold text-white">
          {timeLabel}
        </div>
      </div>
    </div>
  );
}

function IntroCard({ icon, title, text }) {
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

function HorizonPanel({ running, onScore }) {
  const mountRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const perfRef = useRef({ score: 72 });
  const runningRef = useRef(running);
  const simTimeRef = useRef(0);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
    camera.position.z = 10;

    const attitudeGroup = new THREE.Group();
    scene.add(attitudeGroup);

    const sky = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 36),
      new THREE.MeshBasicMaterial({ color: 0x13a4d7 })
    );
    sky.position.set(0, 9, 0);
    attitudeGroup.add(sky);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(36, 36),
      new THREE.MeshBasicMaterial({ color: 0xc17000 })
    );
    ground.position.set(0, -9, 0);
    attitudeGroup.add(ground);

    const horizonLine = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 0.22),
      new THREE.MeshBasicMaterial({ color: 0xfaf7ef })
    );
    horizonLine.position.set(0, 0.6, 0.5);
    horizonLine.rotation.z = THREE.MathUtils.degToRad(7);
    attitudeGroup.add(horizonLine);

    const bankTickMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.98 });
    const createBankTick = (angleDeg, length, width = 0.1) => {
      const radius = 2.95;
      const angle = THREE.MathUtils.degToRad(angleDeg);
      const tick = new THREE.Mesh(new THREE.PlaneGeometry(width, length), bankTickMat);
      tick.position.set(Math.cos(angle) * radius, 3.65 + Math.sin(angle) * radius, 0.92);
      tick.rotation.z = -angle;
      scene.add(tick);
    };

    [-145, -132, -119, -106, -93, -80, -67, -54, -41].forEach((deg, index) => {
      createBankTick(deg, index % 2 === 0 ? 0.34 : 0.58, index % 2 === 0 ? 0.08 : 0.1);
    });

    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(0, 0.52);
    triangleShape.lineTo(-0.56, -0.28);
    triangleShape.lineTo(0.56, -0.28);
    triangleShape.lineTo(0, 0.52);
    const bankCue = new THREE.Mesh(
      new THREE.ShapeGeometry(triangleShape),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    bankCue.position.set(0.48, 3.18, 0.95);
    bankCue.scale.set(0.72, 0.72, 1);
    scene.add(bankCue);

    const aircraftMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const leftWing = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 0.12), aircraftMat);
    leftWing.position.set(-2.1, -0.85, 1.02);
    leftWing.rotation.z = THREE.MathUtils.degToRad(15);
    scene.add(leftWing);

    const rightWing = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 0.12), aircraftMat);
    rightWing.position.set(2.1, -0.85, 1.02);
    rightWing.rotation.z = THREE.MathUtils.degToRad(-15);
    scene.add(rightWing);

    const crossMat = new THREE.MeshBasicMaterial({ color: 0x1dff1d });
    const verticalGuide = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 36), crossMat);
    scene.add(verticalGuide);
    const horizontalGuide = new THREE.Mesh(new THREE.PlaneGeometry(36, 0.14), crossMat);
    scene.add(horizontalGuide);

    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 1.18, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 1.02, 0, Math.PI * 2, true);
    ringShape.holes.push(hole);
    const ringGeometry = new THREE.ShapeGeometry(ringShape, 72);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x31ff31, transparent: true, opacity: 0.98 });
    const cursorRing = new THREE.Mesh(ringGeometry, ringMaterial);
    cursorRing.position.set(0, 0, 1.3);
    scene.add(cursorRing);

    const target = { x: 0, y: 2.45, vx: 1.15, vy: -0.85, ax: 0, ay: 0, timer: 0.48 };
    const motion = { roll: 0, pitch: 0, driftX: 0, timer: 0.48 };

    const resize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };

    const toScene = (clientX, clientY) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
      return { x: nx * camera.right, y: ny * camera.top };
    };

    const onPointerMove = (event) => {
      const p = toScene(event.clientX, event.clientY);
      mouseRef.current = {
        x: clamp(p.x, -9.2, 9.2),
        y: clamp(p.y, -9.2, 9.2),
      };
    };

    mount.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    let frame = 0;

    const animate = () => {
      const rawDt = clock.getDelta();
      const dt = runningRef.current ? rawDt : 0;
      if (runningRef.current) {
        simTimeRef.current += dt;
        const t = simTimeRef.current;

        motion.timer -= dt;
        if (motion.timer <= 0) {
          motion.roll = rand(-1.35, 1.35);
          motion.pitch = rand(-0.42, 0.42);
          motion.driftX = rand(-0.18, 0.18);
          motion.timer = rand(0.5, 0.95);
        }

        const rollDeg = Math.sin(t * 0.34) * 2.1 + Math.sin(t * 0.88) * 0.45 + motion.roll;
        const pitch = Math.sin(t * 0.28) * 0.44 + Math.sin(t * 0.95) * 0.1 + motion.pitch;
        const driftX = Math.sin(t * 0.22) * 0.13 + Math.sin(t * 0.72) * 0.05 + motion.driftX;

        attitudeGroup.rotation.z = THREE.MathUtils.lerp(
          attitudeGroup.rotation.z,
          THREE.MathUtils.degToRad(rollDeg),
          0.08
        );
        attitudeGroup.position.y = THREE.MathUtils.lerp(attitudeGroup.position.y, pitch, 0.07);
        attitudeGroup.position.x = THREE.MathUtils.lerp(attitudeGroup.position.x, driftX, 0.055);

        target.timer -= dt;
        if (target.timer <= 0) {
          target.ax = rand(-1.45, 1.45);
          target.ay = rand(-1.45, 1.45);
          target.timer = rand(0.5, 0.95);
        }

        target.vx = clamp(target.vx + target.ax * dt, -2.0, 2.0);
        target.vy = clamp(target.vy + target.ay * dt, -2.0, 2.0);
        target.x += target.vx * dt;
        target.y += target.vy * dt;

        if (target.x < -9 || target.x > 9) {
          target.vx *= -1;
          target.x = clamp(target.x, -9, 9);
        }
        if (target.y < -9 || target.y > 9) {
          target.vy *= -1;
          target.y = clamp(target.y, -9, 9);
        }

        verticalGuide.position.x = target.x;
        horizontalGuide.position.y = target.y;
        cursorRing.position.set(mouseRef.current.x, mouseRef.current.y, 1.3);

        const dx = mouseRef.current.x - target.x;
        const dy = mouseRef.current.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1.1) {
          cursorRing.material.color.set(0x31ff31);
          perfRef.current.score = clamp(perfRef.current.score + dt * 10, 0, 100);
        } else if (dist < 2.25) {
          cursorRing.material.color.set(0xffdf26);
          perfRef.current.score = clamp(perfRef.current.score - dt * 6, 0, 100);
        } else {
          cursorRing.material.color.set(0xff4d3f);
          perfRef.current.score = clamp(perfRef.current.score - dt * 14, 0, 100);
        }

        onScore(perfRef.current.score);
      }

      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(frame);
      mount.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [onScore]);

  return <div ref={mountRef} className="h-full w-full overflow-hidden rounded-[28px]" />;
}

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

  const [tanks, setTanks] = useState([78, 100]);
  const [activeTankIndex, setActiveTankIndex] = useState(0);
  const [refillingTankIndex, setRefillingTankIndex] = useState(null);
  const [tankBlinkOn, setTankBlinkOn] = useState(true);
  const nextTankStartRef = useRef(Date.now() + 1800);

  const [callsign] = useState("GS743");
  const [prompt, setPrompt] = useState("Stand by");
  const [announcedNumber, setAnnouncedNumber] = useState("");
  const [headingInput, setHeadingInput] = useState("");
  const [callsignStats, setCallsignStats] = useState({ correct: 1, wrong: 1, missed: 0, total: 2 });
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

  const timeLabel = `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`;

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

    const utterance = new SpeechSynthesisUtterance(`${speakCallsign}, new level, ${speakDigits}`);
    const voices = voicesRef.current.length ? voicesRef.current : synth.getVoices();
    const preferredVoice =
      voices.find((voice) => /en/i.test(voice.lang) && /(Google|Samantha|Daniel|Karen|Moira|Alex)/i.test(voice.name)) ||
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
    if (screen !== "live" || !running) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [screen, running]);

  useEffect(() => {
    if (screen !== "live" || !running) return;

    const tankLoop = setInterval(() => {
      setTanks((prev) => {
        const next = [...prev];

        if (refillingTankIndex !== null) {
          const refillSpeed = refillingTankIndex === 0 ? 7.5 : 7.0;
          next[refillingTankIndex] = clamp(next[refillingTankIndex] + refillSpeed, 0, 100);

          if (next[refillingTankIndex] >= 100) {
            next[refillingTankIndex] = 100;
            setRefillingTankIndex(null);
            setActiveTankIndex(null);
            nextTankStartRef.current = Date.now() + rand(900, 2400);
          }

          return next;
        }

        if (activeTankIndex === null) {
          if (Date.now() >= nextTankStartRef.current) {
            setActiveTankIndex(Math.random() > 0.5 ? 0 : 1);
          }
          return next;
        }

        const drainSpeed = activeTankIndex === 0 ? 0.72 : 0.62;
        next[activeTankIndex] = clamp(next[activeTankIndex] - drainSpeed - rand(0.01, 0.08), 0, 100);
        return next;
      });
    }, 120);

    return () => clearInterval(tankLoop);
  }, [screen, running, activeTankIndex, refillingTankIndex]);

  useEffect(() => {
    if (screen !== "live" || !running) return;
    const tankPenalty = setInterval(() => {
      setTanks((prev) => {
        if (refillingTankIndex !== null) return prev;
        if (prev[activeTankIndex] > 2) return prev;
        setLightsScore((s) => clamp(s - 4, 0, 100));
        setFeedback({ text: "Performance of tanks is dropping.", tone: "yellow" });
        return prev;
      });
    }, 900);
    return () => clearInterval(tankPenalty);
  }, [screen, running, activeTankIndex, refillingTankIndex]);

  useEffect(() => {
    const hasCriticalTank = tanks.some((level, index) => level <= 10 && refillingTankIndex !== index);
    if (!hasCriticalTank || !running) {
      setTankBlinkOn(true);
      return;
    }

    const blinkTimer = setInterval(() => {
      setTankBlinkOn((prev) => !prev);
    }, 260);

    return () => clearInterval(blinkTimer);
  }, [tanks, refillingTankIndex, running]);

  useEffect(() => {
    if (screen !== "live" || !running) return;
    const lightLoop = setInterval(() => {
      setLightsEvent({
        row: Math.random() > 0.5 ? 1 : 0,
        col: Math.floor(Math.random() * 3),
        color: Math.random() > 0.38 ? "blue" : "yellow",
        active: true,
      });
    }, 1650);
    return () => clearInterval(lightLoop);
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
    }, 1100);
    return () => clearTimeout(missTimer);
  }, [screen, running, lightsEvent]);

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
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis && !running) {
      window.speechSynthesis.cancel();
    }
  }, [running]);

  useEffect(() => {
    if (screen !== "live" || !running || announcedNumber) return;

    const delay = lastCallRef.current ? rand(7000, 11000) : 2600;
    const nextCallTimer = setTimeout(() => {
      const options = levelPoolRef.current.filter((value) => value !== lastCallRef.current);
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
  }, [screen, running, announcedNumber]);

  useEffect(() => {
    const timeout = setTimeout(() => setPulse(null), 320);
    return () => clearTimeout(timeout);
  }, [pulse]);

  useEffect(() => {
    if (!feedback.text) return;
    const clearTimer = setTimeout(() => {
      setFeedback((prev) => (prev.text ? { text: "", tone: "green" } : prev));
    }, 2200);
    return () => clearTimeout(clearTimer);
  }, [feedback.text]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (screen !== "live") return;
      const key = event.key.toLowerCase();

      if (["q", "w"].includes(key)) {
        const index = { q: 0, w: 1 }[key];

        setFeedback({ text: "Tank is refilled", tone: "green" });
        setRefillingTankIndex(index);

        if (index === activeTankIndex) {
          setLightsScore((s) => clamp(s + 1, 0, 100));
        }

        nextTankStartRef.current = Date.now() + rand(900, 2400);
      }

      if (["a", "s", "d"].includes(key)) {
        const col = { a: 0, s: 1, d: 2 }[key];
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
  }, [screen, lightsEvent, activeTankIndex]);

  const combinedLightTankScore = useMemo(() => {
    const tankPart = tanks.reduce((sum, tank) => sum + tank, 0) / tanks.length;
    return clamp(tankPart * 0.58 + lightsScore * 0.42, 0, 100);
  }, [tanks, lightsScore]);

  const warningText = useMemo(() => {
    if (tanks.some((level, index) => level < 34 && refillingTankIndex !== index)) {
      return "Performance of tanks is dropping.";
    }
    if (refillingTankIndex !== null) {
      return "Tank is refilling.";
    }
    if (activeTankIndex !== null && combinedLightTankScore < 70) {
      return "Performance of tanks is dropping.";
    }
    return "";
  }, [combinedLightTankScore, tanks, refillingTankIndex, activeTankIndex]);

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
      text: isCorrect ? `Level call: Correct response ${typed}` : `Level call: Wrong response ${typed || "---"}`,
      tone: isCorrect ? "green" : "red",
    });
    setPrompt(isCorrect ? "Correct, stand by" : "Incorrect, stand by");
    setHeadingInput("");
    setAnnouncedNumber("");
  };

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
              <IntroCard
                icon={<Target className="h-5 w-5" />}
                title="Horizon Tracking"
                text="Track the flight director crossing point with your mouse cursor. Keep the circle green within the tolerance area."
              />
              <IntroCard
                icon={<BellRing className="h-5 w-5" />}
                title="Alert Lights"
                text="Press the assigned letter key when blue lights flash. Ignore yellow signals. Wrong or missed responses reduce your score."
              />
              <IntroCard
                icon={<div className="text-[20px] font-bold">⌸</div>}
                title="Color Tanks"
                text="Monitor tank levels and refill only when a level falls below one third. Refill the correct tank and avoid early responses."
              />
              <IntroCard
                icon={<Radio className="h-5 w-5" />}
                title="Callsign Response"
                text="A random number is announced for your callsign. Type the announced value and press Enter before the next call arrives."
              />
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setScreen("live")}
                className="rounded-[10px] bg-[#2e79e6] px-7 py-3 text-[16px] font-semibold text-white shadow-sm hover:bg-[#2368cc]"
              >
                Start Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#4d5565] text-white">
      <div className="mx-auto flex h-full max-w-[1660px] flex-col px-[56px] pb-[34px] pt-[10px]">
        <div className="flex h-[112px] items-start justify-end">
          <div className="flex items-center gap-[10px] rounded-bl-[26px] rounded-br-[10px] bg-[#315fc0] px-[28px] py-[10px] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <div className="min-w-[188px] text-[20px] font-bold tracking-[0.01em] text-white">Time: {timeLabel}</div>
            <button
              onClick={() => setRunning((prev) => !prev)}
              className="min-w-[124px] rounded-[10px] bg-[#f4f4f4] px-6 py-[9px] text-[17px] font-bold text-[#2f2f2f] shadow-[0_1px_0_rgba(0,0,0,0.1)] hover:bg-white"
            >
              {running ? "Pause" : "Resume"}
            </button>
            <button
              onClick={() => setScreen("intro")}
              className="min-w-[104px] rounded-[10px] bg-[#f4f4f4] px-6 py-[9px] text-[17px] font-bold text-[#2f2f2f] shadow-[0_1px_0_rgba(0,0,0,0.1)] hover:bg-white"
            >
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
              <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#9ca5b5)] p-[12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <div className="h-full overflow-hidden rounded-[26px] bg-[#96a0b2]">
                  <HorizonPanel running={running} onScore={setHorizonScore} />
                </div>
              </div>

              <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#9ca5b5)] px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <div className="flex h-full flex-col items-center justify-center gap-9">
                  <div className="grid grid-cols-3 gap-x-[22px] gap-y-[18px]">
                    {Array.from({ length: 6 }).map((_, index) => {
                      const col = index % 3;
                      const row = Math.floor(index / 3);
                      const active = lightsEvent.active && lightsEvent.col === col && lightsEvent.row === row;
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

                  <div className="grid grid-cols-3 gap-x-[28px] text-[30px] font-black leading-none text-black">
                    {['A', 'S', 'D'].map((key) => (
                      <div key={key} className="flex flex-col items-center gap-2">
                        <span>{key}</span>
                        <div
                          className={`h-[6px] w-[34px] rounded-full ${
                            pulse?.key === key ? (pulse.ok ? "bg-[#1fff5d]" : "bg-[#ff3a3a]") : "bg-transparent"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#9ca5b5)] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <div className="flex h-full items-center justify-center gap-[24px]">
                  {[
                    { key: "Q", color: "#e4e800" },
                    { key: "W", color: "#ff8b00" },
                  ].map((item, index) => {
                    const isCritical = tanks[index] <= 10 && refillingTankIndex !== index;
                    const blinkVisible = !isCritical || tankBlinkOn;
                    return (
                      <div key={item.key} className="flex flex-col items-center gap-[8px]">
                        <div
                          className="relative h-[206px] w-[38px] border-[3px] bg-[#b9bfca]"
                          style={{
                            borderColor: isCritical && blinkVisible ? "#ff3a3a" : "#2d2d2d",
                            boxShadow: isCritical && blinkVisible ? "0 0 12px rgba(255,58,58,0.45)" : "none",
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

              <div className="rounded-[28px] bg-[linear-gradient(180deg,#b0b7c6,#a6afbe)] px-6 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                <div className="flex h-full flex-col items-center justify-center text-center text-[#4a4a4a]">
                  <div className="text-[21px] font-medium">Your callsign:</div>
                  <div className="mt-1 text-[28px] font-black tracking-[0.01em] text-[#0b8f00]">{callsign}</div>

                  <div className="mt-[38px] text-[14px] font-semibold uppercase tracking-[0.12em] text-[#676767]">
                    {prompt}
                  </div>
                  <div className="mt-[10px] text-[21px] font-bold">New level:</div>
                  <input
                    ref={inputRef}
                    inputMode="numeric"
                    autoComplete="off"
                    value={headingInput}
                    onChange={(e) => setHeadingInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitHeading();
                    }}
                    className={`mt-4 h-[48px] w-[146px] border-[3px] border-[#5b5b5b] text-center text-[26px] font-semibold text-black outline-none ${
                      announcedNumber || headingInput ? "bg-[#fff200]" : "bg-white"
                    }`}
                    placeholder=""
                  />
                  <div className="mt-[10px] text-[13px] font-semibold text-[#5e5e5e]">
                    {speechUnlockedRef.current ? "Type 3 digits and press Enter" : "Click once to enable audio"}
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    <div className="mt-1 text-[21px] leading-[1.2] text-[#ffff00]">{warningText || " "}</div>
                  </div>
                </div>

                <div className="space-y-[22px]">
                  <MetricBar label="Callsign Performance" value={callsignScore} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-h-[42px] items-center justify-center text-center text-[18px] font-bold tracking-[0.01em]">
            {feedback.text ? (
              <span
                className={
                  feedback.tone === "green"
                    ? "text-[#24ff24]"
                    : feedback.tone === "yellow"
                    ? "text-[#ffff00]"
                    : "text-[#ff4e4e]"
                }
              >
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