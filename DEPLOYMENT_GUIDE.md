# Enterprise Deployment Guide: n8n Automation Workflows & Mega-Vault

![EDGE | AGENCY Vault Cover](assets/vault-cover.png)

> "A robust deployment manual for setting up, configuring, and scaling production-grade n8n automation workflows, API integrations, and the 10,000-item Mega-Vault."
> — **EDGE | AGENCY** [1]

---

## 1. Executive Summary & Architecture Overview

The **n8n-automations** repository combines enterprise-grade orchestration workflows with **The 10,000-Item Mega-Vault**. Successfully deploying these workflows requires an understanding of n8n instance configuration, secure credential management, webhook routing, and idempotent data handling [2].

This document provides a comprehensive end-to-end guide for deploying the repository's core automation pipelines into a production n8n environment.

| Workflow Module | Primary Trigger | Target Destination | Error Handling Protocol |
| :--- | :--- | :--- | :--- |
| **AI Lead Qualification** | Webhook / Form Submissions | CRM / Slack Notification | Automatic retry with fallback email |
| **Property Analysis** | Schedule / API Poll | Database / Google Sheets | Logging error to monitoring webhook |
| **Support Ticket Triage** | Zendesk / Email Webhook | Notion / Jira / Slack | DLQ (Dead Letter Queue) routing |
| **E-commerce Order Processing** | Shopify Webhook | ERP / Inventory DB | Idempotent transaction verification |

---

## 2. Infrastructure Prerequisites

Before importing workflow JSON files, ensure your n8n instance and supporting infrastructure meet the following baseline requirements:

1. **n8n Instance**: Version 1.0.0 or higher (self-hosted via Docker or n8n Cloud).
2. **Database Backend**: PostgreSQL or MySQL configured for production state persistence (avoid SQLite for high-volume agency workloads).
3. **Node.js Environment**: Node.js 18+ for executing custom code nodes and helper scripts.
4. **Environment Variables**: Configure the following environment variables in your n8n deployment (`.env` or Docker configuration):
   - `N8N_ENCRYPTION_KEY`: A secure 32-byte string for credential encryption.
   - `WEBHOOK_URL`: Your public domain URL (e.g., `https://automation.yourdomain.com/`).
   - `EXECUTIONS_DATA_PRUNE`: Set to `true` with appropriate retention windows (e.g., 30 days) to prevent disk bloat.

---

## 3. Step-by-Step Workflow Import & Configuration

### Step 1: Clone and Inspect Repository
Clone the repository locally or pull the latest updates from GitHub to access all workflow JSON files and documentation:

```bash
git clone https://github.com/EdgeAgent/n8n-automations.git
cd n8n-automations
```

### Step 2: Import Workflow JSON Files into n8n
1. Log in to your n8n admin dashboard.
2. Navigate to **Workflows** -> **Add workflow** -> **Import from File**.
3. Select the desired `.json` workflow file from the repository (e.g., `ai_powered_lead_qualification/ai_powered_lead_qualification.json`).
4. Review the node connections to ensure all trigger endpoints and HTTP requests match your local architecture.

### Step 3: Configure Required Credentials
Each workflow relies on specific external services. Create and attach the following credentials in your n8n settings:

| Credential Type | Required For | Configuration Details |
| :--- | :--- | :--- |
| **OpenAI / Anthropic API** | AI-driven lead qualification & analysis | Provide your secure API key for LLM execution. |
| **Webhook / HTTP Header** | Incoming webhooks and CRM hooks | Configure Bearer tokens or API keys for authentication. |
| **Google Sheets / Airtable** | Data persistence and logging | Authenticate via OAuth2 service account. |
| **Slack / Discord Bot** | Real-time notifications and alerts | Provide bot user OAuth token and default channel ID. |

---

## 4. Detailed Workflow Directory Reference

The repository is organized into specialized directories, each containing an importable JSON workflow and a human-readable guide:

- `ai_powered_lead_qualification/`: Evaluates incoming web leads using LLM scoring rubrics and dispatches high-intent leads to Slack and CRM.
- `automated_property_analysis/`: Scrapes real estate data points, runs valuation algorithms, and persists verified deals.
- `customer_support_ticket_automation/`: Triages incoming support tickets, categorizes sentiment, and drafts automated agent replies.
- `ecommerce_order_processing/`: Listens for new Shopify/Stripe orders, updates inventory levels, and triggers fulfillment sequences.
- `real_estate_investor_engine/`: Automated data ingestion pipeline for off-market property acquisition.

---

## 5. Security & Maintenance Best Practices

1. **Credential Isolation**: Never hardcode API keys or secrets inside workflow JSON files or code nodes. Always use n8n's internal Credentials Manager or environment variables.
2. **Idempotency**: Ensure webhooks and external API calls are idempotent to prevent duplicate record creation during network retries.
3. **Execution Logging**: Monitor error executions weekly via the n8n execution history dashboard. Set up a webhook error trigger to route failed executions directly to an operator Telegram or Slack channel.

---

## References

[1] EDGE | AGENCY. *Enterprise Automation & n8n Architecture Guide*. 2026.  
[2] n8n Documentation. *Workflow Import, Environment Configuration, and Security Best Practices*. 2025.

---
*Powered by EDGE | AGENCY & Manus AI*
