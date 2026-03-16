import { create } from "zustand";

export type AvatarConfig = {
  characterType: string;
  style: string;
  backgroundColor: string;
  accentColor: string;
  primaryColor: string;
  secondaryColor: string;
  shape: string;
  expression: string;
  accessory: string;
  pattern: string;
  bodyType: string;
  headShape: string;
  eyeStyle: string;
  particleEffect: string;
  imageDataUrl?: string;
};

export type SkillConfig = {
  id: string;
  name: string;
  icon: string;
  params: Record<string, unknown>;
};

export type TokenomicsConfig = {
  name: string;
  symbol: string;
  buybackPercent: number;
  devBuyAmountSol: number;
  description: string;
};

export type XAccountConfig = {
  enabled: boolean;
  username: string;
  postingFrequency: number;
  replyToMentions: boolean;
  joinAgentHive: boolean;
  topics: string;
};

export type AgentPersonality = {
  archetype: string;
  customPrompt: string;
  tone: string;
  language: string;
};

export interface AgentState {
  currentStep: number;
  avatar: AvatarConfig;
  skills: SkillConfig[];
  tokenomics: TokenomicsConfig;
  xAccount: XAccountConfig;
  personality: AgentPersonality;
  generatedSkillsMd: string;
  isLaunching: boolean;
  launchResult: { success: boolean; txSignature?: string; mint?: string; error?: string; agentId?: string } | null;

  setStep: (step: number) => void;
  setAvatar: (avatar: Partial<AvatarConfig>) => void;
  addSkill: (skill: SkillConfig) => void;
  removeSkill: (skillId: string) => void;
  updateSkillParams: (skillId: string, params: Record<string, unknown>) => void;
  setTokenomics: (tokenomics: Partial<TokenomicsConfig>) => void;
  setXAccount: (xAccount: Partial<XAccountConfig>) => void;
  setPersonality: (personality: Partial<AgentPersonality>) => void;
  setGeneratedSkillsMd: (md: string) => void;
  setIsLaunching: (launching: boolean) => void;
  setLaunchResult: (result: AgentState["launchResult"]) => void;
  reset: () => void;
}

const defaultAvatar: AvatarConfig = {
  characterType: "humanoid",
  style: "pixel",
  backgroundColor: "#6366f1",
  accentColor: "#a855f7",
  primaryColor: "#6366f1",
  secondaryColor: "#a855f7",
  shape: "circle",
  expression: "happy",
  accessory: "none",
  pattern: "solid",
  bodyType: "humanoid",
  headShape: "round",
  eyeStyle: "glowing",
  particleEffect: "none",
  imageDataUrl: undefined,
};

const defaultTokenomics: TokenomicsConfig = {
  name: "",
  symbol: "",
  buybackPercent: 50,
  devBuyAmountSol: 0.5,
  description: "",
};

const defaultXAccount: XAccountConfig = {
  enabled: false,
  username: "",
  postingFrequency: 4,
  replyToMentions: true,
  joinAgentHive: true,
  topics: "",
};

const defaultPersonality: AgentPersonality = {
  archetype: "optimist",
  customPrompt: "",
  tone: "friendly",
  language: "english",
};

export const useAgentStore = create<AgentState>((set) => ({
  currentStep: 0,
  avatar: defaultAvatar,
  skills: [],
  tokenomics: defaultTokenomics,
  xAccount: defaultXAccount,
  personality: defaultPersonality,
  generatedSkillsMd: "",
  isLaunching: false,
  launchResult: null,

  setStep: (step) => set({ currentStep: step }),
  setAvatar: (avatar) =>
    set((state) => ({ avatar: { ...state.avatar, ...avatar } })),
  addSkill: (skill) =>
    set((state) => ({ skills: [...state.skills, skill] })),
  removeSkill: (skillId) =>
    set((state) => ({ skills: state.skills.filter((s) => s.id !== skillId) })),
  updateSkillParams: (skillId, params) =>
    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === skillId ? { ...s, params: { ...s.params, ...params } } : s
      ),
    })),
  setTokenomics: (tokenomics) =>
    set((state) => ({ tokenomics: { ...state.tokenomics, ...tokenomics } })),
  setXAccount: (xAccount) =>
    set((state) => ({ xAccount: { ...state.xAccount, ...xAccount } })),
  setPersonality: (personality) =>
    set((state) => ({ personality: { ...state.personality, ...personality } })),
  setGeneratedSkillsMd: (md) => set({ generatedSkillsMd: md }),
  setIsLaunching: (launching) => set({ isLaunching: launching }),
  setLaunchResult: (result) => set({ launchResult: result }),
  reset: () =>
    set({
      currentStep: 0,
      avatar: defaultAvatar,
      skills: [],
      tokenomics: defaultTokenomics,
      xAccount: defaultXAccount,
      personality: defaultPersonality,
      generatedSkillsMd: "",
      isLaunching: false,
      launchResult: null,
    }),
}));
