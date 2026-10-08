# Habit & Focus Dashboard

A single-page productivity app that combines a Pomodoro focus timer, daily habit streaks, tasks and progress charts.
Built with Vite, React 19 and TypeScript. There is no backend and no chart library: everything is saved in the
browser's localStorage, and the charts are hand-written SVG.

## Features

**Focus timer**
- Focus, short break and long break (a long break after every 4 focus sessions), with editable lengths (⚙).
- Timestamp-based, so it stays accurate in background tabs. The countdown also shows in the tab title.
- Pick a task to work on and the finished session's minutes are credited to it.
- Daily focus goal with a progress ring, plus a sound on/off toggle.
- Keyboard shortcuts: `Space` start/pause, `R` reset, `S` skip, `1` `2` `3` switch mode.

**Habits and tasks**
- Add, rename, check off and delete habits, with current and best streaks and a clickable 7-day view for backfilling.
- A "streak at risk" warning when a live streak has not been extended today.
- Tasks with per-task focus time, and a "Completed work" log grouped by day.
- A small confetti burst when you finish a task (skipped if you prefer reduced motion).

**Progress**
- Overview row: active streak, best streak, tasks completed and total focus time.
- Weekly bar chart, switchable between habit completion % and focus minutes.
- 12-week consistency heatmap.

**Your data**
- Export everything to a JSON file, import it back (validated before anything is replaced), or reset.
- Installable as an app and works offline once loaded (web app manifest and a small hand-written service worker).
- Light and dark themes. Both pass the WCAG AA text contrast ratio (4.5:1), checked with a script.

## Run

```bash
npm install
npm run dev      # development server
npm run build    # type-check and production build
npm run preview  # serve the production build (the service worker only registers in a production build)
```

## Notes

- Data lives in your browser only. Clearing site data removes it, so use **Export data** for a backup.
- Habits have no creation date, so a newly added habit makes earlier days in the heatmap look less complete.
