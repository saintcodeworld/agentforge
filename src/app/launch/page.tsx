"use client";

import { useAgentStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AvatarStudio } from "@/components/launch/avatar-studio";
import { PersonalitySetup } from "@/components/launch/personality-setup";
import { SkillBuilder } from "@/components/launch/skill-builder";
import { TokenomicsConfig } from "@/components/launch/tokenomics-config";
import { XAccountSetup } from "@/components/launch/x-account-setup";
import { ReviewLaunch } from "@/components/launch/review-launch";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Paintbrush,
  Brain,
  Wrench,
  Coins,
  Twitter,
  Rocket,
} from "lucide-react";

const STEPS = [
  { id: 0, label: "Avatar", icon: Paintbrush },
  { id: 1, label: "Personality", icon: Brain },
  { id: 2, label: "Skills", icon: Wrench },
  { id: 3, label: "Tokenomics", icon: Coins },
  { id: 4, label: "X Account", icon: Twitter },
  { id: 5, label: "Launch", icon: Rocket },
];

export default function LaunchPage() {
  const { currentStep, setStep } = useAgentStore();

  const canGoNext = currentStep < STEPS.length - 1;
  const canGoBack = currentStep > 0;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = currentStep === i;
              const isCompleted = currentStep > i;
              return (
                <button
                  key={step.id}
                  onClick={() => setStep(i)}
                  className="flex flex-col items-center gap-1.5 group relative"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                      isActive
                        ? "bg-primary text-white glow-primary"
                        : isCompleted
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] sm:text-xs transition-all hidden sm:block",
                      isActive ? "text-primary font-medium" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-5 left-[calc(50%+20px)] w-[calc(100%-40px)] h-[2px] -z-10 hidden sm:block",
                        isCompleted ? "bg-primary/40" : "bg-border"
                      )}
                      style={{ width: "calc(100vw / 8)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Progress bar (mobile-friendly) */}
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden sm:hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[500px]">
          {currentStep === 0 && <AvatarStudio />}
          {currentStep === 1 && <PersonalitySetup />}
          {currentStep === 2 && <SkillBuilder />}
          {currentStep === 3 && <TokenomicsConfig />}
          {currentStep === 4 && <XAccountSetup />}
          {currentStep === 5 && <ReviewLaunch />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setStep(currentStep - 1)}
            disabled={!canGoBack}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <span className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>

          {canGoNext && (
            <Button onClick={() => setStep(currentStep + 1)}>
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {!canGoNext && currentStep === STEPS.length - 1 && (
            <div className="w-[100px]" /> 
          )}
        </div>
      </div>
    </div>
  );
}
