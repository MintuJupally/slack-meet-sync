# Slack Meet Sync

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

## How to Get the Slack Token

1. **Create a Slack App**  
   - Go to [api.slack.com/apps](https://api.slack.com/apps)  
   - Click **Create New App** and complete the creation steps.  

2. **Set OAuth Permissions**  
   - On the app’s configuration page, go to **OAuth & Permissions** in the left sidebar.  
   - Scroll down to **Scopes → User Token Scopes**.  
   - Add the following scopes:  
     - `users.profile:read`  
     - `users.profile:write`  

3. **Install the App to Your Workspace**  
   - Scroll back to the top of the **OAuth & Permissions** page.  
   - Click **Install App to Workspace** and approve access.  

4. **Get Your User OAuth Token**  
   - After installation, you’ll see a **User OAuth Token** on the same page.  
   - Copy this token — it is your `SLACK_TOKEN` to use in the `.env` file.  
