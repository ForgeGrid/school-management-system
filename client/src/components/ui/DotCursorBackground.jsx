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

      ripplesRef.current = ripplesRef.current.filter((r) => r.t < 70);

      ripplesRef.current.forEach((r) => r.t++);

      for (const d of dots) {
        const dx = d.x - mouseRef.current.x;
        const dy = d.y - mouseRef.current.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        let alpha = 0.13;
        let r = radius;
        let isGlow = false;

        // Cursor proximity glow
        if (dist < cursorRadius) {
          const t = easeOut(1 - dist / cursorRadius);

          alpha = lerp(0.13, 1, t);
          r = lerp(radius, radius * 2.6, t * 0.65);

          isGlow = true;
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

    const onMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
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