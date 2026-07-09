# SyncGuard

An AI-augmented connector health dashboard that monitors an organization's GitHub activity — built to mirror how enterprise identity/access governance tools (like those integrating with Salesforce, Workday, or SAP) track and normalize data across connected systems.

## The model

SyncGuard is designed as a **company-wide monitoring tool**, not a personal per-user tool. One GitHub organization is connected as the data source; any authenticated team member can log in to view sync activity, ask questions about the data, and monitor connector health — similar to how tools like Datadog or Splunk work: everyone views the same shared, centrally-monitored system, with login controlling access rather than data ownership.

## What it does

- **Authenticated GitHub connector** — pulls issue/repo data via OAuth2-style token authentication, respecting GitHub's API rate limits
- **Multi-repo organization sync** — syncs every repository under a GitHub org or user account in a single operation
- **Normalization layer** — converts GitHub's raw API responses into a clean, unified internal schema (designed to extend to other systems like Salesforce/Workday later)
- **Delta detection** — uses content hashing to detect and log only genuine changes between syncs, avoiding redundant writes and unnecessary API usage
- **JWT-authenticated dashboard** — real user accounts, hashed passwords, protected API routes
- **AI natural language Q&A** — ask questions about your synced data in plain English; Gemini generates a safe, read-only SQL query, executes it, and explains the result conversationally
- **AI-generated sync summaries** — every sync produces a short, human-readable summary automatically
- **Activity leaderboard** — surfaces who's most active across the organization's tracked repos, at a glance

## Tech stack

**Backend:** FastAPI, PostgreSQL, SQLAlchemy, JWT (python-jose), bcrypt (passlib)
**Frontend:** Next.js, React, TypeScript, Tailwind CSS
**AI:** Google Gemini API (schema-grounded SQL generation + natural language summarization)
**Planned:** Docker, AWS EC2, AWS Secrets Manager, AWS SES

## Architecture

GitHub API → FastAPI backend (auth, normalization, delta detection) → PostgreSQL → Next.js dashboard, with a Gemini-powered AI layer reasoning over the normalized data for Q&A and summarization.

## Status

Actively in development. Core sync engine, authentication, and AI layer are complete and functional. Docker containerization and AWS deployment are in progress.