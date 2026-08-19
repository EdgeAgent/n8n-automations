import os

niches = [
    "real-estate", "roofing", "hvac", "plumbing", "electricians", "tattoo-shops", "barbers", "nail-techs", 
    "salons", "restaurants", "cafes", "food-trucks", "gyms", "personal-trainers", "nutritionists", 
    "therapists", "life-coaches", "consultants", "freelancers", "saas-founders", "agencies", 
    "e-commerce", "dropshipping", "influencers", "youtubers", "podcasters", "streamers", 
    "photographers", "videographers", "artists", " дизайнеры (designers)", "developers", "construction", 
    "landscapers", "pest-control", "solar-installers", "auto-detailers", "mechanics", "car-dealerships", 
    "wedding-planners", "event-planners", "daycare", "cleaning-companies", "retail-stores", 
    "clothing-brands", "jewelry-brands", "candle-makers", "print-on-demand", "nonprofits", "churches", 
    "accountants", "bookkeepers", "lawyers", "dentists", "chiropractors", "medical-clinics", 
    "tutors", "teachers", "architecture", "interior-design", "security-services", "pet-grooming", 
    "veterinarians", "bakery", "brewery", "fitness-studios", "pest-management"
]

base_dir = "/home/ubuntu/n8n-automations/vault"

print(f"Generating full content for {len(niches)} niches across Vault categories...")

# 1. Category 1: Prompt Libraries
cat1_dir = os.path.join(base_dir, "01-prompt-libraries")
os.makedirs(cat1_dir, exist_ok=True)

for niche in niches:
    niche_dir = os.path.join(cat1_dir, niche)
    os.makedirs(niche_dir, exist_ok=True)
    content = f"""# Prompt Library: {niche.replace('-', ' ').title()}

> Curated professional prompt pack optimized for Claude, ChatGPT, and automated workflows.
> — **EDGE | AGENCY** [1]

## Overview
This prompt pack provides high-conversion, industry-specific prompts across workflow optimization, marketing, sales, operations, finance, and growth for **{niche.replace('-', ' ').title()}**.

## 1. Workflow & Operations Prompts
- **Prompt 1.1 (Daily Operations & Task Prioritization)**: "Act as an expert operations manager for a {niche.replace('-', ' ').title()} business. Analyze our daily workflow, identify bottlenecks in client intake and service delivery, and provide a 5-step optimization plan."
- **Prompt 1.2 (SOP Generation)**: "Draft a comprehensive Standard Operating Procedure (SOP) for quality assurance in {niche.replace('-', ' ').title()}, including step-by-step checklists, compliance standards, and escalation protocols."
- **Prompt 1.3 (Resource Allocation)**: "Create a resource allocation and scheduling matrix for a team of 10 in the {niche.replace('-', ' ').title()} sector, optimizing for peak hours and minimizing overhead."

## 2. Marketing & Acquisition Prompts
- **Prompt 2.1 (Local SEO & Content Strategy)**: "Develop a 30-day hyper-local content and SEO strategy for a {niche.replace('-', ' ').title()} provider targeting high-intent local search queries."
- **Prompt 2.2 (Social Media Hook Generator)**: "Generate 15 high-engaging video hooks and caption templates for TikTok and Instagram Reels tailored to {niche.replace('-', ' ').title()}."
- **Prompt 2.3 (Ad Copywriting Sequence)**: "Write a high-converting 3-part Facebook ad copy sequence (Hook, Problem-Agitation-Solution, CTA) for acquiring new clients in {niche.replace('-', ' ').title()}."

## 3. Sales & Conversion Prompts
- **Prompt 3.1 (Objection Handling Script)**: "Act as an enterprise sales coach. Write a master objection handling script for the top 5 most common pushbacks when selling {niche.replace('-', ' ').title()} services."
- **Prompt 3.2 (Email Follow-Up Sequence)**: "Draft a 4-step automated email follow-up sequence for warm leads who inquired about {niche.replace('-', ' ').title()} but haven't booked."
- **Prompt 3.3 (Proposal Template Generator)**: "Generate a persuasive project proposal outline for a {niche.replace('-', ' ').title()} client, highlighting ROI, timeline, and deliverables."

## 4. Finance & Growth Prompts
- **Prompt 4.1 (Pricing Model Optimization)**: "Analyze value-based vs. tier-based pricing models for a {niche.replace('-', ' ').title()} business and recommend profit-maximizing price points."
- **Prompt 4.2 (Quarterly Financial Forecasting)**: "Create a quarterly financial projection template and cash flow analysis framework for scaling a {niche.replace('-', ' ').title()} enterprise."

---
## References
[1] EDGE | AGENCY. *Professional Prompt Libraries Master Index*. 2026.
"""
    with open(os.path.join(niche_dir, "README.md"), "w") as f:
        f.write(content)

