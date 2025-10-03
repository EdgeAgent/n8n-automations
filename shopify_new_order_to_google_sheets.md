# Shopify New Order to Google Sheets

## Description
This n8n workflow logs new Shopify orders into a Google Sheet for reporting, analysis, or further processing. This helps in centralizing order data for various business operations.

## How to Use
1.  **Import the Workflow:** Copy the content of `shopify_new_order_to_google_sheets.json` and import it into your n8n instance.
2.  **Configure Shopify Trigger (New Order) Node:**
    *   Set up your Shopify credentials (API Key or OAuth2).
    *   Enter your Shopify store URL (e.g., `your-shopify-store.myshopify.com`).
    *   n8n will provide a webhook URL that you need to configure in your Shopify admin panel under `Settings > Notifications > Webhooks`.
3.  **Configure Google Sheet Append Node:**
    *   Set up your Google Sheets credentials (OAuth2 is recommended).
    *   Specify the `Spreadsheet ID` and `Sheet Name` (e.g., `Orders`) where the order data will be appended.
    *   Ensure `Values` is set to extract the relevant Shopify order data, e.g., `=[["{{ $json.order_number }}", "{{ $json.customer.first_name }} {{ $json.customer.last_name }}", "{{ $json.total_price }}", "{{ $json.created_at }}"]]`.
4.  **Activate the Workflow:** Once configured, activate the workflow to start logging new Shopify orders.

## Credentials Required
*   **Shopify Account:** API Key or OAuth2 credentials for your Shopify store.
*   **Google Sheets Account:** OAuth2 credentials for your Google Sheets account.

## Nodes Used
*   **Shopify Trigger:** Triggers when a new order is created in Shopify.
*   **Google Sheet Append:** Appends order data to a Google Sheet.
