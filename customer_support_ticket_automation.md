# Customer Support Ticket Automation

This n8n workflow automates the process of...

## Nodes

The workflow consists of the following nodes:

- **Email Trigger**: n8n-nodes-base.emailReceive
- **Extract Email Data**: n8n-nodes-base.set
- **Create Ticket**: n8n-nodes-base.httpRequest
- **Send Confirmation Email**: n8n-nodes-base.emailSend
- **Assign Ticket**: n8n-nodes-base.httpRequest

## Setup

To use this workflow, you need to configure the credentials for the following nodes:

## How to Use

1. Import the workflow into your n8n instance.
2. Configure the credentials for the nodes.
3. Activate the workflow.
