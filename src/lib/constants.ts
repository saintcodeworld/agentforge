export const PLATFORM_NAME = "AgentForge";
export const PLATFORM_FEE_SOL = 0.05;
export const PUMPFUN_API_BASE = "https://pumpportal.fun/api";
export const PUMPFUN_IPFS_API = "https://pump.fun/api/ipfs";
export const AGENT_HIVE_HANDLE = "@AgentForgeHQ";
export const AGENT_HIVE_HASHTAG = "#AgentHive";
export const AGENT_HIVE_COMMUNITY_ID = "YOUR_X_COMMUNITY_ID";

export const ACCEPTED_CURRENCIES = ["SOL", "USDC", "USDT", "USD1"] as const;

export const PERSONALITY_ARCHETYPES = [
  { id: "optimist", label: "The Optimist", description: "Always bullish, hypes everything, sees the bright side" },
  { id: "skeptic", label: "The Skeptic", description: "Questions claims, asks for proof, analytical" },
  { id: "comedian", label: "The Comedian", description: "Makes jokes, posts memes, entertains" },
  { id: "scholar", label: "The Scholar", description: "Shares data, research, long-form threads" },
  { id: "hypeman", label: "The Hype Man", description: "Celebrates wins, pumps energy, rallies community" },
  { id: "philosopher", label: "The Philosopher", description: "Asks deep questions, abstract thinking" },
] as const;

export const SKILL_TEMPLATES = [
  {
    id: "payment-processor",
    name: "Payment Processor",
    icon: "Wallet",
    description: "Accept SOL/USDC payments for products or services",
    category: "monetization",
    params: [
      { key: "accepted_currencies", label: "Accepted Currencies", type: "multi-select", options: ["SOL", "USDC", "USDT"], default: "SOL" },
      { key: "min_payment", label: "Minimum Payment (SOL)", type: "number", default: 0.1 },
      { key: "auto_reply", label: "Auto-reply on Payment", type: "text", default: "Thanks for your purchase!" },
    ],
  },
  {
    id: "storefront",
    name: "Storefront",
    icon: "ShoppingBag",
    description: "Sell digital goods with automatic delivery",
    category: "monetization",
    params: [
      { key: "product_type", label: "Product Type", type: "select", options: ["Digital Download", "API Access", "NFT", "Custom"] },
      { key: "price", label: "Price (SOL)", type: "number", default: 0.5 },
      { key: "delivery_method", label: "Delivery Method", type: "select", options: ["Download Link", "Email", "DM", "On-chain"] },
    ],
  },
  {
    id: "social-poster",
    name: "Social Poster",
    icon: "Megaphone",
    description: "Auto-post updates to X/Telegram/Discord",
    category: "social",
    params: [
      { key: "platforms", label: "Platforms", type: "multi-select", options: ["X (Twitter)", "Telegram", "Discord"] },
      { key: "frequency", label: "Posts Per Day", type: "number", default: 4 },
      { key: "topics", label: "Topics to Post About", type: "text", default: "" },
    ],
  },
  {
    id: "community-qa",
    name: "Community Q&A",
    icon: "MessageCircle",
    description: "Answer questions from a knowledge base",
    category: "community",
    params: [
      { key: "knowledge_source", label: "Knowledge Source", type: "select", options: ["Upload Documents", "Website URL", "Manual Input"] },
      { key: "response_style", label: "Response Style", type: "select", options: ["Concise", "Detailed", "Friendly", "Professional"] },
    ],
  },
  {
    id: "market-analyst",
    name: "Market Analyst",
    icon: "TrendingUp",
    description: "Post token price analysis and alerts",
    category: "analytics",
    params: [
      { key: "analysis_type", label: "Analysis Type", type: "multi-select", options: ["Price Action", "Volume", "Holder Distribution", "Burn Rate"] },
      { key: "alert_threshold", label: "Price Alert Threshold (%)", type: "number", default: 10 },
    ],
  },
  {
    id: "content-creator",
    name: "Content Creator",
    icon: "Palette",
    description: "Generate and post images/text content",
    category: "social",
    params: [
      { key: "content_type", label: "Content Type", type: "multi-select", options: ["Memes", "Infographics", "Threads", "Stories"] },
      { key: "style", label: "Content Style", type: "select", options: ["Casual", "Professional", "Humorous", "Educational"] },
    ],
  },
  {
    id: "whale-alert",
    name: "Whale Alert",
    icon: "Bell",
    description: "Monitor and announce large token transactions",
    category: "analytics",
    params: [
      { key: "threshold_sol", label: "Minimum Transaction (SOL)", type: "number", default: 10 },
      { key: "notify_channels", label: "Notify On", type: "multi-select", options: ["X (Twitter)", "Telegram", "Discord"] },
    ],
  },
  {
    id: "newsletter",
    name: "Newsletter",
    icon: "Mail",
    description: "Send periodic updates to subscribers",
    category: "community",
    params: [
      { key: "frequency", label: "Frequency", type: "select", options: ["Daily", "Weekly", "Bi-weekly", "Monthly"] },
      { key: "topics", label: "Newsletter Topics", type: "text", default: "" },
    ],
  },
] as const;

export const AVATAR_CHARACTER_TYPES = [
  { id: "humanoid", label: "Humanoid", description: "Human-like character" },
  { id: "robot", label: "Robot", description: "Mechanical android" },
  { id: "animal", label: "Animal", description: "Creature character" },
  { id: "abstract", label: "Abstract", description: "Geometric form" },
] as const;

export const AVATAR_STYLES = [
  { id: "geometric", label: "Geometric", description: "Clean shapes & patterns" },
  { id: "pixel", label: "Pixel Art", description: "Retro 8-bit style" },
  { id: "gradient", label: "Gradient", description: "Smooth color blends" },
  { id: "minimal", label: "Minimal", description: "Simple & elegant" },
] as const;

export const AVATAR_SHAPES = [
  { id: "circle", label: "Circle" },
  { id: "square", label: "Square" },
  { id: "hexagon", label: "Hexagon" },
  { id: "diamond", label: "Diamond" },
] as const;

export const AVATAR_EXPRESSIONS = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "cool", label: "Cool", emoji: "😎" },
  { id: "excited", label: "Excited", emoji: "🤩" },
  { id: "focused", label: "Focused", emoji: "🤔" },
  { id: "friendly", label: "Friendly", emoji: "😄" },
  { id: "mysterious", label: "Mysterious", emoji: "😏" },
] as const;

export const AVATAR_ACCESSORIES = [
  { id: "none", label: "None" },
  { id: "crown", label: "Crown" },
  { id: "halo", label: "Halo" },
  { id: "sparkles", label: "Sparkles" },
  { id: "stars", label: "Stars" },
] as const;

export const AVATAR_PATTERNS = [
  { id: "solid", label: "Solid" },
  { id: "dots", label: "Dots" },
  { id: "stripes", label: "Stripes" },
  { id: "grid", label: "Grid" },
  { id: "waves", label: "Waves" },
] as const;

export const AVATAR_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#eab308", "#84cc16", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#1d4ed8", "#ffffff",
] as const;
