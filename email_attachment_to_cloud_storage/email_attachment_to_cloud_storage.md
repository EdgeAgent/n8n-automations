# Email Attachment to Cloud Storage

## Description
This n8n workflow monitors an email inbox for new emails with attachments, downloads them, and uploads them to a specified cloud storage service (e.g., Google Drive).

## How to Use
1.  **Import the Workflow:** Copy the content of `email_attachment_to_cloud_storage.json` and import it into your n8n instance.
2.  **Configure IMAP Email Read Node:**
    *   Set up your IMAP credentials (OAuth2 is recommended).
    *   Specify the `Folder` to monitor (e.g., `INBOX`).
    *   Optionally, enable `Mark As Read` to avoid reprocessing emails.
3.  **Configure Download Attachment Node:**
    *   This node typically requires no configuration if the previous node correctly passes the attachment URL.
4.  **Configure Google Drive Upload Node:**
    *   Set up your Google Drive credentials (OAuth2 is recommended).
    *   Specify the `Folder ID` where you want to upload the attachments.
    *   Ensure `File Key` is set to `={{ $json.attachments[0].filename }}` to use the original filename.
    *   Ensure `Binary Data` is enabled.
5.  **Activate the Workflow:** Once configured, activate the workflow to start processing email attachments.

## Credentials Required
*   **IMAP Email Account:** OAuth2 or username/password credentials for your email account.
*   **Google Drive Account:** OAuth2 credentials for your Google Drive account.

## Nodes Used
*   **IMAP Email Read:** Monitors an IMAP email account for new emails.
*   **HTTP Request:** Downloads the email attachment.
*   **Google Drive Upload:** Uploads files to Google Drive.
