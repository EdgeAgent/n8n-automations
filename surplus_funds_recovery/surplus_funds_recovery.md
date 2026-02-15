# Surplus Funds Recovery Automation

This workflow automates the identification, verification, and outreach for surplus funds recovery.

## Features
- **Step 1: Find Leads**: Uses Perplexity to search for public surplus funds lists.
- **Step 2: Confirm Claim**: Uses Perplexity to verify ownership and DeepSeek to analyze records.
- **Step 3: Marketing**: Generates personalized SMS and Email content via OpenRouter (DeepSeek).
- **Step 4: Closing**: Creates a detailed recovery report and explains the fee structure.

## Setup
1. **OpenRouter**: Obtain an API key and configure the `OpenRouter Chat Model` node.
2. **Perplexity**: Obtain an API key and configure the `Perplexity` node.
3. **Outreach**: Configure Twilio for SMS and Gmail for email notifications.
4. **Schedule**: The workflow is set to run daily by default.
