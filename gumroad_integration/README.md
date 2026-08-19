# Gumroad Integration & Sales Sync Workflow

![EDGE | AGENCY Vault Cover](../assets/vault-cover.png)

> "Automate your Gumroad sales tracking, customer fulfillment, and real-time notifications with this enterprise-grade n8n workflow."
> — **EDGE | AGENCY** [1]

---

## 1. Overview

The **Gumroad Sales Sync** workflow is designed to listen for incoming sales notifications from Gumroad, retrieve detailed sale and customer data via the Gumroad API v2, and sync that information to Google Sheets and Slack [2].

---

## 2. Prerequisites

1. **Gumroad Account**: A professional or creator account on Gumroad.
2. **Gumroad API Access Token**: Generate this in your Gumroad settings under **Advanced** -> **Applications** -> **Create Application**.
3. **n8n Instance**: A running instance of n8n (local Docker or Cloud).
4. **Google Sheets & Slack**: Authenticated credentials in n8n.

---

## 3. Workflow Configuration

### Step 1: Set Up Webhook in Gumroad
1. Go to your Gumroad product settings or account-wide **Advanced** settings.
2. Add a new **Ping** (Webhook) URL pointing to your n8n Webhook node endpoint.
3. Ensure the resource type is set to `sale`.

### Step 2: Configure n8n Credentials
1. Create a new **Header Auth** credential in n8n.
2. Name it `Gumroad API Token`.
3. Set the Header Name to `Authorization` and the Value to `Bearer YOUR_ACCESS_TOKEN`.

### Step 3: Import and Map Data
1. Import the `gumroad_sales_sync.json` file.
2. Update the **Google Sheets** node with your target Spreadsheet ID and sheet name.
3. Customize the **Slack** notification message as needed.

---

## 4. API Reference Summary

| Endpoint | Method | Scope | Description |
| :--- | :--- | :--- | :--- |
| `/v2/products` | `GET` | `view_sales` | Retrieve all existing products. |
| `/v2/sales` | `GET` | `view_sales` | Retrieve all successful sales. |
| `/v2/subscribers` | `GET` | `view_sales` | Retrieve active product subscribers. |

---

## References

[1] EDGE | AGENCY. *Gumroad Integration & E-commerce Automation Guide*. 2026.  
[2] Gumroad. *Gumroad API Documentation*. https://gumroad.com/api. 2025.

---
*Powered by EDGE | AGENCY & Manus AI*
