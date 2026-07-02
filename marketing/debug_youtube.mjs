import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));

const res = await fetch(
  `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${env["YOUTUBE_CHANNEL_ID"]}&key=${env["YOUTUBE_API_KEY"]}`
);
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
