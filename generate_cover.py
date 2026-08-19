from PIL import Image, ImageDraw, ImageFont
import os

# Create an image for the vault cover banner
width = 1200
height = 630
image = Image.new("RGB", (width, height), color="#0f172a") # Dark slate background
draw = ImageDraw.Draw(image)

# Draw decorative background elements / gradient lines
for i in range(0, height, 40):
    draw.line([(0, i), (width, i)], fill="#1e293b", width=1)

# Draw central card
margin = 80
draw.rectangle(
    [(margin, margin), (width - margin, height - margin)],
    fill="#1e293b",
    outline="#3b82f6",
    width=2
)

# Text content
title_text = "EDGE | AGENCY"
subtitle_text = "THE 10,000-ITEM MEGA-VAULT"
desc_text = "Curated AI Prompts, Templates, Checklists & n8n Automation Blueprints"

try:
    # Try loading a standard font, fallback to default if not available
    font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
    font_sub = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 36)
    font_desc = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
except Exception:
    font_title = font_sub = font_desc = ImageFont.load_default()

# Draw text
draw.text((120, 140), title_text, fill="#60a5fa", font=font_title)
draw.text((120, 210), subtitle_text, fill="#f8fafc", font=font_sub)
draw.text((120, 290), desc_text, fill="#94a3b8", font=font_desc)

# Footer tag
draw.text((120, 470), "POWERED BY EDGE AGENT & MANUS AI", fill="#3b82f6", font=font_desc)

os.makedirs("/home/ubuntu/n8n-automations/assets", exist_ok=True)
image.save("/home/ubuntu/n8n-automations/assets/vault-cover.png")
print("Cover image generated successfully at /home/ubuntu/n8n-automations/assets/vault-cover.png")
