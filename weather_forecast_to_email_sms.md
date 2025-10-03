# Weather Forecast to Email/SMS

## Description
This n8n workflow sends a daily weather forecast to a specified email address or SMS number. This can be customized for a specific location and delivered at a chosen time.

## How to Use
1.  **Import the Workflow:** Copy the content of `weather_forecast_to_email_sms.json` and import it into your n8n instance.
2.  **Configure Schedule Trigger (Daily) Node:**
    *   The `Interval` is set to `86400` seconds for daily execution. You can adjust this as needed.
3.  **Configure HTTP Request (Weather API) Node:**
    *   Replace `https://api.openweathermap.org/data/2.5/weather?q=London&appid=YOUR_API_KEY` with your desired location and your OpenWeatherMap API key.
    *   You can sign up for a free API key at [OpenWeatherMap](https://openweathermap.org/api).
4.  **Configure Send Email Node:**
    *   Set `From Email` and `To Email` addresses.
    *   Configure your email credentials (SMTP or OAuth2).
    *   Customize the `Subject` and `Text` of the email using expressions like `{{ $json.name }}`, `{{ $json.weather[0].description }}`, and `{{ $json.main.temp }}`.
    *   To send an SMS, you would typically replace this node with an SMS service node (e.g., Twilio) and configure it accordingly.
5.  **Activate the Workflow:** Once configured, activate the workflow to start receiving daily weather forecasts.

## Credentials Required
*   **OpenWeatherMap API Key:** An API key from OpenWeatherMap to access weather data.
*   **Email Account:** SMTP or OAuth2 credentials for sending emails.
*   **(Optional) SMS Service:** Credentials for an SMS service like Twilio if you choose to send SMS notifications.

## Nodes Used
*   **Schedule Trigger:** Triggers the workflow at a set interval.
*   **HTTP Request:** Fetches weather data from the OpenWeatherMap API.
*   **Send Email:** Sends the weather forecast via email.
