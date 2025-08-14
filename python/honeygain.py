import requests
from requests.structures import CaseInsensitiveDict
import os
from datetime import datetime, timezone
from dotenv import load_dotenv, find_dotenv
import time

load_dotenv(find_dotenv())

url = "https://dashboard.honeygain.com/api/v1/contest_winnings"
earnings_url = "https://dashboard.honeygain.com/api/v1/earnings/jt"

DISCORD_WEBHOOK_URL = os.environ.get("DISCORD_WEBHOOK_URL", "")
PING_MESSAGE = os.environ.get("PING_MESSAGE", "")  # e.g., "@everyone" or "<@123456789012345678>"

headers = CaseInsensitiveDict()
headers["Authorization"] = "Bearer {}".format(os.environ.get("HONEYGAIN_TOKEN"))

resp = requests.post(url, headers=headers)

if resp.status_code == 200:
    credits = str(resp.json()["data"]["credits"])
    message = "Successfully earned " + credits + " credits from the honeygain daily reward!"
    webhook_url = DISCORD_WEBHOOK_URL
    if webhook_url:
        # Wait for credits to update before fetching totals
        time.sleep(5)
        totals_data = None
        try:
            totals_resp = requests.get(earnings_url, headers=headers)
            if totals_resp.status_code == 200:
                totals_data = totals_resp.json().get("data", {})
        except Exception:
            totals_data = None

        total_credits = None
        bonus_credits = None
        total_usd_cents = None
        bonus_usd_cents = None
        total_usd = None
        bonus_usd = None

        if totals_data:
            total_credits = totals_data.get("total_credits")
            bonus_credits = totals_data.get("bonus_credits")
            total_usd_cents = totals_data.get("total_usd_cents")
            bonus_usd_cents = totals_data.get("bonus_usd_cents")
            try:
                total_usd = (float(total_usd_cents) / 100.0) if total_usd_cents is not None else None
                bonus_usd = (float(bonus_usd_cents) / 100.0) if bonus_usd_cents is not None else None
            except Exception:
                total_usd = None
                bonus_usd = None

        embed = {
            "title": "Honeygain Daily Reward Claimed",
            "description": message,
            "url": "https://dashboard.honeygain.com/",
            "color": 16766720,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "fields": [
                {"name": "Credits", "value": credits, "inline": True},
                {"name": "UTC Time", "value": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"), "inline": True},
                {"name": "Endpoint", "value": url, "inline": False},
                {"name": "Status", "value": str(resp.status_code), "inline": True}
            ],
            "footer": {"text": "Honeygain Auto Claim"}
        }
        if totals_data:
            embed["fields"].extend([
                {"name": "Total Credits", "value": str(total_credits), "inline": True},
                {"name": "Bonus Credits", "value": str(bonus_credits), "inline": True},
                {"name": "Total USD", "value": ("$" + format(total_usd, ".2f")) if total_usd is not None else "-", "inline": True},
                {"name": "Bonus USD", "value": ("$" + format(bonus_usd, ".2f")) if bonus_usd is not None else "-", "inline": True}
            ])
        requests.post(webhook_url, json={"embeds": [embed]})
        if PING_MESSAGE:
            requests.post(webhook_url, json={"content": PING_MESSAGE})
    else:
        print(message)
else:
    error_message = "Daily reward failed with status " + str(resp.status_code)
    webhook_url = DISCORD_WEBHOOK_URL
    if webhook_url:
        # Try to fetch current totals (no wait needed on failure)
        totals_data = None
        try:
            totals_resp = requests.get(earnings_url, headers=headers)
            if totals_resp.status_code == 200:
                totals_data = totals_resp.json().get("data", {})
        except Exception:
            totals_data = None

        embed = {
            "title": "Honeygain Daily Reward Failed",
            "description": error_message,
            "color": 16007990,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "fields": [
                {"name": "Endpoint", "value": url, "inline": False},
                {"name": "Status", "value": str(resp.status_code), "inline": True},
                {"name": "Response", "value": (resp.text[:1000] if resp.text else "(empty)"), "inline": False}
            ],
            "footer": {"text": "Honeygain Auto Claim"}
        }
        if totals_data:
            total_credits = totals_data.get("total_credits")
            bonus_credits = totals_data.get("bonus_credits")
            total_usd_cents = totals_data.get("total_usd_cents")
            bonus_usd_cents = totals_data.get("bonus_usd_cents")
            total_usd = None
            bonus_usd = None
            try:
                total_usd = (float(total_usd_cents) / 100.0) if total_usd_cents is not None else None
                bonus_usd = (float(bonus_usd_cents) / 100.0) if bonus_usd_cents is not None else None
            except Exception:
                total_usd = None
                bonus_usd = None
            embed["fields"].extend([
                {"name": "Total Credits", "value": str(total_credits), "inline": True},
                {"name": "Bonus Credits", "value": str(bonus_credits), "inline": True},
                {"name": "Total USD", "value": ("$" + format(total_usd, ".2f")) if total_usd is not None else "-", "inline": True},
                {"name": "Bonus USD", "value": ("$" + format(bonus_usd, ".2f")) if bonus_usd is not None else "-", "inline": True}
            ])
        requests.post(webhook_url, json={"embeds": [embed]})
        if PING_MESSAGE:
            requests.post(webhook_url, json={"content": PING_MESSAGE})
    else:
        print(error_message)