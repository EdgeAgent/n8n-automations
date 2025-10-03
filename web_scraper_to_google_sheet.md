# Scheduled Web Scraper to Google Sheet

## Description
This n8n workflow periodically scrapes data from a specified website and appends it to a Google Sheet. This is useful for tracking changes on a website, collecting data for analysis, or monitoring product prices.

## How to Use
1.  **Import the Workflow:** Copy the content of `web_scraper_to_google_sheet.json` and import it into your n8n instance.
2.  **Configure Schedule Trigger Node:**
    *   Set the `Interval` in seconds for how often you want the scraper to run (e.g., `3600` for every hour).
3.  **Configure HTTP Request (Web Scraper) Node:**
    *   Set the `URL` of the website you want to scrape.
    *   Configure the `Response Format` and `JSON/XML Path` if you need to extract specific data points. You might need to use CSS selectors or XPath expressions.
4.  **Configure Google Sheet Append Node:**
    *   Set up your Google Sheets credentials (OAuth2 is recommended).
    *   Specify the `Spreadsheet ID` and `Sheet Name` where the data will be appended.
    *   Ensure `Values` is set to extract the data from the previous node, e.g., `={{ $json.data }}`.
5.  **Activate the Workflow:** Once configured, activate the workflow to start the scheduled web scraping.

## Credentials Required
*   **Google Sheets Account:** OAuth2 credentials for your Google Sheets account.

## Nodes Used
*   **Schedule Trigger:** Triggers the workflow at a set interval.
*   **HTTP Request:** Makes an HTTP request to a website to scrape data.
*   **Google Sheet Append:** Appends data to a Google Sheet.
