"use client";

import { useAgentStore } from "@/lib/store";
import { AVATAR_CHARACTER_TYPES, AVATAR_STYLES, AVATAR_SHAPES, AVATAR_EXPRESSIONS, AVATAR_ACCESSORIES, AVATAR_PATTERNS, AVATAR_COLORS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, RotateCcw, Shuffle } from "lucide-react";
import { Avatar2D } from "@/components/two-d/avatar-2d";
import { useCallback } from "react";

export function AvatarStudio() {
  const { avatar, setAvatar } = useAgentStore();

  const handleImageGenerated = useCallback((dataUrl: string) => {
    setAvatar({ imageDataUrl: dataUrl });
  }, [setAvatar]);

  const randomizeAvatar = useCallback(() => {
    const randomCharacterType = AVATAR_CHARACTER_TYPES[Math.floor(Math.random() * AVATAR_CHARACTER_TYPES.length)].id;
    const randomStyle = AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)].id;
    const randomAccentColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const randomBackgroundColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const randomExpression = AVATAR_EXPRESSIONS[Math.floor(Math.random() * AVATAR_EXPRESSIONS.length)].id;
    const randomAccessory = AVATAR_ACCESSORIES[Math.floor(Math.random() * AVATAR_ACCESSORIES.length)].id;

    setAvatar({
      characterType: randomCharacterType,
      style: randomStyle,
      accentColor: randomAccentColor,
      backgroundColor: randomBackgroundColor,
      expression: randomExpression,
      accessory: randomAccessory,
    });
  }, [setAvatar]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">2D Avatar Studio</h2>
        <p className="text-muted-foreground text-sm">
          Design your agent&apos;s visual identity. This will be used as profile picture, token metadata image, and social media avatar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,1fr] gap-6">
        {/* 2D Preview */}
        <div className="space-y-3">
          <Avatar2D config={avatar} onImageGenerated={handleImageGenerated} />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Your avatar is automatically saved</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={randomizeAvatar}
              >
                <Shuffle className="w-3 h-3" />
                Randomize
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setAvatar({
                    characterType: "humanoid",
                    style: "pixel",
                    backgroundColor: "#6366f1",
                    accentColor: "#a855f7",
                    shape: "circle",
                    expression: "happy",
                    accessory: "none",
                    pattern: "solid",
                  })
                }
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          {/* Character Type */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Character Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {AVATAR_CHARACTER_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setAvatar({ characterType: type.id })}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all text-sm",
                    avatar.characterType === type.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{type.description}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Style */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Avatar Style</h3>
            <div className="grid grid-cols-2 gap-2">
              {AVATAR_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setAvatar({ style: style.id })}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all text-sm",
                    avatar.style === style.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <div className="font-medium">{style.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{style.description}</div>
                </button>
              ))}
            </div>
          </Card>

          {/* Colors */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Character Color</h3>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={`ac-${color}`}
                  onClick={() => setAvatar({ accentColor: color })}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    avatar.accentColor === color ? "border-white scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <h3 className="text-sm font-semibold mt-3">Detail Color</h3>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={`bg-${color}`}
                  onClick={() => setAvatar({ backgroundColor: color })}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    avatar.backgroundColor === color ? "border-white scale-110" : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </Card>

          {/* Expression */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Expression</h3>
            <div className="grid grid-cols-3 gap-2">
              {AVATAR_EXPRESSIONS.map((expr) => (
                <button
                  key={expr.id}
                  onClick={() => setAvatar({ expression: expr.id })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs transition-all flex items-center gap-1.5",
                    avatar.expression === expr.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <span>{expr.emoji}</span>
                  <span>{expr.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Accessories */}
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Accessory
            </h3>
            <div className="flex flex-wrap gap-2">
              {AVATAR_ACCESSORIES.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setAvatar({ accessory: acc.id })}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-xs transition-all",
                    avatar.accessory === acc.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
