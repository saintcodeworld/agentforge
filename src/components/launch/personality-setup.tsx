"use client";

import { useAgentStore } from "@/lib/store";
import { PERSONALITY_ARCHETYPES } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Brain, Globe, Volume2 } from "lucide-react";

const TONES = [
  { id: "friendly", label: "Friendly" },
  { id: "professional", label: "Professional" },
  { id: "sarcastic", label: "Sarcastic" },
  { id: "enthusiastic", label: "Enthusiastic" },
  { id: "mysterious", label: "Mysterious" },
  { id: "aggressive", label: "Aggressive" },
];

const LANGUAGES = [
  { id: "english", label: "English" },
  { id: "spanish", label: "Spanish" },
  { id: "chinese", label: "Chinese" },
  { id: "japanese", label: "Japanese" },
  { id: "arabic", label: "Arabic" },
  { id: "multi", label: "Multilingual" },
];

export function PersonalitySetup() {
  const { personality, setPersonality } = useAgentStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Agent Personality</h2>
        <p className="text-muted-foreground text-sm">
          Define how your agent thinks, speaks, and interacts. This shapes all social media posts and community interactions.
        </p>
      </div>

      {/* Archetype Selection */}
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" /> Personality Archetype
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PERSONALITY_ARCHETYPES.map((arch) => (
            <button
              key={arch.id}
              onClick={() => setPersonality({ archetype: arch.id })}
              className={cn(
                "p-3 rounded-lg border text-left transition-all",
                personality.archetype === arch.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <div className="font-medium text-sm">{arch.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{arch.description}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Tone */}
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-secondary" /> Communication Tone
        </h3>
        <div className="flex flex-wrap gap-2">
          {TONES.map((tone) => (
            <button
              key={tone.id}
              onClick={() => setPersonality({ tone: tone.id })}
              className={cn(
                "px-3 py-1.5 rounded-lg border text-xs transition-all",
                personality.tone === tone.id
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              {tone.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Language */}
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" /> Primary Language
        </h3>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setPersonality({ language: lang.id })}
              className={cn(
                "px-3 py-1.5 rounded-lg border text-xs transition-all",
                personality.language === lang.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Custom Prompt */}
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold">Custom Personality Prompt (Optional)</h3>
        <p className="text-xs text-muted-foreground">
          Add specific instructions for how your agent should behave. This is appended to the archetype defaults.
        </p>
        <textarea
          value={personality.customPrompt}
          onChange={(e) => setPersonality({ customPrompt: e.target.value })}
          placeholder="e.g., Always mention our project name 'SolGuard' in responses. Never discuss competitor tokens. Use fire emojis frequently..."
          className="w-full h-32 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
      </Card>
    </div>
  );
}
