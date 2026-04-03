const fs = require('fs');

// 1. PATCH CONFIG.LUA (FiveM)
let luaPath = 'c:/Users/olaaa/Downloads/proyecto gl/gl_store_api/shared/config.lua';
let lua = fs.readFileSync(luaPath, 'utf8');

if (!lua.includes("productData.amount_coins")) {
    const oldLua = `        local amount = productData.price * 100 -- Ejemplo: Cada dólar son 100 coins
        print(("^2[Tienda]^7 Dando %s coins a la cuenta de %s"):format(amount, charIdentifier))`;
        
    const newLua = `        local amount = productData.amount_coins
        if not amount then
            amount = productData.price * 20 -- 1 USD = 20 Coins (Economia configurada)
        end
        print(("^2[Tienda]^7 Dando %s coins a la cuenta de %s"):format(amount, charIdentifier))`;
        
    lua = lua.replace(oldLua, newLua);
    fs.writeFileSync(luaPath, lua, 'utf8');
    console.log("Config.lua patched.");
}

// 2. PATCH SERVER.JS (Endpoint)
let serverPath = 'c:/Users/olaaa/Downloads/proyecto gl/server.js';
let server = fs.readFileSync(serverPath, 'utf8');

if (!server.includes('/api/admin/give-coins')) {
    const giveRoute = `
app.post('/api/admin/give-coins', isAdmin, async (req, res) => {
    try {
        const { hex, amount } = req.body;
        if(!hex || !amount) return res.status(400).json({ error: "Faltan datos." });
        
        const payload = {
            id: 'admin_gift_' + Date.now(),
            user: { fivemId: hex },
            items: [
                { name: "Regalo Administrativo de Coins", amount_coins: parseInt(amount) }
            ]
        };
        
        const fivemResponse = await fetch(\`http://\${FIVEM_IP}/gl_store_api/redeem\`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + FIVEM_API_KEY
            },
            body: JSON.stringify(payload)
        });
        
        if (fivemResponse.ok) {
            res.json({ success: true, message: \`\${amount} Coins entregados a \${hex} correctamente en el juego.\` });
        } else {
            res.status(500).json({ error: "El servidor de FiveM rechazó la petición. Comprueba tu FIVEM_API_KEY o que el server local corra." });
        }
    } catch(err) {
        res.status(500).json({ error: "No hay conexión HTTP con el servidor FiveM. Asegúrate de iniciarlo." });
    }
});
`;
    server = server.replace("// --- ENDPOINTS ADMINISTRADOR ---", "// --- ENDPOINTS ADMINISTRADOR ---\n" + giveRoute);
    fs.writeFileSync(serverPath, server, 'utf8');
    console.log("Server.js patched.");
}

// 3. PATCH INDEX.HTML (Boton UI)
let htmlPath = 'c:/Users/olaaa/Downloads/proyecto gl/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

if (!html.includes('promptGiveCoins()')) {
    const btnGive = `
                    <button onclick="promptGiveCoins()"
                        class="brand-button bg-brand-gold/10 text-brand-gold border border-brand-gold/50 px-4 py-2 rounded font-bold flex items-center hover:scale-105 hover:bg-brand-gold hover:text-black transition-all text-sm mr-2">
                        <i class="ri-gift-line mr-1"></i> REGALAR A JUGADOR
                    </button>
                    <button onclick="openAdminModal('coin')"`;
    html = html.replace(`<button onclick="openAdminModal('coin')"`, btnGive);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log("Index.html patched.");
}

// 4. PATCH MAIN.JS (Frontend Fetch logic)
let mainPath = 'c:/Users/olaaa/Downloads/proyecto gl/js/main.js';
let main = fs.readFileSync(mainPath, 'utf8');

if (!main.includes('async function promptGiveCoins()')) {
    const func = `
// --- Regalar Coins Administrador ---
async function promptGiveCoins() {
    const hex = prompt("Introduce el Identificador (license:XXX) del jugador al que vas a regalar Coins:");
    if (!hex) return;
    const amount = prompt("¿Cuántos Coins quieres darle a " + hex + "?");
    if (!amount || isNaN(amount)) return;
    
    if(!confirm(\`¿Seguro que quieres inyectar \${amount} Coins gratis a la cuenta \${hex} del juego?\`)) return;
    
    try {
        const res = await fetch('/api/admin/give-coins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ hex: hex.trim(), amount: amount })
        });
        const data = await res.json();
        
        if (data.success) {
            alert("✅ ÉXITO: " + data.message);
        } else {
            alert("❌ ERROR: " + data.error);
        }
    } catch(err) {
        alert("❌ Error crítico de conexión al intentar enviar los Coins.");
    }
}
`;
    main = main + func;
    fs.writeFileSync(mainPath, main, 'utf8');
    console.log("Main.js patched.");
}
