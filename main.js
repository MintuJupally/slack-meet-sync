const dotenv = require('dotenv');
dotenv.config();

const { execSync } = require('child_process');

const SLACK_TOKEN = process.env.SLACK_TOKEN || null;

const MEET_STATUSES = {
    'standup': {
        message: 'In standup',
        emoji: ':standing_person:'
    },
    'meet': {
        message: 'In a meet',
        emoji: ':google_meet:'
    }
}

// Function to get all Chrome tab URLs (macOS only)
function getAllChromeTabs() {
    try {
        // Unescaped JXA code, with real newlines
        const jxaScript = `
  (function() {
    var Chrome = Application("Google Chrome");
    if (!Chrome.running()) return "[]";
    var output = [];
    var wins = Chrome.windows();
    for (var i = 0; i < wins.length; i++) {
      var tabs = wins[i].tabs();
      for (var j = 0; j < tabs.length; j++) {
        output.push({
          windowIndex: i + 1,
          tabIndex:   j + 1,
          title:      tabs[j].title(),
          url:        tabs[j].url()
        });
      }
    }
    return JSON.stringify(output);
  })()
  `;

        // Feed it via stdin; no shell-escaping nightmares
        const stdout = execSync('osascript -l JavaScript -', {
            input: jxaScript,
            encoding: 'utf8'
        }).trim();

        return JSON.parse(stdout);
    } catch (e) {
        console.error('Error getting Chrome tabs:', e);
        return [];
    }
}

// Function to update Slack status
async function updateSlackStatus(statusText, emoji = ':telephone_receiver:') {
    const response = await fetch('https://slack.com/api/users.profile.set', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${SLACK_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            profile: {
                status_text: statusText,
                status_emoji: emoji,
                status_expiration: 0
            }
        })
    });

    const data = await response.json();
    if (!data.ok) {
        console.error('Slack error:', data);
    } else {
        console.log('Slack status updated:', statusText);
    }
}

function getMeetStatus(meet) {
    const standupTitles = ['standup', 'stand up'];

    if (standupTitles.some(title => meet.title.toLowerCase().includes(title))) {
        return { status: 'In standup', emoji: ':standing_person:' };
    }

    return { status: 'In a meet', emoji: ':google_meet:' };
}

async function getCurrentStatus() {
    const response = await fetch('https://slack.com/api/users.profile.get', {
        headers: {
            'Authorization': `Bearer ${SLACK_TOKEN}`
        }
    });

    const data = await response.json();
    return { status: data.profile.status_text, emoji: data.profile.status_emoji };
}

async function checkAndUpdateStatus() {
    const timeNow = new Date();
    const timeNowString = timeNow.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    console.log('Time now:', timeNowString, '-------------------------------');

    try {
        const tabs = getAllChromeTabs();
        // console.log('All Chrome tabs:', tabs);

        const meetTabs = tabs.filter(tab => tab.url.includes('meet.google.com'));
        const joinedMeets = meetTabs.filter(tab => /meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(tab.url));


        const currentStatus = await getCurrentStatus();
        const currentStatusType = Object.keys(MEET_STATUSES).find(key => currentStatus.status === MEET_STATUSES[key].message && currentStatus.emoji === MEET_STATUSES[key].emoji);

        // console.log({ currentStatus, currentStatusType });

        if (joinedMeets.length > 0) {
            const joinedMeet = joinedMeets[0];
            const joinedMeetStatus = getMeetStatus(joinedMeet);

            // console.log({ joinedMeetStatus, currentStatus });

            if (joinedMeetStatus.status === currentStatus.status && joinedMeetStatus.emoji === currentStatus.emoji) {
                console.log('Already in meet. Status is up to date.');
            } else {
                console.log('Joined meet:', joinedMeet);
                await updateSlackStatus(joinedMeetStatus.status, joinedMeetStatus.emoji);
            }
        } else if (currentStatusType) {
            console.log('No joined meet found. Clearing existing status -', currentStatus.status);
            await updateSlackStatus('', '');
        } else {
            console.log('No joined meet. No meet status found. No action needed.');
        }
    } catch (error) {
        console.error('Error checking and updating status:', error);
    }
}

// Run immediately, then every 30 seconds
checkAndUpdateStatus();
setInterval(checkAndUpdateStatus, 30000); // 30 seconds
