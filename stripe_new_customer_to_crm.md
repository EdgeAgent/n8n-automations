# Stripe New Customer to CRM

## Description
This n8n workflow automatically adds new Stripe customers as contacts in a CRM system (e.g., HubSpot, Salesforce). This helps keep your CRM updated with new customer information for sales and marketing efforts.

## How to Use
1.  **Import the Workflow:** Copy the content of `stripe_new_customer_to_crm.json` and import it into your n8n instance.
2.  **Configure Stripe Trigger (New Customer) Node:**
    *   Set up your Stripe credentials (API Key or OAuth2).
    *   n8n will provide a webhook URL that you need to configure in your Stripe dashboard under `Developers > Webhooks`.
3.  **Configure HubSpot Create Contact Node (or other CRM Node):**
    *   Set up your HubSpot credentials (OAuth2 is recommended).
    *   Configure the `Operation` to `create` and `Entity` to `contact`.
    *   Map the relevant Stripe customer data to your CRM contact properties, e.g., `email` to `{{ $json.email }}` and `firstname` to `{{ $json.name }}`.
4.  **Activate the Workflow:** Once configured, activate the workflow to start syncing new Stripe customers to your CRM.

## Credentials Required
*   **Stripe Account:** API Key or OAuth2 credentials for your Stripe account.
*   **CRM Account:** API Key or OAuth2 credentials for your chosen CRM (e.g., HubSpot, Salesforce).

## Nodes Used
*   **Stripe Trigger:** Triggers when a new customer is created in Stripe.
*   **HubSpot (or equivalent CRM node):** Creates a new contact in the CRM system.
