# SyncGuard

An AI-powered GitHub monitoring and synchronization platform that helps organizations monitor repository activity, detect changes, generate AI-powered insights, and track synchronization history through a secure web dashboard.

**Live Demo:** https://sync-guard-mu.vercel.app/

---

## Overview

SyncGuard was built to simulate how enterprise connector monitoring platforms manage and monitor external systems. Instead of monitoring services like Salesforce or Workday, SyncGuard connects to GitHub and provides a centralized dashboard where authenticated team members can monitor repository activity, synchronize project data, receive notifications, and interact with their data using Artificial Intelligence.

Unlike a personal dashboard, SyncGuard follows a shared monitoring model where all authenticated users view the same synchronized organizational data, making it suitable for team-wide repository monitoring.

---

# Features

- Secure JWT-based user authentication
- GitHub repository synchronization using GitHub REST API
- Organization-wide multi-repository monitoring
- Repository normalization into a unified internal schema
- Delta detection using content hashing to identify only meaningful changes
- Synchronization history tracking
- AI-powered repository summaries
- Natural language querying using Google Gemini AI
- Repository anomaly detection
- Activity leaderboard across repositories
- Dashboard notifications
- Automated email alerts using AWS SES
- Production deployment using Railway and Vercel

---

# System Workflow

```
                User
                  │
                  ▼
        Next.js Web Dashboard
                  │
                  ▼
        FastAPI REST Backend
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
 GitHub API   PostgreSQL   Gemini AI
        │         │         │
        └─────────┼─────────┘
                  ▼
      AI Insights & Dashboard
                  │
                  ▼
         AWS SES Email Alerts
```

---

# How It Works

1. Users authenticate using JWT authentication.

2. A synchronization request fetches repository data through the GitHub API.

3. Repository data is normalized into a consistent internal format.

4. Newly synchronized data is compared with existing records using hashing to detect:

- New records
- Updated records
- Deleted records

5. Only meaningful changes are stored while preserving synchronization history.

6. Google Gemini AI analyzes synchronized data to:

- Generate repository summaries
- Answer natural language questions
- Detect unusual repository activity

7. Notifications are created inside the dashboard and email alerts are sent when failures or anomalies are detected.

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- FastAPI
- SQLAlchemy
- JWT Authentication
- bcrypt (Passlib)
- REST APIs

## Database

- PostgreSQL (Neon)

## Artificial Intelligence

- Google Gemini API
- Natural Language to SQL
- AI Repository Summaries
- AI Question Answering

## External Integrations

- GitHub REST API
- AWS Simple Email Service (SES)

## Deployment

- Railway (Backend)
- Vercel (Frontend)

---

# Core Components

## Authentication

Implements secure JWT authentication with hashed passwords and protected API endpoints.

---

## Synchronization Engine

Synchronizes GitHub repositories while maintaining synchronization history and detecting meaningful changes between executions.

---

## Normalization Layer

Converts raw GitHub API responses into a consistent internal schema designed for future expansion to additional connectors.

---

## AI Layer

Google Gemini enables users to ask questions about synchronized repository data using natural language. The system generates safe SQL queries, retrieves relevant information, and returns conversational responses.

---

## Notification System

Generates dashboard notifications and sends automated email alerts whenever synchronization failures or anomalies are detected.

---

# Skills Demonstrated

This project demonstrates practical experience with:

- Full-Stack Development
- Backend API Development
- Authentication & Authorization
- Database Design
- ORM (SQLAlchemy)
- REST API Design
- GitHub API Integration
- Artificial Intelligence Integration
- Natural Language Processing
- Cloud Deployment
- Environment Variable Management
- CORS Configuration
- Email Automation
- Production Debugging
- Version Control with Git & GitHub

---

# Project Structure

```
SyncGuard
│
├── backend/
│   ├── auth.py
│   ├── database.py
│   ├── github_client.py
│   ├── ai_insights.py
│   ├── notification_service.py
│   ├── models.py
│   └── main.py
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
│
└── README.md
```

---

# Future Improvements

- Docker containerization
- Role-based access control (RBAC)
- Additional enterprise connectors (Salesforce, Workday, Jira)
- Real-time synchronization using webhooks
- Advanced analytics dashboard
- Kubernetes deployment

---

# Author

**Muhammad Hamza**

AI Undergraduate | Machine Learning | Full-Stack AI Developer

LinkedIn:
https://www.linkedin.com/in/muhammad-hamza-5663a128a


---

## Live Demo

https://sync-guard-mu.vercel.app/