# Enhanced Surplus Funds Recovery Automation

This workflow automates the identification, verification, and outreach for surplus funds recovery, with enhanced AI capabilities.

## Features
- **Step 1: Find Leads**: Uses Perplexity to search for public surplus funds lists.
- **Step 2: Confirm Claim**: Uses Perplexity to verify ownership and DeepSeek to analyze records, with advanced NLP for legal document analysis.
- **Step 3: Marketing**: Generates personalized SMS and Email content via OpenRouter (DeepSeek), with dynamic content generation based on claimant profiles.
- **Step 4: Closing**: Creates a detailed recovery report and explains the fee structure, and tracks claim status through legal stages.

## Setup
1.  **OpenRouter**: Obtain an API key and configure the `OpenRouter Chat Model` node.
2.  **Perplexity**: Obtain an API key and configure the `Perplexity` node.
3.  **DeepSeek/GPT-4**: Integrate with advanced LLMs for legal document analysis and dynamic content generation.
4.  **Outreach**: Configure Twilio for SMS and Gmail for email notifications, potentially including Twilio Voice API for multi-channel communication.
5.  **Schedule**: The workflow is set to run daily by default.
