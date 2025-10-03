# Ecommerce Order Processing

This n8n workflow automates the process of...

## Nodes

The workflow consists of the following nodes:

- **New Order Trigger**: n8n-nodes-base.httpRequest
- **Extract Order Data**: n8n-nodes-base.set
- **Update Inventory**: n8n-nodes-base.httpRequest
- **Send Shipping Notification**: n8n-nodes-base.emailSend

## Setup

To use this workflow, you need to configure the credentials for the following nodes:

## How to Use

1. Import the workflow into your n8n instance.
2. Configure the credentials for the nodes.
3. Activate the workflow.
