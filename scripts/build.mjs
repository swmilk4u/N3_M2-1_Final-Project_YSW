import fs from 'node:fs/promises';
const types={html:'text/html',css:'text/css',js:'text/javascript',svg:'image/svg+xml'};
await fs.mkdir('dist/server',{recursive:true});await fs.mkdir('dist/client',{recursive:true});
await fs.cp('src/client','dist/client',{recursive:true});
await fs.copyFile('src/server/worker.mjs','dist/server/index.js');await fs.copyFile('src/server/api.mjs','dist/server/api.mjs');
const assets={};for(const name of await fs.readdir('src/client')){const extension=name.split('.').pop();if(types[extension])assets['/'+name]={content:await fs.readFile('src/client/'+name,'utf8'),type:types[extension]};}
await fs.writeFile('dist/server/assets.mjs','export const assets = '+JSON.stringify(assets)+';');
console.log(`Build complete: ${Object.keys(assets).length} assets, Worker + persistent state API.`);