# 2. Category 3: Niche Startup Checklists
cat3_dir = os.path.join(base_dir, "03-niche-startup-checklists")
os.makedirs(cat3_dir, exist_ok=True)

for niche in niches:
    niche_dir = os.path.join(cat3_dir, niche)
    os.makedirs(niche_dir, exist_ok=True)
    content = f"""# Startup Checklist: {niche.replace('-', ' ').title()}

> Comprehensive 15-point launch checklist and execution framework.
> — **EDGE | AGENCY** [1]

## Launch Execution Matrix for {niche.replace('-', ' ').title()}

| Phase | Checklist Item | Description & Actionable Standard | Status |
| :--- | :--- | :--- | :--- |
| **01** | **Licensing & Compliance** | Secure federal, state, and local business licenses specific to {niche.replace('-', ' ').title()}. | ⬜ Pending |
| **02** | **Equipment & Tooling** | Procure baseline hardware, software, and tools required for service delivery. | ⬜ Pending |
| **03** | **Brand Identity** | Establish professional logo, color palette (electric blue accents), and brand positioning. | ⬜ Pending |
| **04** | **CRM Setup** | Implement centralized CRM (HubSpot/GoHighLevel) for pipeline and lead tracking. | ⬜ Pending |
| **05** | **Local SEO & GMB** | Optimize Google My Business profile and local citation directories. | ⬜ Pending |
| **06** | **Sales Funnel** | Build landing page with clear value proposition and instant booking widget. | ⬜ Pending |
| **07** | **Operations SOP** | Document client intake, fulfillment, and review generation workflows. | ⬜ Pending |
| **08** | **Financial Setup** | Establish business banking, bookkeeping (QuickBooks), and tax withholding structure. | ⬜ Pending |
| **09** | **Automation Setup** | Deploy n8n workflows for lead capture, SMS notification, and invoice generation. | ⬜ Pending |
| **10** | **KPI Dashboard** | Set up real-time dashboard tracking CAC, LTV, conversion rate, and monthly revenue. | ⬜ Pending |
| **11** | **Hiring & Training** | Draft employment agreements, onboarding handbooks, and training videos. | ⬜ Pending |
| **12** | **Insurance Coverage** | Secure general liability, professional indemnity, and workers' comp insurance. | ⬜ Pending |
| **13** | **Vendor Contracts** | Finalize supplier and SaaS vendor service-level agreements (SLAs). | ⬜ Pending |
| **14** | **Launch Campaign** | Execute multi-channel launch campaign (email broadcast, social blitz, local outreach). | ⬜ Pending |
| **15** | **Post-Launch Review** | Conduct 30-day operational review and customer feedback synthesis. | ⬜ Pending |

---
## References
[1] EDGE | AGENCY. *Niche Startup Execution Frameworks*. 2026.
"""
    with open(os.path.join(niche_dir, "README.md"), "w") as f:
        f.write(content)

print("Successfully generated full prompt libraries and startup checklists for all 67 niches.")
