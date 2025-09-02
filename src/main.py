import os # For environment variables and file paths
import time # For sleep functionality
import sqlite3 # For SQLite database operations
from datatime import datetime # For handling date and time
from textwrap import shorten # For shortening text

import feedparser
import requests
from dotenv import load_dotenv
import schedule 

load_dotenv() # Load environment variables from .env file  

bot_token = os.getenv('8421819338:AAFCqmpfRl6gXmSNSe-pVj4GCD8Krq4-qjQ',"bot_token not found")  
chat_id = os.getenv('5472169919',"chat_id not found")

dp_path = os.path.join("data", "seen.sqlite3") # Path to SQLite database
limit_per_source = 5 # Limit the number of articles sent per source
send_chunk_size = 3500 # Telegram message limit is 3500 characters
run_daily_at = "09:00" # 24-hour format, e.g., "09:00" for 9 AM

feed = [ # List of RSS feeds to monitor 
    ("Laravel News", "https://laravel-news.com/feed"),
    ("PHP Weekly", "https://www.phpweekly.com/rss/"),
    ("JavaScript Weekly", "https://javascriptweekly.com/rss/"),
    ("WebOps Weekly", "https://webopsweekly.com/rss/"),
    ("Frontend Focus", "https://frontendfoc.us/feed"),
    ("Node Weekly", "https://nodeweekly.com/rss/"),
    ("Go Weekly", "https://www.goweekly.com/rss/"),
    ("Python Weekly", "https://www.pythonweekly.com/rss/"),
]

def ensure_db(): # Ensure the database and table exist 
    con = sqlite3.connect(dp_path) # Connect to SQLite database
    try: # Create table if it doesn't exist
        con.execute("""
        CREATE TABLE IF NOT EXISTS seen (
            id TEXT PRIMARY KEY,
            source TEXT,
            saved_at INTEGER
        )
        """)
        con.commit() # Commit changes
    finally: # Ensure the connection is closed
        con.close() # Close the connection

def is_seen(item_id: str) -> bool: #this function checks if an item has been processed 
    """Check if we already processed this item.id"""
    con = sqlite3.connect(dp_path) # Connect to SQLite database
    try: 
        cur = con.execute("SELECT 1 FROM seen where id = ?", (item_id,)) # Query to check if item_id exists
        return cur.fetchone() is not None # Return True if found, else False
    finally: 
        con.close() # Close the connection

def mark_as_seen(item_id: str, source: str): #this function marks an item as processed
    "Insert an item id so we won't send it again in the next run"
    con = sqlite3.connect(dp_path)  # Connect to SQLite database
    try:
        con.execute(
            "INSERT OR IGNORE INTO seen (id, source, saved_at) VALUES (?, ?, ?)",
            (item_id, source, int(datatime.utcnow()timestamp()))
        )
        con.commit() # Commit changes
    finally:
        con.close()
        

def pick_entry_id(entry) -> str: #this function picks a unique id for an RSS entry
    "Choose a unique id for an RSS entry"
    # prefer guid/id, else fallback to link, else published with title
    return(
        getattr(entry, "id", None)
        or getattr(entry, "guid", None)
        or getattr(entry, "link", None)
        or f"{getattr(entry, 'published', '')}{getattr(entry, 'title', '')}"       
    )
    
