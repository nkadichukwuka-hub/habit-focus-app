# Habit & Focus Dashboard: project context

Portfolio project for Goshen Nkadi ("Claude Code & AI Developer"). When finished it gets added to the portfolio site's Projects section (AI Apps, next to Budget Tracker) with a live Vercel link, a screenshot and an optional short demo video.

## Stack and brand
- Vite 7 + React 19 + TypeScript, no backend, no chart library. All data lives in localStorage (`hf:habits`, `hf:focus`, `hf:cycle`, `hf:theme`).
- Brand: dark brown `#0e0a07`, gold `#d4a94f`, cream text, Sora headings, Inter body. Light and dark themes via `data-theme`.

## What is built (v1, builds and type-checks cleanly)
- `src/components/Timer.tsx`: Pomodoro (25/5/15, long break after 4 focus sessions), timestamp-based, shows the countdown in the tab title, WebAudio beep. Skip does not log a session.
- `src/components/Habits.tsx`: add, check off and delete habits, current and best streak, clickable 7-day dots for backfill.
- `src/components/WeekChart.tsx`: hand-written SVG bar chart for the last 7 days, toggling Habits % and Focus minutes.
- `src/App.tsx` (theme toggle, state), `src/styles.css`, `src/lib/{storage,dates,types}.ts`.

## State of the work
- The user has corrections to make before the first commit and push. Ask for them first.
- There is no git repo yet. Plan: `git init`, commit, push to GitHub, deploy on Vercel, then add the card to the portfolio.
- Possible extras the user may want: editable timer durations, habit editing, export/reset data.

## Gotchas
- The original folder `C:\Users\nkadi\habit & focus app` is an obsolete copy. The `&` in its name breaks npm scripts on Windows, and it could not be renamed because the Claude app held a lock on it. The user can delete it after restarting the app. Work only in `habit-focus-app`.
- Run `npm install` first. `node_modules` was not copied.
- The portfolio repo is a separate Next.js 16 / Tailwind 4 project (projects are defined in `components/Projects.tsx`). Its folder must be added to the session before editing it.
