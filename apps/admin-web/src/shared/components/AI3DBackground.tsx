import React, { useEffect, useRef } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  colorLight: string;
  colorDark: string;
  pulseOffset: number;
}

export const AI3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Track dark mode via DOM class
    let isDark = document.documentElement.classList.contains("dark");
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    // Handle resize
    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.parentElement?.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Mouse parallax tracking with smooth easing (lerp)
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let rotY = 0;
    let rotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      mouseX = x;
      mouseY = y;
      targetRotY = (mouseX / (width / 2)) * 0.25; // max 14 degrees
      targetRotX = -(mouseY / (height / 2)) * 0.18; // max 10 degrees
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Generate 3D Neural Constellation Points
    const NODE_COUNT = 65;
    const BOUNDS_X = Math.max(width * 0.7, 500);
    const BOUNDS_Y = Math.max(height * 0.65, 380);
    const BOUNDS_Z = 300;

    const colors = [
      { light: "rgba(99, 102, 241,", dark: "rgba(129, 140, 248," }, // Indigo
      { light: "rgba(139, 92, 246,", dark: "rgba(168, 85, 247," }, // Violet
      { light: "rgba(6, 182, 212,", dark: "rgba(34, 211, 238," },   // Cyan
      { light: "rgba(16, 185, 129,", dark: "rgba(52, 211, 153," },  // Emerald
      { light: "rgba(244, 63, 94,", dark: "rgba(251, 113, 133," },  // Rose
    ];

    const points: Point3D[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const col = colors[i % colors.length];
      points.push({
        x: (Math.random() - 0.5) * BOUNDS_X * 2,
        y: (Math.random() - 0.5) * BOUNDS_Y * 2,
        z: (Math.random() - 0.5) * BOUNDS_Z * 2,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2.2 + 1.8,
        colorLight: col.light,
        colorDark: col.dark,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }

    const FOCAL_LENGTH = 450;
    const MAX_LINK_DIST = 140;

    let time = 0;

    // Render loop
    const render = () => {
      time += 0.016;

      // Smooth interpolation for rotation
      rotY += (targetRotY - rotY) * 0.04;
      rotX += (targetRotX - rotX) * 0.04;

      // Gentle autonomous slow rotation
      const autoRotY = rotY + Math.sin(time * 0.25) * 0.08;
      const autoRotX = rotX + Math.cos(time * 0.2) * 0.05;

      const cosY = Math.cos(autoRotY);
      const sinY = Math.sin(autoRotY);
      const cosX = Math.cos(autoRotX);
      const sinX = Math.sin(autoRotX);

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // ─── 1. 3D Perspective Digital Terrain / Wave Grid (Lower Half) ───
      const gridZStart = 80;
      const gridZEnd = 450;
      const gridStepZ = 45;
      const gridStepX = 70;
      const gridYLevel = height * 0.32; // Horizon offset

      ctx.save();
      const gridStrokeColor = isDark ? "rgba(99, 102, 241, " : "rgba(99, 102, 241, ";
      
      // Draw horizontal distance lines
      for (let gz = gridZStart; gz <= gridZEnd; gz += gridStepZ) {
        const gzScale = FOCAL_LENGTH / (FOCAL_LENGTH + gz);
        const screenY = centerY + gridYLevel * gzScale;
        const halfSpan = (width * 0.85) * gzScale;
        const lineAlpha = (1 - gz / gridZEnd) * (isDark ? 0.12 : 0.07);

        ctx.beginPath();
        for (let gx = -halfSpan; gx <= halfSpan; gx += 20) {
          const wave = Math.sin(gx * 0.02 + time * 0.8 + gz * 0.015) * (14 * gzScale);
          const py = screenY + wave;
          if (gx === -halfSpan) {
            ctx.moveTo(centerX + gx, py);
          } else {
            ctx.lineTo(centerX + gx, py);
          }
        }
        ctx.strokeStyle = `${gridStrokeColor}${lineAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw longitudinal perspective lines
      for (let gx = -width * 0.8; gx <= width * 0.8; gx += gridStepX) {
        ctx.beginPath();
        let started = false;
        for (let gz = gridZStart; gz <= gridZEnd; gz += 25) {
          const gzScale = FOCAL_LENGTH / (FOCAL_LENGTH + gz);
          const screenX = centerX + gx * gzScale;
          const wave = Math.sin(gx * 0.02 + time * 0.8 + gz * 0.015) * (14 * gzScale);
          const screenY = centerY + gridYLevel * gzScale + wave;
          if (!started) {
            ctx.moveTo(screenX, screenY);
            started = true;
          } else {
            ctx.lineTo(screenX, screenY);
          }
        }
        const alpha = isDark ? 0.06 : 0.04;
        ctx.strokeStyle = `${gridStrokeColor}${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.restore();

      // ─── 2. Update & Project 3D Points ───
      const projected: Array<{
        px: number;
        py: number;
        pz: number;
        scale: number;
        radius: number;
        color: string;
      }> = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Update position with drift
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Bounce within 3D volume
        if (p.x > BOUNDS_X) p.vx = -Math.abs(p.vx);
        if (p.x < -BOUNDS_X) p.vx = Math.abs(p.vx);
        if (p.y > BOUNDS_Y) p.vy = -Math.abs(p.vy);
        if (p.y < -BOUNDS_Y) p.vy = Math.abs(p.vy);
        if (p.z > BOUNDS_Z) p.vz = -Math.abs(p.vz);
        if (p.z < -BOUNDS_Z) p.vz = Math.abs(p.vz);

        // 3D Rotation Y
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        // 3D Rotation X
        const y1 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // Perspective scale
        const zCamera = z2 + FOCAL_LENGTH;
        if (zCamera <= 30) continue;

        const scale = FOCAL_LENGTH / zCamera;
        const px = centerX + x1 * scale;
        const py = centerY + y1 * scale;

        const colorPrefix = isDark ? p.colorDark : p.colorLight;

        projected.push({
          px,
          py,
          pz: z2,
          scale,
          radius: p.radius * (1 + 0.25 * Math.sin(time * 2.5 + p.pulseOffset)),
          color: colorPrefix,
        });
      }

      // ─── 3. Draw Connecting 3D Neural Synapses ───
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dx = p1.px - p2.px;
          const dy = p1.py - p2.py;
          const dist2D = Math.sqrt(dx * dx + dy * dy);

          if (dist2D < MAX_LINK_DIST) {
            const avgScale = (p1.scale + p2.scale) * 0.5;
            const proximity = 1 - dist2D / MAX_LINK_DIST;
            const lineAlpha = proximity * avgScale * (isDark ? 0.35 : 0.2);

            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);

            // Subtle gradient line between points
            const gradient = ctx.createLinearGradient(p1.px, p1.py, p2.px, p2.py);
            gradient.addColorStop(0, `${p1.color}${lineAlpha})`);
            gradient.addColorStop(1, `${p2.color}${lineAlpha})`);

            ctx.strokeStyle = gradient;
            ctx.lineWidth = Math.max(0.6, avgScale * 1.3);
            ctx.stroke();
          }
        }
      }

      // ─── 4. Draw 3D Glowing Nodes ───
      // Sort by depth so closer points draw on top
      projected.sort((a, b) => b.pz - a.pz);

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const r = Math.max(1, p.radius * p.scale);
        const nodeAlpha = Math.min(1, Math.max(0.2, p.scale * (isDark ? 0.85 : 0.65)));

        // Soft outer glow halo
        const glowRadius = r * (isDark ? 3.5 : 2.5);
        const haloGrad = ctx.createRadialGradient(p.px, p.py, r * 0.2, p.px, p.py, glowRadius);
        haloGrad.addColorStop(0, `${p.color}${nodeAlpha * 0.6})`);
        haloGrad.addColorStop(0.6, `${p.color}${nodeAlpha * 0.15})`);
        haloGrad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(p.px, p.py, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core bright center
        ctx.fillStyle = `${p.color}${nodeAlpha})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
        ctx.fill();

        // Extra specular glint on closer nodes
        if (p.scale > 0.9) {
          ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(p.px - r * 0.3, p.py - r * 0.3, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none -z-0">
      {/* 3D Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full opacity-80 dark:opacity-90 transition-opacity duration-500"
      />

      {/* Ambient Top Aurora Radial Vignette for Depth */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[950px] h-[400px] bg-gradient-to-b from-indigo-500/12 via-violet-500/6 to-transparent blur-3xl rounded-full" />
      
      {/* Soft Vignette Overlay around edges to keep focus on center cards */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 dark:to-background/70" />
    </div>
  );
};
