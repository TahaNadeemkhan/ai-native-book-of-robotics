/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./docusaurus.config.js",
    "./docs/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'cb-background': '#0c0f12',
        'cb-neon-green': '#00f7a3',
        'cb-cyan-accent': '#00eaff',
        'cb-soft-mint': '#c4fff9',
        'cb-muted-grey': '#9aa5b1',
      },
    },
  },
};
