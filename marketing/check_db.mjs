import { readFileSync } from "fs";
const env = Object.fromEntries(readFileSync("C:/Users/Olly/AI OS/marketing/.env","utf8").split("\n").filter(l=>l.includes("=")&&!l.startsWith("#")).map(l=>l.split("=").map(p=>p.trim())));
const token = env["NOTION_API_TOKEN"];
const res = await fetch("https://api.notion.com/v1/databases/36e30e58-6a0d-8192-bda3-fbf027c8f644/query",{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json","Notion-Version":"2022-06-28"},body:"{}"});
const data = await res.json();
console.log("Results:", data.results?.length);
console.log(JSON.stringify(data.results?.map(p=>({id:p.id,period:p.properties?.Period?.title?.[0]?.plain_text,archived:p.archived,in_trash:p.in_trash})),null,2));
