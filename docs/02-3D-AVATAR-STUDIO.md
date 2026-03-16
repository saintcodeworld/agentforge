# 2D Avatar Studio

## What It Does

The 2D Avatar Studio lets creators design a unique visual identity for their AI agent. This avatar is used as:

- The agent's profile picture on X (Twitter)
- The visual in the embeddable chat widget
- The identity on the Agent Hive discovery page
- **The token metadata image uploaded to PumpFun/IPFS** (automatically captured and sent)

## How It Works

Built with **HTML5 Canvas**, the studio renders a customizable 2D avatar in real-time. The avatar is automatically converted to a PNG data URL and stored in the agent configuration, then uploaded to IPFS as the token's metadata image during launch.

### Avatar Styles

| Style | Description |
|------|------------|
| **Geometric** | Clean shapes and patterns with sharp edges and modern aesthetics |
| **Pixel Art** | Retro 8-bit style with pixelated rendering |
| **Gradient** | Smooth color blends with radial gradients |
| **Minimal** | Simple and elegant design with solid colors |

### Customization Options

- **Background Color** — 16 preset colors for the avatar background
- **Accent Color** — 16 preset colors for the main avatar shape and details
- **Shape** — Circle, Square, Hexagon, Diamond
- **Expression** — Happy 😊, Cool 😎, Excited 🤩, Focused 🤔, Friendly 😄, Mysterious 😏
- **Accessories** — None, Crown, Halo, Sparkles, Stars
- **Background Pattern** — Solid, Dots, Stripes, Grid, Waves

### Technical Details

- **File:** `src/components/two-d/avatar-2d.tsx` — Canvas-based 2D avatar renderer
- **File:** `src/components/launch/avatar-studio.tsx` — UI controls panel
- **Rendering:** Uses HTML5 Canvas 2D context with procedural drawing
- **Image Capture:** Avatar is automatically converted to PNG data URL via `canvas.toDataURL()`
- **Metadata Integration:** The `imageDataUrl` is stored in the avatar config and sent to `/api/launch-agent`, which uploads it to IPFS as the token metadata image

### Key Files

```
src/components/two-d/avatar-2d.tsx       — 2D canvas renderer
src/components/launch/avatar-studio.tsx  — UI controls
src/lib/constants.ts                     — AVATAR_STYLES, AVATAR_SHAPES, AVATAR_EXPRESSIONS, etc.
src/lib/store.ts                         — AvatarConfig type with imageDataUrl field
src/app/api/launch-agent/route.ts        — Uploads avatar image to IPFS
```

## Avatar Image → Token Metadata Flow

1. User customizes avatar in the 2D Avatar Studio
2. Canvas automatically generates PNG image on every change
3. `onImageGenerated` callback stores the data URL in `avatar.imageDataUrl`
4. When launching, `/api/launch-agent` extracts the base64 data
5. Converts to Blob and uploads to PumpFun IPFS endpoint
6. IPFS returns `metadataUri` which is used in token creation
7. Token metadata now contains the custom avatar image

## Future Improvements

- Upload custom images (drag & drop)
- AI-generated avatars based on personality
- Animated avatar variations
- Export avatar as SVG for scalability
- Premium avatar templates (paid, part of monetization)
