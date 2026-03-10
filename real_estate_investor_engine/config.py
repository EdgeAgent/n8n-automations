import os

# Configuration for the Real Estate Investor Engine
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY")
N8N_BASE_URL = os.environ.get("N8N_BASE_URL", "http://localhost:5678")
N8N_API_KEY = os.environ.get("N8N_API_KEY")

# Data Table Configuration (e.g., Google Sheets or Airtable)
DATA_TABLE_ID = os.environ.get("DATA_TABLE_ID")

# Agent Models (can be overridden via OpenRouter)
DEFAULT_MODEL = "openai/gpt-4"
ANALYSIS_MODEL = "anthropic/claude-3-opus"
OUTREACH_MODEL = "google/gemini-pro"
