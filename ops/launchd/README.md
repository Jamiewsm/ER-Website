# launchd Health Check

This folder contains a simple 10-minute health check for the deployed coach web app.

## What it does

- sends an HTTP request to the deployed Pages URL
- appends the status code to a local log file
- runs every 600 seconds

## Files

- `coachportal-webapp-check.sh`
- `com.er.coachportal.webapp.check.plist`

## Install

```bash
mkdir -p "${HOME}/Library/Logs/coachportal-webapp-check"
cp "/Users/Joeyswoo/Library/Mobile Documents/com~apple~CloudDocs/Desktop/Visual Studio Code/ER-Website/ops/launchd/com.er.coachportal.webapp.check.plist" "${HOME}/Library/LaunchAgents/"
launchctl unload "${HOME}/Library/LaunchAgents/com.er.coachportal.webapp.check.plist" 2>/dev/null || true
launchctl load "${HOME}/Library/LaunchAgents/com.er.coachportal.webapp.check.plist"
```

## Uninstall

```bash
launchctl unload "${HOME}/Library/LaunchAgents/com.er.coachportal.webapp.check.plist"
rm -f "${HOME}/Library/LaunchAgents/com.er.coachportal.webapp.check.plist"
```

## Logs

- `${HOME}/Library/Logs/coachportal-webapp-check/health.log`
- `${HOME}/Library/Logs/coachportal-webapp-check/stdout.log`
- `${HOME}/Library/Logs/coachportal-webapp-check/stderr.log`
