# Priority Manager MVP

A planner-style MVP inspired by a paper monthly planner and a priority-first workflow.

## What is included

- Month planner view with paper-style daily cells
- Today page with fixed appointments, A/B tasks, and a protected time block
- 4D triage tool: Do, Date, Delegate, Delete
- Communication planner with contact logs and linked follow-up tasks
- Goals and strategy page with SMART fields
- Someday file with activation into live work
- Review page with daily wins, export, and reset

## Persistence

This MVP stores data in the browser with `localStorage`.

That makes it very easy to deploy on Vercel with no database setup, but the data is tied to the browser profile you use. For multi-device sync later, swap the storage layer for Postgres or another hosted database.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Deploy to Vercel

### Option 1: Git-connected deployment

1. Push this folder to GitHub.
2. Import the repo into Vercel.
3. Deploy.

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel --prod
```

## Suggested next upgrades

- Add Google Calendar sync for fixed appointments
- Replace localStorage with Postgres for account-based sync
- Add push notifications and offline capture queue
- Add recurring routines and weekly review templates
