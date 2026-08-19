# Local Testing & Execution Guide with Docker

![EDGE | AGENCY Vault Cover](assets/vault-cover.png)

> "A practical guide to spinning up a local n8n environment using Docker Compose, importing automation workflows, and executing test runs."
> — **EDGE | AGENCY** [1]

---

## 1. Overview

This repository includes a pre-configured `docker-compose.yml` file designed to launch a local n8n automation server. By mounting workflow directories directly into the container, operators can instantly test, debug, and validate workflows without manual file transfers [2].

---

## 2. Prerequisites

Ensure you have the following installed on your local machine:
1. **Docker Engine**: Version 20.10 or higher.
2. **Docker Compose**: Version 2.0 or higher.
3. **Git**: To clone or update the repository.

---

## 3. Quick Start: Spinning Up n8n Locally

### Step 1: Clone the Repository
If you haven't already cloned the repository, open your terminal and run:

```bash
git clone https://github.com/EdgeAgent/n8n-automations.git
cd n8n-automations
```

### Step 2: Launch Docker Compose
Start the n8n container in detached mode using Docker Compose:

```bash
docker-compose up -d
```

### Step 3: Access the n8n Dashboard
Open your web browser and navigate to:
```text
http://localhost:5678
```
On your first visit, n8n will prompt you to create an admin account (Email and Password).

---

## 4. Importing and Testing Workflows

1. Inside the n8n dashboard, click **Workflows** -> **Add workflow** -> **Import from File**.
2. Navigate to the desired workflow directory inside your cloned repository (e.g., `ai_powered_lead_qualification/ai_powered_lead_qualification.json`).
3. Select the `.json` file and click **Open**.
4. **Simulate Execution**: Click the **Execute Workflow** button in the bottom left of the n8n canvas to run a test payload locally.
5. Inspect node outputs to verify data transformation, API responses, and conditional routing.

---

## 5. Stopping and Cleaning Up

To stop the local n8n container while preserving your workflow data in Docker volumes, run:

```bash
docker-compose stop
```

To completely stop and remove the container along with its volumes (caution: deletes local uncommitted workflows):

```bash
docker-compose down -v
```

---

## References

[1] EDGE | AGENCY. *Local Testing & Docker Orchestration Guide*. 2026.  
[2] n8n Documentation. *Docker Installation and Local Development*. 2025.

---
*Powered by EDGE | AGENCY & Manus AI*
