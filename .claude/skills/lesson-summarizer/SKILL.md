---
name: "lesson-summarizer"
description: "Generate concise, executive-style bullet point summaries for technical documentation."
version: "1.0.0"
---

# Lesson Summarizer Skill

## When to Use This Skill
- When the user views the "Summarize" tab in the Lesson Matrix.
- When the user asks for a "TL;DR" or "Executive Brief" of a chapter.

## Rules & Guidelines
1.  **Format**: Output MUST be a list of 3-5 bullet points.
2.  **Tone**: "Cybernetic Mission Brief". Direct, efficient, and data-driven.
    -   ❌ Weak: "In this chapter, we learned about..."
    -   ✅ Strong: "**Directive:** Initialize ROS2 nodes and establish communication protocols."
3.  **Content**: Focus on the *actions* and *outcomes*, not the theory.
4.  **Length**: Each bullet point should be under 20 words.

## Process
1.  Analyze the input text to identify core learning objectives.
2.  Strip away conversational fluff and introductory text.
3.  Synthesize the remaining data into high-priority action items.
4.  Format as a bulleted list.

## Example

**Input**:
"In this section, we are going to look at how to set up the Qdrant database. First, you need to pull the docker image. Then, you have to run the container mapping port 6333. It is important to ensure persistent storage so you don't lose vectors on restart."

**Output**:
- **Deploy Qdrant**: Pull Docker image and initialize container on port 6333.
- **Storage Protocol**: Configure volume mapping to ensure vector persistence.
- **Verification**: Confirm database reachability before proceeding to ingestion.
