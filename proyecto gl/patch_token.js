const fs = require('fs');

let serverPath = 'c:/Users/olaaa/Downloads/proyecto gl/server.js';
let server = fs.readFileSync(serverPath, 'utf8');

// Parchear Give-coins admin endpoint
const oldGiveBody = `const payload = {
            id: 'admin_gift_' + Date.now(),
            user: { fivemId: hex },
            items: [
                { name: "Regalo Administrativo de Coins", amount_coins: parseInt(amount) }
            ]
        };`;
        
const newGiveBody = `const payload = {
            token: FIVEM_API_KEY,  // Enviamos Token seguro por dentro del body JSON
            id: 'admin_gift_' + Date.now(),
            user: { fivemId: hex },
            items: [
                { name: "Regalo Administrativo de Coins", amount_coins: parseInt(amount) }
            ]
        };`;
        
server = server.replace(oldGiveBody, newGiveBody);

// Parchear Checkout endpoint
const oldCheckoutBody = `const payload = {
            id: newOrder.id,
            user: { fivemId: dbUser.steamId }, // O license si está detectada
            items: newOrder.items
        };`;
        
const newCheckoutBody = `const payload = {
            token: FIVEM_API_KEY,  // Enviamos Token por dentro del body JSON
            id: newOrder.id,
            user: { fivemId: dbUser.steamId }, // O license si está detectada
            items: newOrder.items
        };`;

server = server.replace(oldCheckoutBody, newCheckoutBody);

fs.writeFileSync(serverPath, server, 'utf8');
console.log("Server.js PATCHED to Body Token Auth!");
