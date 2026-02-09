# Agentic Vision: Screenshot-to-HTML Flow

This document details the implementation of the "Agentic Vision" loop, where Gemini 3 Flash is used to inspect, critique, and regenerate interactive evaluation sessions based on visual evidence.

---

## 1. The Vision Loop Flow

We will follow an iterative **Think, Act, Observe** process as defined in `Skill.md`, integrated into the Gauntlet UI.

### Step-by-Step Process:
1. **User Feedback**: 
   - While an interactive quiz/simulation is running, a floating form (ElevenLabs UI or custom React) allows the user to leave notes (e.g., "The phrasing here is too leading," "Make the chart more interactive").
2. **Planning**: 
   - A **Planner Agent** processes these notes and generates a text-based refinement plan.
3. **Approval**: 
   - The user reviews and clicks "Apply Refinements."
4. **Visual Capture**:
   - The system takes a screenshot of the current sandboxed HTML session.
5. **Agentic Vision Investigation**:
   - The screenshot is sent to **Gemini 3 Flash** with the refinement plan.
   - The model uses **Agentic Vision** (zoom/crop) to inspect specific UI elements or text blocks.
6. **Code Generation**:
   - Based on its visual findings and the plan, Gemini generates a *new* HTML/JS block for the session.
7. **Session Update**:
   - The previous session is cancelled and replaced by the new, improved version in the sandbox.

---

## 2. Implementation Guidelines (Per `practices.md`)

- **Modularity**: The "Visual Capture" logic should be decoupled from the "HTML Generation" logic.
- **Abstraction**: Use a `VisionService` class to handle image processing and API calls, keeping the React components lean.
- **Small Steps**:
  - `v1`: Manual screenshot upload + HTML regeneration.
  - `v2`: Automated screenshot capture of the iframe.
  - `v3`: "Zoom and Inspect" loop where the model asks for specific crops before generating the final HTML.

---

## 3. UI Component Idea: Floating Observation Form
Instead of a separate page, we implement a floating, semi-transparent overlay that follows the session.
- **Input**: Markdown-compatible text area.
- **Actions**: `[Preview Plan]` | `[Approve & Regenerate]`.
- **Integration**: Can eventually be hosted as a client tool in the ElevenLabs Voice UI overlay.
