import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { clamp, rand } from "../utils/math";

export default function HorizonTile({ running, onScore }) {
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

    // const sky = new THREE.Mesh(
    //   new THREE.PlaneGeometry(36, 36),
    //   new THREE.MeshBasicMaterial({ color: 0x13a4d7 })
    // );
    // //sky.position.set(0, 9, 0);
    // sky.position.set(0, 18, 0);
    // attitudeGroup.add(sky);

    // const ground = new THREE.Mesh(
    //   new THREE.PlaneGeometry(36, 36),
    //   new THREE.MeshBasicMaterial({ color: 0xc17000 })
    // );
    // //ground.position.set(0, -9, 0);
    // ground.position.set(0, -18, 0);
    // attitudeGroup.add(ground);

    // const horizonLine = new THREE.Mesh(
    //   new THREE.PlaneGeometry(40, 0.22),
    //   new THREE.MeshBasicMaterial({ color: 0xfaf7ef })
    // );
    // //horizonLine.position.set(0, 0.6, 0.5);
    // horizonLine.position.set(0, 0, 0.5);
    // //horizonLine.rotation.z = THREE.MathUtils.degToRad(7);
    // horizonLine.rotation.z = 0;
    // attitudeGroup.add(horizonLine);

    // AFTER (the fix):
// Sky fills entire top half — make it huge so it always covers the instrument
// at any roll angle. Center it at y=0, offset upward by half its own height.
const sky = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshBasicMaterial({ color: 0x13a4d7 })
);
sky.position.set(0, 30, 0);   // still offset so it covers "above horizon"
attitudeGroup.add(sky);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshBasicMaterial({ color: 0xc17000 })
);
ground.position.set(0, -30, 0);   // still offset so it covers "below horizon"
attitudeGroup.add(ground);

// A large background plane at the center fills any gap between sky and ground
// during rotation — this is the real fix
const centerFill = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshBasicMaterial({ color: 0x13a4d7 })  // same color as sky
);
centerFill.position.set(0, 0, -0.1);   // slightly behind sky/ground
attitudeGroup.add(centerFill);

// Ground overlay: a large plane starting at y=0 going downward
const groundFill = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshBasicMaterial({ color: 0xc17000 })
);
groundFill.position.set(0, -30, -0.05);
attitudeGroup.add(groundFill);

const horizonLine = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 0.22),
  new THREE.MeshBasicMaterial({ color: 0xfaf7ef })
);
horizonLine.position.set(0, 0, 0.5);
horizonLine.rotation.z = 0;
attitudeGroup.add(horizonLine);

    const bankTickMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.98,
    });

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
    ringShape.absarc(0, 0, 1.35, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 1.15, 0, Math.PI * 2, true);
    ringShape.holes.push(hole);

    const ringGeometry = new THREE.ShapeGeometry(ringShape, 72);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x31ff31,
      transparent: true,
      opacity: 0.98,
    });
    const cursorRing = new THREE.Mesh(ringGeometry, ringMaterial);
    cursorRing.position.set(0, 0, 1.3);
    scene.add(cursorRing);

    const target = { x: 0, y: 2.45, vx: 1.15, vy: -0.85, ax: 0, ay: 0, timer: 0.48 };
    //const motion = { roll: 0, pitch: 0, driftX: 0, timer: 0.48 };
    const motion = { roll: 0, pitch: 0, driftX: 0, timer: 0.0 };

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

        // motion.timer -= dt;
        // if (motion.timer <= 0) {
        //   motion.roll = rand(-1.35, 1.35);
        //   motion.pitch = rand(-0.42, 0.42);
        //   motion.driftX = rand(-0.18, 0.18);
        //   motion.timer = rand(0.5, 0.95);
        // }

        // const rollDeg = Math.sin(t * 0.34) * 2.1 + Math.sin(t * 0.88) * 0.45 + motion.roll;
        // const pitch = Math.sin(t * 0.28) * 0.44 + Math.sin(t * 0.95) * 0.1 + motion.pitch;
        // const driftX = Math.sin(t * 0.22) * 0.13 + Math.sin(t * 0.72) * 0.05 + motion.driftX;

        // attitudeGroup.rotation.z = THREE.MathUtils.lerp(
        //   attitudeGroup.rotation.z,
        //   THREE.MathUtils.degToRad(rollDeg),
        //   0.08
        // );
        // attitudeGroup.position.y = THREE.MathUtils.lerp(attitudeGroup.position.y, pitch, 0.07);
        // attitudeGroup.position.x = THREE.MathUtils.lerp(attitudeGroup.position.x, driftX, 0.055);

motion.timer -= dt;
if (motion.timer <= 0) {
  //motion.roll  = rand(-55, 55);   
  //motion.pitch = rand(-3.5, 3.5);  
  motion.driftX = rand(-0.8, 0.8);
  //motion.timer = rand(1.8, 3.5);  
  motion.roll = rand(-8, 8);        // was rand(-55, 55)
motion.pitch = rand(-0.8, 0.8);   // was rand(-3.5, 3.5)
motion.timer = rand(4.0, 7.0); 
}
//const rollDeg = Math.sin(t * 0.18) * 12 + Math.sin(t * 0.41) * 8 + motion.roll;
const rollDeg = Math.sin(t * 0.18) * 4 + Math.sin(t * 0.41) * 2 + motion.roll;
const pitch   = Math.sin(t * 0.15) * 1.2 + Math.sin(t * 0.38) * 0.6 + motion.pitch;
const driftX  = Math.sin(t * 0.12) * 0.4 + motion.driftX;
attitudeGroup.rotation.z = THREE.MathUtils.lerp(
  attitudeGroup.rotation.z,
  THREE.MathUtils.degToRad(rollDeg),
  0.025   // slower lerp = smoother, more realistic roll transitions
);
attitudeGroup.position.y = THREE.MathUtils.lerp(attitudeGroup.position.y, pitch, 0.022);
attitudeGroup.position.x = THREE.MathUtils.lerp(attitudeGroup.position.x, driftX, 0.02);

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
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [onScore]);

  return <div ref={mountRef} className="h-full w-full overflow-hidden rounded-[28px]" />;
}