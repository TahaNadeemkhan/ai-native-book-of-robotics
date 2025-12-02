---
name: "urdu-translator"
description: "Translate technical programming tutorials from English to Urdu while preserving technical terminology and formatting."
version: "1.0.0"
---

# Urdu Translation Skill

## When to Use This Skill
- When translating Docusaurus markdown/mdx content to Urdu.
- When the user asks to "translate this chapter" or "generate Urdu content".

## Rules & Guidelines
1.  **Tone**: Conversational but respectful (Roman Urdu or Proper Urdu script as requested).
2.  **Technical Terms**: NEVER translate technical keywords.
    -   ❌ Ghalat: "Data ko Database mai mehfooz karen."
    -   ✅ Sahi: "Data ko **Database** mai save karen."
3.  **Formatting**: Keep all Markdown formatting (Headers, Bold, Code Blocks) exactly as is.
4.  **Code**: Do NOT translate code comments or variable names inside code blocks.

## Process
1.  Read the input English content.
2.  Identify technical terms (React, Hook, Component, Props, Auth).
3.  Translate the explanatory text into clear Urdu.
4.  Verify that formatting matches the original.

## Example

**Input**:
"To create a new user, we use the `signUp` function provided by better-auth. It saves the user in the Postgres database."

**Output**:
"Naya user create karne ke liye, hum better-auth ka provide kiya hua `signUp` function use karte hain. Yeh user ko Postgres database mein save karta hai."
