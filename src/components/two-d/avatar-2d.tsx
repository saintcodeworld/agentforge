"use client";

import { useEffect, useRef } from "react";
import type { AvatarConfig } from "@/lib/store";

interface Avatar2DProps {
  config: AvatarConfig;
  onImageGenerated?: (dataUrl: string) => void;
}

export function Avatar2D({ config, onImageGenerated }: Avatar2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;

    // Draw only the character, no background pattern
    switch (config.characterType) {
      case "humanoid":
        drawHumanoid(ctx, centerX, centerY, config);
        break;
      case "robot":
        drawRobot(ctx, centerX, centerY, config);
        break;
      case "animal":
        drawAnimal(ctx, centerX, centerY, config);
        break;
      case "abstract":
        drawAbstract(ctx, centerX, centerY, config);
        break;
      default:
        drawHumanoid(ctx, centerX, centerY, config);
    }

    drawAccessory(ctx, centerX, centerY, config);

    if (onImageGenerated) {
      const dataUrl = canvas.toDataURL("image/png");
      onImageGenerated(dataUrl);
    }
  }, [config.characterType, config.style, config.backgroundColor, config.accentColor, config.shape, config.expression, config.accessory, config.pattern]);

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-gradient-to-br from-background/80 to-muted/30 border border-border flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full"
        style={{ imageRendering: config.style === "pixel" ? "pixelated" : "auto" }}
      />
    </div>
  );
}

function drawPattern(ctx: CanvasRenderingContext2D, size: number, config: AvatarConfig) {
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, size, size);

  if (config.pattern === "solid") return;

  ctx.strokeStyle = config.accentColor;
  ctx.fillStyle = config.accentColor;
  ctx.globalAlpha = 0.15;

  const spacing = 20;

  switch (config.pattern) {
    case "dots":
      for (let x = spacing; x < size; x += spacing) {
        for (let y = spacing; y < size; y += spacing) {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    case "stripes":
      ctx.lineWidth = 8;
      for (let x = 0; x < size; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        ctx.stroke();
      }
      break;
    case "grid":
      ctx.lineWidth = 2;
      for (let i = spacing; i < size; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
      }
      break;
    case "waves":
      ctx.lineWidth = 4;
      for (let y = 0; y < size; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < size; x += 5) {
          const waveY = y + Math.sin(x / 20) * 10;
          ctx.lineTo(x, waveY);
        }
        ctx.stroke();
      }
      break;
  }

  ctx.globalAlpha = 1;
}

function drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
}

