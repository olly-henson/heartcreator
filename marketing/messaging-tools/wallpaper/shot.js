const puppeteer=require('C:/Users/Olly/AI OS/heartattractor/funnel/node_modules/puppeteer');const path=require('path');
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});const p=await b.newPage();
await p.setViewport({width:1179,height:2556});await p.goto('file:///'+path.resolve('argument-wallpaper.html'),{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,800));
const over=await p.evaluate(()=>{const w=document.querySelector('.wrap');return w.scrollHeight>w.clientHeight});
await p.screenshot({path:'argument-wallpaper.png'});console.log('overflow',over);await b.close();})();
