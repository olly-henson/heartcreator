import requests
import os
from dotenv import dotenv_values

env = dotenv_values(r"C:\Users\Olly\AI OS\marketing\.env")
token = env["NOTION_API_TOKEN"]

DASHBOARD_PAGE_ID = "36e30e58-6a0d-81c8-8c70-dfa1fc988004"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
    "Notion-Version": "2022-06-28",
}

payload = {
    "parent": {"type": "page_id", "page_id": DASHBOARD_PAGE_ID},
    "title": [{"type": "text", "text": {"content": "Business Metrics"}}],
    "properties": {
        "Period": {"title": {}},
        "Date": {"date": {}},
        "YouTube Subscribers": {"number": {"format": "number"}},
        "Instagram Followers": {"number": {"format": "number"}},
        "Email Subscribers": {"number": {"format": "number"}},
        "Skool Members": {"number": {"format": "number"}},
        "Customers": {"number": {"format": "number"}},
        "Website Visits": {"number": {"format": "number"}},
        "Revenue ($)": {"number": {"format": "dollar"}},
        "Expenses ($)": {"number": {"format": "dollar"}},
        "Profit ($)": {"formula": {"expression": 'prop("Revenue ($)") - prop("Expenses ($)")'}},
    },
}

response = requests.post("https://api.notion.com/v1/databases", headers=headers, json=payload)

if response.status_code == 200:
    db = response.json()
    print(f"✅ Database created: {db['url']}")
    print(f"   ID: {db['id']}")
else:
    print(f"❌ Error {response.status_code}: {response.json()}")