function drawHumanoid(ctx: CanvasRenderingContext2D, x: number, y: number, config: AvatarConfig) {
  const pixelSize = 8;
  const baseX = x - pixelSize * 8;
  const baseY = y - pixelSize * 10;

  ctx.fillStyle = config.accentColor;
  
  // Head (8x8)
  for (let i = 2; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      drawPixel(ctx, baseX + i * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
    }
  }
  
  // Eyes
  const eyeColor = config.backgroundColor;
  drawPixel(ctx, baseX + 3 * pixelSize, baseY + 2 * pixelSize, pixelSize, eyeColor);
  drawPixel(ctx, baseX + 4 * pixelSize, baseY + 2 * pixelSize, pixelSize, eyeColor);
  
  // Mouth based on expression
  if (config.expression === "happy" || config.expression === "friendly") {
    drawPixel(ctx, baseX + 2 * pixelSize, baseY + 4 * pixelSize, pixelSize, eyeColor);
    drawPixel(ctx, baseX + 3 * pixelSize, baseY + 4 * pixelSize, pixelSize, eyeColor);
    drawPixel(ctx, baseX + 4 * pixelSize, baseY + 4 * pixelSize, pixelSize, eyeColor);
    drawPixel(ctx, baseX + 5 * pixelSize, baseY + 4 * pixelSize, pixelSize, eyeColor);
  } else if (config.expression === "cool") {
    drawPixel(ctx, baseX + 3 * pixelSize, baseY + 4 * pixelSize, pixelSize, eyeColor);
    drawPixel(ctx, baseX + 4 * pixelSize, baseY + 4 * pixelSize, pixelSize, eyeColor);
  }
  
  // Body
  for (let i = 2; i < 6; i++) {
    for (let j = 6; j < 12; j++) {
      drawPixel(ctx, baseX + i * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
    }
  }
  
  // Arms
  for (let j = 6; j < 10; j++) {
    drawPixel(ctx, baseX + 1 * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
    drawPixel(ctx, baseX + 6 * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
  }
  
  // Legs
  for (let j = 12; j < 16; j++) {
    drawPixel(ctx, baseX + 2 * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
    drawPixel(ctx, baseX + 5 * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
  }
}

function drawRobot(ctx: CanvasRenderingContext2D, x: number, y: number, config: AvatarConfig) {
  const pixelSize = 8;
  const baseX = x - pixelSize * 8;
  const baseY = y - pixelSize * 10;

  ctx.fillStyle = config.accentColor;
  
  // Antenna
  drawPixel(ctx, baseX + 3 * pixelSize, baseY - 2 * pixelSize, pixelSize, config.accentColor);
  drawPixel(ctx, baseX + 4 * pixelSize, baseY - 2 * pixelSize, pixelSize, config.accentColor);
  drawPixel(ctx, baseX + 3 * pixelSize, baseY - 1 * pixelSize, pixelSize, config.accentColor);
  drawPixel(ctx, baseX + 4 * pixelSize, baseY - 1 * pixelSize, pixelSize, config.accentColor);
  
  // Head (rectangular)
  for (let i = 1; i < 7; i++) {
    for (let j = 0; j < 5; j++) {
      drawPixel(ctx, baseX + i * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
    }
  }
  
  // Visor eyes
  const visorColor = config.backgroundColor;
  for (let i = 2; i < 6; i++) {
    drawPixel(ctx, baseX + i * pixelSize, baseY + 2 * pixelSize, pixelSize, visorColor);
  }
  
  // Body (rectangular)
  for (let i = 1; i < 7; i++) {
    for (let j = 5; j < 12; j++) {
      drawPixel(ctx, baseX + i * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
    }
  }
  
  // Chest panel
  for (let i = 3; i < 5; i++) {
    for (let j = 7; j < 10; j++) {
      drawPixel(ctx, baseX + i * pixelSize, baseY + j * pixelSize, pixelSize, visorColor);
    }
  }
  
  // Arms (blocky)
  for (let j = 5; j < 11; j++) {
    drawPixel(ctx, baseX + 0 * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
    drawPixel(ctx, baseX + 7 * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
  }
  
  // Legs (blocky)
  for (let j = 12; j < 17; j++) {
    drawPixel(ctx, baseX + 2 * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
    drawPixel(ctx, baseX + 5 * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
  }
}

function drawAnimal(ctx: CanvasRenderingContext2D, x: number, y: number, config: AvatarConfig) {
  const pixelSize = 8;
  const baseX = x - pixelSize * 8;
  const baseY = y - pixelSize * 10;

  ctx.fillStyle = config.accentColor;
  
  // Ears
  drawPixel(ctx, baseX + 1 * pixelSize, baseY + 0 * pixelSize, pixelSize, config.accentColor);
  drawPixel(ctx, baseX + 6 * pixelSize, baseY + 0 * pixelSize, pixelSize, config.accentColor);
  drawPixel(ctx, baseX + 1 * pixelSize, baseY + 1 * pixelSize, pixelSize, config.accentColor);
  drawPixel(ctx, baseX + 6 * pixelSize, baseY + 1 * pixelSize, pixelSize, config.accentColor);
  
  // Head (round-ish)
  for (let i = 2; i < 6; i++) {
    for (let j = 1; j < 6; j++) {
      drawPixel(ctx, baseX + i * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
    }
  }
  drawPixel(ctx, baseX + 1 * pixelSize, baseY + 2 * pixelSize, pixelSize, config.accentColor);
  drawPixel(ctx, baseX + 6 * pixelSize, baseY + 2 * pixelSize, pixelSize, config.accentColor);
  drawPixel(ctx, baseX + 1 * pixelSize, baseY + 3 * pixelSize, pixelSize, config.accentColor);
  drawPixel(ctx, baseX + 6 * pixelSize, baseY + 3 * pixelSize, pixelSize, config.accentColor);
  
  // Eyes
  const eyeColor = config.backgroundColor;
  drawPixel(ctx, baseX + 2 * pixelSize, baseY + 2 * pixelSize, pixelSize, eyeColor);
  drawPixel(ctx, baseX + 5 * pixelSize, baseY + 2 * pixelSize, pixelSize, eyeColor);
  
  // Nose
  drawPixel(ctx, baseX + 3 * pixelSize, baseY + 4 * pixelSize, pixelSize, eyeColor);
  drawPixel(ctx, baseX + 4 * pixelSize, baseY + 4 * pixelSize, pixelSize, eyeColor);
  
  // Body (oval)
  for (let i = 1; i < 7; i++) {
    for (let j = 6; j < 12; j++) {
      drawPixel(ctx, baseX + i * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
    }
  }
  
  // Paws
  for (let j = 12; j < 15; j++) {
    drawPixel(ctx, baseX + 1 * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
    drawPixel(ctx, baseX + 6 * pixelSize, baseY + j * pixelSize, pixelSize, config.accentColor);
  }
  
  // Tail
  for (let i = 7; i < 10; i++) {
    drawPixel(ctx, baseX + i * pixelSize, baseY + 8 * pixelSize, pixelSize, config.accentColor);
  }
}

function drawAbstract(ctx: CanvasRenderingContext2D, x: number, y: number, config: AvatarConfig) {
  const pixelSize = 8;
  const baseX = x - pixelSize * 8;
  const baseY = y - pixelSize * 10;

  // Geometric crystal/gem shape
  const centerI = 4;
  const centerJ = 8;
  
  // Draw diamond/crystal pattern
  for (let layer = 0; layer < 6; layer++) {
    const size = 6 - layer;
    for (let i = centerI - size; i <= centerI + size; i++) {
      drawPixel(ctx, baseX + i * pixelSize, baseY + (centerJ - layer) * pixelSize, pixelSize, config.accentColor);
      drawPixel(ctx, baseX + i * pixelSize, baseY + (centerJ + layer) * pixelSize, pixelSize, config.accentColor);
    }
  }
  
  // Inner glow
  const glowColor = config.backgroundColor;
  for (let i = centerI - 2; i <= centerI + 2; i++) {
    for (let j = centerJ - 2; j <= centerJ + 2; j++) {
      drawPixel(ctx, baseX + i * pixelSize, baseY + j * pixelSize, pixelSize, glowColor);
    }
  }
  
  // Orbiting pixels
  const orbitPositions = [
    { i: centerI - 4, j: centerJ - 4 },
    { i: centerI + 4, j: centerJ - 4 },
    { i: centerI - 4, j: centerJ + 4 },
    { i: centerI + 4, j: centerJ + 4 },
  ];
  
  orbitPositions.forEach(pos => {
    drawPixel(ctx, baseX + pos.i * pixelSize, baseY + pos.j * pixelSize, pixelSize, glowColor);
  });
}

function drawAccessory(ctx: CanvasRenderingContext2D, x: number, y: number, config: AvatarConfig) {
  if (config.accessory === "none") return;

  const pixelSize = 8;
  const baseX = x - pixelSize * 8;
  const baseY = y - pixelSize * 10;
  const accColor = config.backgroundColor;

  switch (config.accessory) {
    case "crown":
      // Crown on top
      for (let i = 2; i < 6; i++) {
        drawPixel(ctx, baseX + i * pixelSize, baseY - 2 * pixelSize, pixelSize, accColor);
      }
      drawPixel(ctx, baseX + 2 * pixelSize, baseY - 3 * pixelSize, pixelSize, accColor);
      drawPixel(ctx, baseX + 3 * pixelSize, baseY - 4 * pixelSize, pixelSize, accColor);
      drawPixel(ctx, baseX + 4 * pixelSize, baseY - 3 * pixelSize, pixelSize, accColor);
      drawPixel(ctx, baseX + 5 * pixelSize, baseY - 3 * pixelSize, pixelSize, accColor);
      break;
    case "halo":
      // Halo ring
      for (let i = 1; i < 7; i++) {
        drawPixel(ctx, baseX + i * pixelSize, baseY - 3 * pixelSize, pixelSize, accColor);
      }
      drawPixel(ctx, baseX + 0 * pixelSize, baseY - 2 * pixelSize, pixelSize, accColor);
      drawPixel(ctx, baseX + 7 * pixelSize, baseY - 2 * pixelSize, pixelSize, accColor);
      break;
    case "sparkles":
      // Sparkles around
      drawPixel(ctx, baseX - 2 * pixelSize, baseY + 4 * pixelSize, pixelSize, accColor);
      drawPixel(ctx, baseX + 9 * pixelSize, baseY + 4 * pixelSize, pixelSize, accColor);
      drawPixel(ctx, baseX - 1 * pixelSize, baseY + 2 * pixelSize, pixelSize, accColor);
      drawPixel(ctx, baseX + 8 * pixelSize, baseY + 2 * pixelSize, pixelSize, accColor);
      break;
    case "stars":
      // Star pixels
      drawPixel(ctx, baseX + 3 * pixelSize, baseY - 4 * pixelSize, pixelSize, accColor);
      drawPixel(ctx, baseX - 1 * pixelSize, baseY + 0 * pixelSize, pixelSize, accColor);
      drawPixel(ctx, baseX + 8 * pixelSize, baseY + 0 * pixelSize, pixelSize, accColor);
      break;
  }
}
