# Scheduled Database Backup to Cloud Storage

## Description
This n8n workflow periodically backs up a database (e.g., PostgreSQL, MySQL) and uploads the backup file to a specified cloud storage service (e.g., AWS S3, Google Drive).

## How to Use
1.  **Import the Workflow:** Copy the content of `db_backup_to_cloud_storage.json` and import it into your n8n instance.
2.  **Configure Schedule Trigger (Daily) Node:**
    *   The `Interval` is set to `86400` seconds for daily execution. Adjust this as needed for your backup frequency.
3.  **Configure Execute Command (DB Backup) Node:**
    *   **Important:** This node executes shell commands on the machine running n8n. Ensure you have the necessary database client tools installed (e.g., `pg_dump` for PostgreSQL, `mysqldump` for MySQL).
    *   Modify the `Command` to suit your database type and credentials. For example:
        *   **PostgreSQL:** `pg_dump -Fc -h your_db_host -U your_db_user your_db_name > /tmp/your_db_name.bak`
        *   **MySQL:** `mysqldump -h your_db_host -u your_db_user -p'your_db_password' your_db_name > /tmp/your_db_name.sql`
    *   Ensure the output path (`/tmp/your_db_name.bak` or `.sql`) is accessible by n8n.
4.  **Configure S3 Upload Node (or other Cloud Storage Node):**
    *   Set up your AWS S3 credentials (or Google Drive, Dropbox, etc., depending on your chosen cloud storage).
    *   Specify the `Bucket Name` and a `File Name` for the backup (e.g., `mydb-backup-{{ $now }}.bak`).
    *   Ensure `Binary Data` is enabled to upload the backup file correctly.
5.  **Activate the Workflow:** Once configured, activate the workflow to start scheduled database backups.

## Credentials Required
*   **Database Access:** Credentials for your database (username, password, host).
*   **Cloud Storage Account:** API keys or OAuth2 credentials for your chosen cloud storage service (e.g., AWS S3 access keys, Google Drive OAuth2).

## Nodes Used
*   **Schedule Trigger:** Triggers the workflow at a set interval.
*   **Execute Command:** Runs a shell command to perform the database backup.
*   **AWS S3 (or equivalent):** Uploads the backup file to cloud storage.
