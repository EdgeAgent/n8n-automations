import requests
from config import N8N_BASE_URL, N8N_API_KEY

# Tools for the Real Estate Investor Engine, integrating with n8n workflows

def trigger_n8n_workflow(workflow_id, data):
    """Triggers an n8n workflow via its webhook URL."""
    webhook_url = f"{N8N_BASE_URL}/webhook/{workflow_id}"
    headers = {"Authorization": f"Bearer {N8N_API_KEY}"} if N8N_API_KEY else {}
    
    try:
        response = requests.post(webhook_url, json=data, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error triggering n8n workflow {workflow_id}: {e}")
        return None

def lead_qualification_tool(property_data):
    """Tool for qualifying a real estate lead using the n8n workflow."""
    return trigger_n8n_workflow("ai_powered_lead_qualification", property_data)

def property_analysis_tool(property_data):
    """Tool for analyzing a property and generating a deal score using the n8n workflow."""
    return trigger_n8n_workflow("automated_property_analysis", property_data)

def surplus_funds_recovery_tool(claim_data):
    """Tool for managing surplus funds recovery using the enhanced n8n workflow."""
    return trigger_n8n_workflow("surplus_funds_recovery_enhanced", claim_data)
