"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  phase: number;
}

export default function WeatherCanvas({
  season,
  night,
}: {
  season: string;
  night: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const particleCount = season === "Borsha" ? 64 : season === "Basanta" ? 30 : night ? 34 : 18;
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: season === "Borsha" ? 1 + Math.random() * 1.4 : 1.2 + Math.random() * 2.4,
      speed: season === "Borsha" ? 0.009 + Math.random() * 0.018 : 0.001 + Math.random() * 0.003,
      drift: Math.random() * 0.004 - 0.002,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        particle.y += particle.speed;
        particle.x += particle.drift + (season === "Borsha" ? 0.001 : 0);
        if (particle.y > 1.04) {
          particle.y = -0.04;
          particle.x = Math.random();
        }
        if (particle.x > 1.04) particle.x = -0.04;
        if (particle.x < -0.04) particle.x = 1.04;

        const x = particle.x * width;
        const y = particle.y * height;
        if (season === "Borsha") {
          context.strokeStyle = night ? "rgba(206, 222, 225, .26)" : "rgba(72, 110, 129, .23)";
          context.lineWidth = particle.size;
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x - 4, y + 15 + particle.size * 4);
          context.stroke();
          return;
        }

        const glow = 0.4 + Math.sin(time * 0.0016 + particle.phase) * 0.28;
        context.fillStyle =
          season === "Basanta"
            ? `rgba(240, 161, 145, ${glow})`
            : night
              ? `rgba(244, 229, 133, ${glow})`
              : `rgba(255, 250, 223, ${glow * 0.5})`;
        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fill();
      });
      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    animationFrame = window.requestAnimationFrame(draw);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [night, season]);

  return <canvas ref={canvasRef} className="weather-canvas" aria-hidden="true" />;
}
