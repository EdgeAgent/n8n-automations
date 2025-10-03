# Twitter Mentions to Google Sheet

## Description
This n8n workflow monitors Twitter for mentions of a specific keyword or handle and logs them into a Google Sheet. This is useful for social media monitoring, brand tracking, or competitor analysis.

## How to Use
1.  **Import the Workflow:** Copy the content of `twitter_mentions_to_google_sheet.json` and import it into your n8n instance.
2.  **Configure Twitter Trigger (Mentions) Node:**
    *   Set up your Twitter credentials (OAuth1 or OAuth2).
    *   Specify the `Query` to search for (e.g., `@your_handle` or `your_brand_keyword`).
3.  **Configure Google Sheet Append Node:**
    *   Set up your Google Sheets credentials (OAuth2 is recommended).
    *   Specify the `Spreadsheet ID` and `Sheet Name` where the data will be appended.
    *   Ensure `Values` is set to extract the relevant Twitter data, e.g., `=[["{{ $json.user.screen_name }}", "{{ $json.text }}", "{{ $json.created_at }}"]]`.
4.  **Activate the Workflow:** Once configured, activate the workflow to start logging Twitter mentions.

## Credentials Required
*   **Twitter Account:** OAuth1 or OAuth2 credentials for your Twitter account.
*   **Google Sheets Account:** OAuth2 credentials for your Google Sheets account.

## Nodes Used
*   **Twitter Trigger:** Triggers when new mentions are found on Twitter.
*   **Google Sheet Append:** Appends data to a Google Sheet.
