# Automated Social Media Posting

This n8n workflow automates the process of...

## Nodes

The workflow consists of the following nodes:

- **RSS Feed Reader**: n8n-nodes-base.rssFeedRead
- **AI Post Generator**: n8n-nodes-base.httpRequest
- **Format Post Content**: n8n-nodes-base.set
- **Post to Twitter**: n8n-nodes-base.httpRequest
- **Post to Facebook**: n8n-nodes-base.httpRequest

## Setup

To use this workflow, you need to configure the credentials for the following nodes:

## How to Use

1. Import the workflow into your n8n instance.
2. Configure the credentials for the nodes.
3. Activate the workflow.
