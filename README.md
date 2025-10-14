# 📰 Tech News Scraper Bot 🤖  
A Node.js bot that scrapes the latest tech articles from selected sources every weekend and sends them to your **Telegram** chat automatically 🕙✨

> Built with 🧠 Node.js · 🗄️ SQLite · 📬 Telegram Bot API · ⏰ node-schedule

---

## 📌 Features

- 🌐 **Scrapes RSS feeds** (e.g. FreeCodeCamp) for the latest articles  
- 💾 Keeps track of already sent articles using SQLite, so no duplicates  
- 🤖 Sends articles directly to your Telegram chat or channel  
- 🕰️ Automatically runs **every Monday at 10:00 Budapest time**  
- 🧪 Includes an easy test scheduler to verify deployments without waiting all week  
- 🆓 Deployed on Railways

---

## 🛠️ Tech Stack

- **Node.js** – Backend runtime  
- **rss-parser** – For parsing RSS feeds  
- **better-sqlite3** – Lightweight database for tracking seen articles  
- **node-schedule** – Time-based job scheduling  
- **Telegram Bot API** – To send the scraped news to your chat  
- **dotenv** – For environment variable management
- **Railway** – For running automatically

