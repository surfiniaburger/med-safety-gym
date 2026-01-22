# Bring Any Evaluation To Life - Technical Documentation

## Overview
**Bring Any Evaluation To Life** is a "Concept Extraction" and "Instant App" generator. It allows users to upload *any* visual input—a napkin sketch, a photo of a desk, a patent diagram—and instantly generates a fully functional, gamified HTML5/React application that embodies the "spirit" or "utility" of that image.

## Architecture

### File Structure
```
/
├── App.tsx                 # Main Flow (Upload -> Loading -> Preview)
├── index.css               # Styling (Dot Grid, Glassmorphism)
├── components/
│   ├── Hero.tsx            # Landing Page UI
│   ├── InputArea.tsx       # Drag & Drop / File Input
│   ├── LivePreview.tsx     # Sandboxed Iframe Renderer
│   └── CreationHistory.tsx # Sidebar of past generations
└── services/
    └── gemini.ts           # The Core AI Factory
```

### Core Components

#### 1. Gemini Service (`services/gemini.ts`)
The intelligence core.
-   **Input**: Takes a text prompt + optional Base64 Image.
-   **System Instruction**: The "Magic Sauce". It explicitly instructs the model:
    -   *Gamify Mundane Objects*: "If you see a desk, make a cleanup game." "If you see a clock, make a time tool."
    -   *No External Assets*: "Do NOT use `<img>` tags. Draw everything with CSS shapes, SVGs, or Emojis."
    -   *Single File Output*: "Return raw HTML that runs standalone."
-   **Model**: `gemini-1.5-pro` (preview) is used for its superior reasoning and coding capabilities.

#### 2. LivePreview.tsx
-   **Sandboxing**: Displays the generated code inside an `<iframe>`. This isolates the AI's CSS/JS from the main application, preventing style conflicts or security issues.
-   **State Injection**: Capable of injecting the original image data into the generated app if needed (e.g., for valid image processing apps).

#### 3. Styling (`index.css`)
-   **Premium Aesthetic**: Implements a "Dark Mode" aesthetic with:
    -   `bg-dot-grid`: A CSS radial-gradient pattern.
    -   `backdrop-blur`: Heavy use of glassmorphism for UI cards.
    -   **Animations**: Smooth transitions using Tailwind classes (`transition-all duration-700`).

## Key Technical Features
1.  **Abstract Representation**: The prompt forces the AI to be creative with *rendering*. Instead of relying on assets it can't access, it uses CSS Art and Emojis to create surprisingly high-fidelity UIs.
2.  **Concept Mapping**: The system doesn't just doing OCR. It performs semantic understanding (Sketch -> App) and "Gamification" (Object -> Interaction), ensuring the output is always an *experience*, not just a static page.
