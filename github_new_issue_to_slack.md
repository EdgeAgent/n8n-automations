# GitHub New Issue to Slack Notification

## Description
This n8n workflow sends a Slack notification whenever a new issue is created in a specified GitHub repository. This helps teams stay informed about new tasks, bugs, or feature requests.

## How to Use
1.  **Import the Workflow:** Copy the content of `github_new_issue_to_slack.json` and import it into your n8n instance.
2.  **Configure GitHub Trigger (New Issue) Node:**
    *   Set up your GitHub credentials (OAuth2 is recommended).
    *   Specify the `Repository` (e.g., `owner/repo`) you want to monitor.
    *   n8n will provide a webhook URL that you need to configure in your GitHub repository settings under `Webhooks`.
3.  **Configure Slack Notification Node:**
    *   Provide the `Webhook URL` for your Slack channel.
    *   Customize the `Text` of the message, using expressions like `{{ $json.repository.full_name }}`, `{{ $json.issue.title }}`, and `{{ $json.issue.html_url }}` to include issue details.
4.  **Activate the Workflow:** Once configured, activate the workflow to start receiving Slack notifications for new GitHub issues.

## Credentials Required
*   **GitHub Account:** OAuth2 credentials for your GitHub account.
*   **Slack Webhook:** A webhook URL for your Slack channel.

## Nodes Used
*   **GitHub Trigger:** Triggers when a new issue is created in a GitHub repository.
*   **Slack:** Sends a custom message to a Slack channel.
