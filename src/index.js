import fs from "fs";
import path from "path";
import RSSParser from "rss-parser";
import Database from "better-sqlite3";
import axios from "axios";
import schedule from "node-schedule";
import dotenv from "dotenv";

dotenv.config();

const bot_token = process.env.bot_token;
const chat_id = process.env.chat_id;
const db_path = path.join("data", "seen.sqlite3");

const parser = (parser = new RSSParser());

// -------- database setup --------

if (!fs.existsSyncs("data")) fs.mkdirSync("data");
const db = new Database(db);

db.prepare(
  `
    CREATE TABLE IF NOT EXITS seen (
    id TEXT PRIMARY KEY
    source TEXT,
    saved_at INTEGER
    )
`
).run();


function isSeen(id){
    return !!db.prepare("SELECT 1 FROM seen WHERE id = ?").get(id);
}

function markAsSeen(id, source){
    db.prepare("INSERT OR IGNORE INTO seen(id, source, saved_at) VALUES (?, ?, ?)").run(id, source, Math.floor(Date.now() / 1000));
}

// ------- feeds -------

const feeds = [
    ["Vue.js News", "https://news.vuejs.org/rss.xml"],
    ["React Status", "https://react.statuscode.com/rss.xml"],
    ["JavaScript Weekly", "https://javascriptweekly.com/rss/"],
    ["Node Weekly", "https://nodeweekly.com/rss/"],
    ["Frontend Focus", "https://frontendfoc.us/rss/"],
    ["JavaScript Daily", "https://javascriptdaily.com/rss/"],
    ["TypeScript Weekly", "https://www.typescriptweekly.com/rss/"],
    ["Google Developers Blog", "https://developers.googleblog.com/atom.xml"],
    ["AWS News Blog", "https://aws.amazon.com/blogs/aws/feed/"],
]