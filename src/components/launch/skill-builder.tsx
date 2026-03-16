"use client";

import { useState } from "react";
import { useAgentStore } from "@/lib/store";
import { SKILL_TEMPLATES } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Wallet,
  ShoppingBag,
  Megaphone,
  MessageCircle,
  TrendingUp,
  Palette,
  Bell,
  Mail,
  Sparkles,
  X,
  FileText,
  Wand2,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet, ShoppingBag, Megaphone, MessageCircle, TrendingUp, Palette, Bell, Mail,
};

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "monetization", label: "Monetization" },
  { id: "social", label: "Social" },
  { id: "community", label: "Community" },
  { id: "analytics", label: "Analytics" },
];

export function SkillBuilder() {
  const { skills, addSkill, removeSkill, generatedSkillsMd, setGeneratedSkillsMd } = useAgentStore();
  const [activeCategory, setActiveCategory] = useState("all");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const filteredTemplates = SKILL_TEMPLATES.filter(
    (t) => activeCategory === "all" || t.category === activeCategory
  );

  const isSkillAdded = (id: string) => skills.some((s) => s.id === id);

  const handleAddSkill = (template: (typeof SKILL_TEMPLATES)[number]) => {
    if (isSkillAdded(template.id)) return;
    addSkill({
      id: template.id,
      name: template.name,
      icon: template.icon,
      params: template.params.reduce((acc, p) => {
        acc[p.key] = (p as unknown as Record<string, unknown>).default ?? "";
        return acc;
      }, {} as Record<string, unknown>),
    });
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, existingSkills: skills }),
      });
      const data = await res.json();
      if (data.skillsMd) {
        setGeneratedSkillsMd(data.skillsMd);
        setShowPreview(true);
      } else {
        alert("Failed to generate skills. Please try again.");
      }
    } catch (error) {
      alert("Failed to generate skills. Please check your API configuration.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSkillsMdFromSkills = () => {
    let md = `---\nname: AgentForge Agent\ndescription: AI agent with custom skills\n---\n\n`;
    md += `# Agent Skills\n\n`;
    if (skills.length === 0 && aiPrompt) {
      md += `## Custom Skill\n\n`;
      md += `${aiPrompt}\n\n`;
      md += `### Instructions\n`;
      md += `- Follow the user's intent as described above\n`;
      md += `- Use available tools and APIs to accomplish tasks\n`;
      md += `- Report results clearly and concisely\n`;
    }
    skills.forEach((skill) => {
      md += `## ${skill.name}\n\n`;
      md += `### Parameters\n`;
      Object.entries(skill.params).forEach(([key, value]) => {
        md += `- **${key}**: ${value || "not set"}\n`;
      });
      md += `\n### Instructions\n`;
      md += `- Execute ${skill.name.toLowerCase()} operations as configured\n`;
      md += `- Use the @pump-fun/agent-payments-sdk for on-chain operations\n`;
      md += `- Report activity to the agent dashboard\n\n`;
    });
    return md;
  };

  // Auto-generate skills.md when skills change
  const handleGeneratePreview = () => {
    const md = generateSkillsMdFromSkills();
    setGeneratedSkillsMd(md);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Skill Builder</h2>
        <p className="text-muted-foreground text-sm">
          Choose what your agent can do. Pick from templates or describe in plain English.
        </p>
      </div>

      {/* AI Generation */}
      <Card className="p-4 space-y-3 border-primary/30">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary" /> Describe in Plain English
        </h3>
        <p className="text-xs text-muted-foreground">
          Tell us what you want your agent to do and we&apos;ll generate the skills.md automatically.
        </p>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="e.g., I want my agent to sell digital wallpapers for 0.5 SOL each. When someone pays, send them a download link. Post a tweet every time a sale happens. Also post a daily market update about my token price."
          className="w-full h-24 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />
        <Button onClick={handleAiGenerate} disabled={isGenerating || !aiPrompt.trim()}>
          <Sparkles className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Generate Skills"}
        </Button>
      </Card>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-muted-foreground">OR pick from templates</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs transition-all",
              activeCategory === cat.id
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Skill Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredTemplates.map((template) => {
          const Icon = ICON_MAP[template.icon] || Sparkles;
          const added = isSkillAdded(template.id);
          return (
            <Card
              key={template.id}
              className={cn(
                "p-4 cursor-pointer transition-all hover:border-primary/50",
                added && "border-primary/50 bg-primary/5"
              )}
              onClick={() => added ? removeSkill(template.id) : handleAddSkill(template)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    added ? "bg-primary/20" : "bg-muted"
                  )}>
                    <Icon className={cn("w-4 h-4", added ? "text-primary" : "text-muted-foreground")} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{template.description}</div>
                  </div>
                </div>
                {added && (
                  <Badge variant="success" className="text-[10px]">Added</Badge>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Selected Skills */}
      {skills.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Selected Skills ({skills.length})</h3>
            <Button variant="outline" size="sm" onClick={handleGeneratePreview}>
              <FileText className="w-3 h-3" />
              Preview skills.md
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs"
              >
                {skill.name}
                <button onClick={() => removeSkill(skill.id)} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Skills.md Preview */}
      {showPreview && generatedSkillsMd && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Generated skills.md
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
              <X className="w-3 h-3" />
            </Button>
          </div>
          <textarea
            value={generatedSkillsMd}
            onChange={(e) => setGeneratedSkillsMd(e.target.value)}
            className="w-full h-64 rounded-lg border border-border bg-background font-mono text-xs px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
          />
          <p className="text-xs text-muted-foreground">
            You can edit this directly. This file will be uploaded to PumpFun during agent creation.
          </p>
        </Card>
      )}
    </div>
  );
}
