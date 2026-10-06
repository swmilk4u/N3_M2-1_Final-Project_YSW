import fs from 'node:fs/promises';
const types={html:'text/html',css:'text/css',js:'text/javascript',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp'};
await fs.mkdir('dist/server',{recursive:true});await fs.mkdir('dist/client',{recursive:true});
await fs.cp('src/client','dist/client',{recursive:true});
await fs.copyFile('src/server/worker.mjs','dist/server/index.js');await fs.writeFile('dist/server/api.mjs',(await fs.readFile('src/server/api.mjs','utf8')).replace("'../client/domain.js'","'./domain.mjs'"));await fs.copyFile('src/client/domain.js','dist/server/domain.mjs');
const assets={};for(const name of await fs.readdir('src/client')){const extension=name.split('.').pop();if(types[extension]){const binary=['png','jpg','jpeg','webp'].includes(extension);const bytes=await fs.readFile('src/client/'+name);assets['/'+name]={content:binary?bytes.toString('base64'):bytes.toString('utf8'),type:types[extension],binary};}}
await fs.writeFile('dist/server/assets.mjs','export const assets = '+JSON.stringify(assets)+';');
console.log(`Build complete: ${Object.keys(assets).length} assets, Worker + persistent state API.`);
