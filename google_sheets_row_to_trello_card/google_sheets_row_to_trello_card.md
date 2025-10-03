# Google Sheets Row to Trello Card

## Description
This n8n workflow creates a new Trello card whenever a new row is added to a specified Google Sheet. This is useful for project management, task tracking, or converting data entries into actionable items.

## How to Use
1.  **Import the Workflow:** Copy the content of `google_sheets_row_to_trello_card.json` and import it into your n8n instance.
2.  **Configure Google Sheets Trigger (New Row) Node:**
    *   Set up your Google Sheets credentials (OAuth2 is recommended).
    *   Specify the `Spreadsheet ID` and `Sheet Name` you want to monitor for new rows.
3.  **Configure Create Trello Card Node:**
    *   Set up your Trello credentials (OAuth2 is recommended).
    *   Specify the `Board ID` and `List ID` where the new cards should be created.
    *   Customize the `Name` and `Description` of the Trello card using data from the Google Sheet, e.g., `New Task: {{ $json.columnA }}` and `Details: {{ $json.columnB }}`.
4.  **Activate the Workflow:** Once configured, activate the workflow to start creating Trello cards from new Google Sheet rows.

## Credentials Required
*   **Google Sheets Account:** OAuth2 credentials for your Google Sheets account.
*   **Trello Account:** OAuth2 credentials for your Trello account.

## Nodes Used
*   **Google Sheets Trigger:** Triggers when a new row is added to a Google Sheet.
*   **Trello:** Creates a new card in a specified Trello board and list.
