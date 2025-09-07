# Slack Status Sync

Automatically syncs your Slack status based on active Google Meet tabs in Chrome (macOS only).

## Setup

1. Install dependencies: `npm install`
2. Create `.env` file with `SLACK_TOKEN=<your_slack_token>`
3. Run: `npm start`

## Features

- Detects when you join/leave Google Meet calls
- Updates Slack status to "In a meet" or "In standup"
- Clears status when no active meetings
- Runs every 30 seconds
