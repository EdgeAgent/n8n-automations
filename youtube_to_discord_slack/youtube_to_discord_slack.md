# New YouTube Video Notification to Discord/Slack

## Description
This n8n workflow monitors a specified YouTube channel for new video uploads and sends a notification to a Discord or Slack channel.

## How to Use
1.  **Import the Workflow:** Copy the content of `youtube_to_discord_slack.json` and import it into your n8n instance.
2.  **Configure YouTube Trigger Node:**
    *   Enter the `Channel ID` of the YouTube channel you want to monitor.
3.  **Configure Discord/Slack Notification Node:**
    *   Provide the `Webhook URL` for your Discord or Slack channel.
    *   Customize the `Text` of the message, using expressions like `{{ $json.channelTitle }}`, `{{ $json.title }}`, and `{{ $json.link }}` to include video details.
4.  **Activate the Workflow:** Once configured, activate the workflow to start receiving notifications.

## Credentials Required
*   **Discord/Slack Webhook:** A webhook URL for your Discord or Slack channel.

## Nodes Used
*   **YouTube Trigger:** Triggers when a new video is uploaded to a specified YouTube channel.
*   **Webhook:** Sends a custom message to a Discord or Slack webhook URL.
