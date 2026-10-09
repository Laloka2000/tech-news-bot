import fs from "fs";
import path from "path";
import RSSParser from "rss-parser";
import Database from "better-sqlite3";
import axios from "axios";
import dotenv from "dotenv";
import { escape } from "querystring";

dotenv.config();

const bot_token = process.env.bot_token;
const chat_id = process.env.chat_id;
const db_path = path.join("data", "seen.sqlite3");

const parser = new RSSParser();

// -------- database setup --------

if (!fs.existsSync("data")) fs.mkdirSync("data");
const db = new Database(db_path);

db.prepare(
  `
  CREATE TABLE IF NOT EXISTS seen (
    id TEXT PRIMARY KEY,
    feed_source TEXT,
    saved_at INTEGER
  )
`
).run();

function isSeen(id) {
  return !!db.prepare("SELECT 1 FROM seen WHERE id = ?").get(id);
}

function markAsSeen(id, source) {
  db.prepare(
    "INSERT OR IGNORE INTO seen(id, feed_source, saved_at) VALUES (?, ?, ?)"
  ).run(id, source, Math.floor(Date.now() / 1000));
}

// ------- feeds -------

const feeds = [
  ["freeCodeCamp", "https://www.freecodecamp.org/news/rss/"],
  ["Prog.hu", "https://prog.hu/site/backend/proghu-rss.xml"],
  ["Marc Lou Beehiv", "https://rss.beehiiv.com/feeds/eFrYnr889a.xml"],
  ["JetBrains Blog", "https://blog.jetbrains.com/feed/"],
  ["The Pragmatic Engineer", "https://feeds.feedburner.com/ThePragmaticEngineer"],
  ["Software engineering Daily", "https://softwareengineeringdaily.com/feed/podcast/"],
];

// ------- Telegram -------
function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${bot_token}/sendMessage`;
  await axios.post(url, {
    chat_id,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

// ------- main job -------

async function runOnce() {
  let freshItems = [];

  for (const [name, url] of feeds) {
    const feed = await parser.parseURL(url);
    for (const entry of feed.items.slice(0, 5)) {
      const id = entry.grid || entry.link || entry.title;
      if (!id || isSeen(id)) continue;

      freshItems.push({
        source: name,
        title: entry.title?.trim(),
        link: entry.link,
        id,
      });
      markAsSeen(id, name);
    }
  }

  if (freshItems.length === 0) {
    console.log("No new items.");
    return;
  }

  const msg =
    `🗞️ <b>Daily picks</b>\n\n` +
    freshItems
      .map(
        (i) => 
          `📌 <b>${escapeHtml(i.title)}</b>\n` + 
        `<i>${escapeHtml(i.source)}</i> - <a href="${escapeHtml(i.link)}">Olvasd el</a>`
      )
      .join("\n\n");

  await sendTelegramMessage(msg);
  console.log(`Sent ${freshItems.length} new items.`);
}

runOnce().then(()=> {
  console.log("Finished successfully, the news has been sent to you!");
  process.exit();
}).catch((err) => {
  console.log("Error:", err.response?.data ?? err.message);
  process.exit(1);
})
