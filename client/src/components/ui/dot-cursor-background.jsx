"use client";

import { useEffect, useRef } from "react";

export function DotCursorBackground({
  gap = 28,
  radius = 1.5,
  dotColor = "rgba(0,0,0,0.13)",
  glowColor = "rgba(107,92,231,1)",
  cursorRadius = 130,
  ripple = true,
  className = "",
}) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const ripplesRef = useRef([]);
  const frameRef = useRef(0);
  const rafRef = useRef();

  const autoMiceRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let dots = [];

    const buildGrid = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      dots = [];

      const cols = Math.floor(canvas.width / gap) + 2;
      const rows = Math.floor(canvas.height / gap) + 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            x: c * gap,
            y: r * gap,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }

      // Initialize auto mice
      if (autoMiceRef.current.length === 0) {
        autoMiceRef.current = [
          { x: canvas.width * 0.2, y: canvas.height * 0.2, vx: 1.5, vy: 1.2 },
          { x: canvas.width * 0.8, y: canvas.height * 0.8, vx: -1.2, vy: -1.5 },
          { x: canvas.width * 0.5, y: canvas.height * 0.5, vx: 1.8, vy: -1.1 },
        ];
      }
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const withAlpha = (color, alpha) =>
      color.startsWith("rgba")
        ? color.replace(/[\d.]+\)$/, `${alpha.toFixed(3)})`)
        : color;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      frameRef.current++;

      // Update automated moving cursors (bouncing off walls)
      autoMiceRef.current.forEach(mouse => {
        mouse.x += mouse.vx;
        mouse.y += mouse.vy;

        if (mouse.x <= 0 || mouse.x >= canvas.width) mouse.vx *= -1;
        if (mouse.y <= 0 || mouse.y >= canvas.height) mouse.vy *= -1;
      });

      // Randomly spawn a ripple to animate itself (about once every 120 frames)
      if (ripple && Math.random() < 0.008 && dots.length > 0) {
        const randomDot = dots[Math.floor(Math.random() * dots.length)];
        ripplesRef.current.push({
          x: randomDot.x,
          y: randomDot.y,
          t: 0,
        });
      }

      ripplesRef.current = ripplesRef.current.filter((r) => r.t < 70);

      ripplesRef.current.forEach((r) => r.t++);

      const glowingPoints = [mouseRef.current, ...autoMiceRef.current];

      for (const d of dots) {
        let alpha = 0.13;
        let r = radius;
        let isGlow = false;

        // Proximity glow for all active points (real mouse + auto mice)
        for (const pt of glowingPoints) {
          const dx = d.x - pt.x;
          const dy = d.y - pt.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < cursorRadius) {
            const t = easeOut(1 - dist / cursorRadius);
            const newAlpha = lerp(0.13, 1, t);
            const newR = lerp(radius, radius * 2.6, t * 0.65);
            
            if (newAlpha > alpha) alpha = newAlpha;
            if (newR > r) r = newR;
            isGlow = true;
          }
        }

        // Ripple wave effect
        for (const rip of ripplesRef.current) {
          const rd = Math.sqrt((d.x - rip.x) ** 2 + (d.y - rip.y) ** 2);

          const diff = Math.abs(rd - rip.t * 6);

          if (diff < 24) {
            const wt = easeOut(1 - diff / 24) * (1 - rip.t / 70);

            const wa = lerp(0.13, 0.9, wt);

            if (wa > alpha) {
              alpha = wa;
              r = Math.max(r, lerp(radius, radius * 2, wt));
              isGlow = true;
            }
          }
        }

        // Idle breathing animation
        alpha = Math.min(
          1,
          alpha + Math.sin(frameRef.current * 0.008 + d.phase) * 0.04
        );

        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);

        ctx.fillStyle = withAlpha(
          isGlow ? glowColor : dotColor,
          alpha
        );

        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    buildGrid();
    draw();

    let lastRippleTime = 0;
    const onMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };

      const now = performance.now();
      // Spawn a ripple while cursor goes anywhere (throttled to 100ms)
      if (ripple && now - lastRippleTime > 100) {
        ripplesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          t: 0,
        });
        lastRippleTime = now;
      }
    };

    const onClick = (e) => {
      if (ripple) {
        ripplesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          t: 0,
        });
      }
    };

    const onResize = () => buildGrid();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, [gap, radius, dotColor, glowColor, cursorRadius, ripple]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}