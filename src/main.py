import os
import time
import sqlite3
from datatime import datetime
from textwrap import shorten

import feedparser
import requests
from dotenv import load_dotenv
import schedule

load_dotenv()  

bot_token = os.getenv('8421819338:AAFCqmpfRl6gXmSNSe-pVj4GCD8Krq4-qjQ',"bot_token not found")  
chat_id = os.getenv('5472169919',"chat_id not found")

dp_path = os.path.join("data", "seen.sqlite3")
limit_per_source = 5
send_chunk_size = 3500
run_daily_at = "09:00"

feed = [
    ("Laravel News", "https://laravel-news.com/feed"),
    ("PHP Weekly", "https://www.phpweekly.com/rss/"),
    ("JavaScript Weekly", "https://javascriptweekly.com/rss/"),
    ("WebOps Weekly", "https://webopsweekly.com/rss/"),
    ("Frontend Focus", "https://frontendfoc.us/feed"),
    ("Node Weekly", "https://nodeweekly.com/rss/"),
    ("Go Weekly", "https://www.goweekly.com/rss/"),
    ("Python Weekly", "https://www.pythonweekly.com/rss/"),
]

def ensure_db():
    con = sqlite3.connect(dp_path)
    try:
        con.execute("""
        CREATE TABLE IF NOT EXISTS seen (
            id TEXT PRIMARY KEY,
            source TEXT,
            saved_at INTEGER
        )
        """)
        con.commit()
    finally:
        con.close()