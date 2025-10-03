# Automated RSS Feed to Social Media Post

## Description
This n8n workflow monitors an RSS feed for new articles and automatically posts them to a specified social media platform. This can be used to keep your social media channels updated with fresh content from your blog or news sources.

## How to Use
1.  **Import the Workflow:** Copy the content of `rss_to_social_media.json` and import it into your n8n instance.
2.  **Configure RSS Feed Read Node:**
    *   Set the `URL` to the RSS feed you wish to monitor (e.g., `https://www.example.com/rss`).
3.  **Configure Social Media Post Node:**
    *   Select the social media platform you want to post to (e.g., Twitter, Facebook, LinkedIn).
    *   Configure the `Credentials` for the selected social media platform.
    *   Customize the `Message` to include relevant information from the RSS feed, such as `{{ $json.title }}` and `{{ $json.link }}`.
4.  **Activate the Workflow:** Once configured, activate the workflow to start monitoring the RSS feed.

## Credentials Required
*   **Social Media Account:** OAuth2 or API Key credentials for the social media platform (e.g., Twitter, Facebook, LinkedIn) where you intend to post.

## Nodes Used
*   **RSS Feed Read:** Reads new items from an RSS feed.
*   **Social Media Post:** Posts content to various social media platforms.
