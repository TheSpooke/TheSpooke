require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, 'data.json');

// Obtener Admin IDs del ENV o por defecto vacío
// Obtener Admin IDs del ENV limpiando espacios extra
const ADMIN_STEAM_IDS = process.env.ADMIN_STEAM_IDS ? process.env.ADMIN_STEAM_IDS.split(',').map(id => id.trim()) : [];

function getDatabase() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const db = JSON.parse(data);
        if(!db.orders) db.orders = [];
        if(!db.coins) db.coins = [];
        if(!db.settings) db.settings = { heroTitle: 'GLOBAL LIFE RP', heroSubtitle: 'La mejor experiencia de Roleplay con economía realista', discordUrl: 'https://discord.gg/', heroVideo: 'assets/hero_video.mp4' };
        return db;
    } catch(err) {
        return { products: [], autos: [], coins: [], orders: [], settings: { heroTitle: 'GLOBAL LIFE RP', heroSubtitle: 'La mejor experiencia', discordUrl: 'https://discord.gg/', heroVideo: 'assets/hero_video.mp4' } };
    }
}

function saveDatabase(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Middleware de Seguridad para proteger las rutas del Admin
function isAdmin(req, res, next) {
    if (req.isAuthenticated() && ADMIN_STEAM_IDS.includes(req.user.id)) {
        return next();
    }
    return res.status(403).json({ error: 'Acceso denegado. No eres administrador.' });
}

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// [AGREGADO: Variable para la Tienda Automática de FiveM] ---
// Filter trim added to prevent Windows .env \r carriage return breaking FiveM
const FIVEM_API_KEY = process.env.FIVEM_API_KEY ? process.env.FIVEM_API_KEY.trim() : 'PON_UNA_CLAVE_LAAAAAARGA_AQUI';
// -----------------------------------------------------------

// Configuración de Express Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'clave_secreta_super_segura_global_life',
    name: 'globallife_session',
    resave: true,
    saveUninitialized: true
}));

// Servir archivos HTML estáticos
app.use(express.static(path.join(__dirname)));

// Serializar el usuario para almacenarlo en la sesión
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserializar el usuario al solicitarlo
passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Configurar la estrategia de inicio de sesión de Steam
if (process.env.STEAM_API_KEY && process.env.STEAM_API_KEY !== 'pon_tu_api_key_de_steam_aqui') {
    passport.use(new SteamStrategy({
        returnURL: `${BASE_URL}/auth/steam/return`,
        realm: BASE_URL,
        apiKey: process.env.STEAM_API_KEY
    },
    (identifier, profile, done) => {
        // En un caso real, aquí buscarías o insertarías el usuario en la base de datos
        // usando profile.id (su SteamId64)
        return done(null, profile);
    }));
} else {
    console.warn(`----------------------------------------------------------------`);
    console.warn(`⚠️ ALERTA: STEAM_API_KEY no ha sido configurada correctamente en el .env.`);
    console.warn(`⚠️ El inicio de sesión con Steam generará error (500).`);
    console.warn(`⚠️ Consigue tu clave en: https://steamcommunity.com/dev/apikey`);
    console.warn(`----------------------------------------------------------------`);
}

app.use(passport.initialize());
app.use(passport.session());

// --- ENDPOINTS PARA AUTH STEAM ---

// 1. Redirigir a los servidores de Steam para iniciar sesión
app.get('/auth/steam',
    passport.authenticate('steam', { failureRedirect: '/' })
);

// 2. Callback cuando Steam devuelve al usuario
app.get('/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    (req, res) => {
        // Si todo va bien, redigir al index principal
        res.redirect('/');
    }
);

// 3. Obtener el usuario actual
app.get('/api/user', (req, res) => {
    if (req.isAuthenticated()) {
        const isAdminUser = ADMIN_STEAM_IDS.includes(req.user.id.toString());
        
        console.log(`[AUTH] Usuario: ${req.user.displayName} | ID: ${req.user.id} | ¿Es Admin?: ${isAdminUser}`);
        
        res.json({
            authenticated: true,
            user: {
                steamId: req.user.id,
                username: req.user.displayName,
                avatar: req.user.photos && req.user.photos.length > 0 ? req.user.photos[2].value : null,
                isAdmin: isAdminUser
            }
        });
    } else {
        res.json({ authenticated: false });
    }
});

// 4. Cerrar sesión
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) console.error(err);
        res.redirect('/');
    });
});

// 5. Configuración para el Frontend
app.get('/api/config', (req, res) => {
    const db = getDatabase();
    res.json({
        paypalClientId: process.env.PAYPAL_CLIENT_ID || 'sb',
        fivemIp: process.env.FIVEM_IP || '127.0.0.1:30120',
        settings: db.settings
    });
});

// --- ENDPOINTS PARA FIVEM SERVER PROXY ---
const FIVEM_IP = process.env.FIVEM_IP || '127.0.0.1:30120';
const isCfx = FIVEM_IP.includes('cfx.re/join/');
const cfxId = isCfx ? FIVEM_IP.split('cfx.re/join/')[1].replace('/', '') : null;

let cfxCache = null;
let cfxLastFetch = 0;

async function getCfxData() {
    // Evitar ser bloqueados por la API de FiveM haciendo cache de 5 segundos
    if (Date.now() - cfxLastFetch < 5000 && cfxCache) return cfxCache; 
    const response = await fetch(`https://servers-frontend.fivem.net/api/servers/single/${cfxId}`, { 
        signal: AbortSignal.timeout(5000), 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } 
    });
    if (!response.ok) throw new Error('Servidor Cfx no responde');
    const data = await response.json();
    cfxCache = data.Data;
    cfxLastFetch = Date.now();
    return cfxCache;
}

app.get('/api/server/status', async (req, res) => {
    try {
        if (isCfx) {
            const data = await getCfxData();
            const ping = Math.floor(Math.random() * 20) + 15;
            return res.json({ 
                online: true, 
                maxClients: data.sv_maxclients || 64, 
                clients: data.clients || 0,
                ping, 
                serverName: data.hostname ? data.hostname.substring(0, 30) + '...' : "Global Life RP" 
            });
        }
        
        // Fetch info.json for maxClients
        const infoRes = await fetch(`http://${FIVEM_IP}/info.json`, { signal: AbortSignal.timeout(3000) });
        if (!infoRes.ok) throw new Error('Servidor no responde');
        const infoData = await infoRes.json();
        
        // Fetch players.json for current count
        const playersRes = await fetch(`http://${FIVEM_IP}/players.json`, { signal: AbortSignal.timeout(3000) });
        let currentPlayers = 0;
        if (playersRes.ok) {
            const playersData = await playersRes.json();
            currentPlayers = playersData.length;
        }

        const ping = Math.floor(Math.random() * 20) + 15;
        res.json({ 
            online: true, 
            maxClients: infoData.vars?.sv_maxClients || 64, 
            clients: currentPlayers,
            ping, 
            serverName: infoData.vars?.sv_projectName || "Global Life RP" 
        });
    } catch (error) {
        console.error("Error Status:", error.message);
        res.json({ online: false, clients: 0, maxClients: 0, ping: 0, serverName: "Desconectado" });
    }
});

app.get('/api/server/players', async (req, res) => {
    try {
        if (isCfx) {
            const data = await getCfxData();
            return res.json({ 
                online: true, 
                count: data.clients, 
                players: data.players || [] 
            });
        }

        const response = await fetch(`http://${FIVEM_IP}/players.json`, { signal: AbortSignal.timeout(3000) });
        if (!response.ok) throw new Error('Servidor no responde');
        const players = await response.json();
        
        res.json({ online: true, count: players.length, players: players });
    } catch (error) {
        console.error("Error Players:", error.message);
        res.json({ online: false, count: 0, players: [] });
    }
});

// --- AUTO DETECT FIVEM LICENSE ---
app.get('/api/user/identifiers', async (req, res) => {
    if (!req.isAuthenticated()) return res.json({ found: false, error: 'No autenticado' });
    
    try {
        const steamId = req.user.id;
        const steamHex = BigInt(steamId).toString(16).toLowerCase();
        const searchIdentifier = `steam:${steamHex}`;
        
        // Fetch players from server
        let players = [];
        if (isCfx) {
            const data = await getCfxData();
            players = data.players || [];
        } else {
            const response = await fetch(`http://${FIVEM_IP}/players.json`, { signal: AbortSignal.timeout(3000) });
            if (response.ok) players = await response.json();
        }
        
        // Match player
        const player = players.find(p => p.identifiers && p.identifiers.some(id => id.toLowerCase() === searchIdentifier));
        
        if (player) {
            const license = player.identifiers.find(id => id.startsWith('license:'));
            return res.json({ found: true, license, playerID: player.id });
        }
        
        res.json({ found: false, message: 'Usuario no conectado al servidor' });
    } catch (e) {
        console.error("Error identificadores:", e.message);
        res.json({ found: false, error: 'Error consultando al servidor FiveM' });
    }
});

// --- BASE DE DATOS LOCAL: CATÁLOGO ECO COMMERCE ---
app.use(express.json()); // Necesario para leer JSON body

app.get('/api/store/products', (req, res) => {
    const db = getDatabase();
    res.json(db.products);
});

app.get('/api/store/autos', (req, res) => {
    const db = getDatabase();
    res.json(db.autos);
});

app.get('/api/store/coins', (req, res) => {
    const db = getDatabase();
    res.json(db.coins);
});

// --- ENDPOINTS ADMINISTRADOR ---

app.post('/api/admin/give-coins', isAdmin, async (req, res) => {
    try {
        const { hex, amount } = req.body;
        if(!hex || !amount) return res.status(400).json({ error: "Faltan datos." });
        
        const payload = {
            token: FIVEM_API_KEY,  // Enviamos Token seguro por dentro del body JSON
            id: 'admin_gift_' + Date.now(),
            user: { fivemId: hex, license: hex, steamHex: hex },
            items: [
                { name: "Regalo Administrativo de Coins", amount_coins: parseInt(amount) }
            ]
        };
        
        const fivemResponse = await fetch(`http://${FIVEM_IP}/gl_store_api/redeem`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + FIVEM_API_KEY
            },
            body: JSON.stringify(payload)
        });
        
        if (fivemResponse.ok) {
            res.json({ success: true, message: `${amount} Coins entregados a ${hex} correctamente en el juego.` });
        } else {
            res.status(500).json({ error: "El servidor de FiveM rechazó la petición. Comprueba tu FIVEM_API_KEY o que el server local corra." });
        }
    } catch(err) {
        res.status(500).json({ error: "No hay conexión HTTP con el servidor FiveM. Asegúrate de iniciarlo." });
    }
});


app.post('/api/admin/coins', isAdmin, (req, res) => {
    const db = getDatabase();
    const newCoin = req.body;
    const index = db.coins.findIndex(c => c.id === newCoin.id);
    if(index !== -1) db.coins[index] = newCoin;
    else db.coins.push(newCoin);
    saveDatabase(db);
    res.json({ success: true, message: 'Paquete de Coins guardado' });
});

app.delete('/api/admin/coins/:id', isAdmin, (req, res) => {
    const db = getDatabase();
    db.coins = db.coins.filter(c => c.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, message: 'Paquete de Coins eliminado' });
});


app.post('/api/admin/config', isAdmin, (req, res) => {
    const db = getDatabase();
    db.settings = { ...db.settings, ...req.body };
    saveDatabase(db);
    res.json({ success: true, message: 'Configuración guardada correctamente' });
});

app.post('/api/admin/products', isAdmin, (req, res) => {
    const db = getDatabase();
    const newProduct = req.body;
    
    const index = db.products.findIndex(p => p.id === newProduct.id);
    if(index !== -1) {
        db.products[index] = newProduct; // Update
    } else {
        db.products.push(newProduct); // Insert
    }
    
    saveDatabase(db);
    res.json({ success: true, message: 'Producto guardado' });
});

app.delete('/api/admin/products/:id', isAdmin, (req, res) => {
    const db = getDatabase();
    db.products = db.products.filter(p => p.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, message: 'Producto eliminado' });
});

app.post('/api/admin/autos', isAdmin, (req, res) => {
    const db = getDatabase();
    const newAuto = req.body;
    
    const index = db.autos.findIndex(a => a.id === newAuto.id);
    if(index !== -1) {
        db.autos[index] = newAuto; // Update
    } else {
        db.autos.push(newAuto); // Insert
    }
    
    saveDatabase(db);
    res.json({ success: true, message: 'Vehículo guardado' });
});

app.delete('/api/admin/autos/:id', isAdmin, (req, res) => {
    const db = getDatabase();
    db.autos = db.autos.filter(a => a.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true, message: 'Vehículo eliminado' });
});

// Endpoint de Registro de Ventas / Checkout
app.post('/api/checkout', (req, res) => {
    const orderData = req.body;
    console.log(`[VENTA] Nueva transacción de ${orderData.user?.name} | Discord: ${orderData.user?.discord} | ID: ${orderData.user?.steamId} por $${orderData.total}`);
    
    const db = getDatabase();
    
    const newOrder = {
        id: 'ord_' + Date.now(),
        date: new Date().toISOString(),
        ...orderData
    };
    
    db.orders.push(newOrder);
    saveDatabase(db);
    
    // Guardar en un log local histórico
    fs.appendFileSync(path.join(__dirname, 'ventas.log'), JSON.stringify(newOrder) + '\n', 'utf8');
    
    // =========================================================================
    // [INICIO AGREGADO: CÓDIGO PARA DISCORD (ROLES Y WEBHOOK)]
    // =========================================================================
    const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
    const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
    const DISCORD_SERVER_ID = process.env.DISCORD_SERVER_ID;
    const DISCORD_VIP_ROLE_ID = process.env.DISCORD_VIP_ROLE_ID;

    if (DISCORD_WEBHOOK_URL) {
        let itemsStr = "";
        let isVip = false;
        if (orderData.items && orderData.items.length > 0) {
            orderData.items.forEach(item => {
                itemsStr += `\n- ${item.name} ($${item.price})`;
                if (item.name && item.name.toLowerCase().includes('vip')) isVip = true;
            });
        }
        
        // 1. Enviar Webhook para los Admins
        fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: "💵 Nueva Compra en la Web",
                    color: 3066993, // Verde
                    fields: [
                        { name: "Steam/Nombre", value: orderData.user?.name || "Anónimo", inline: true },
                        { name: "ID Discord", value: orderData.user?.discord || "No provisto", inline: true },
                        { name: "Total Pagado", value: `$${orderData.total}`, inline: true },
                        { name: "Ítems", value: itemsStr || "Sin items" }
                    ],
                    footer: { text: `Transaction ID: ${orderData.transactionId || orderData.id}` },
                    timestamp: new Date().toISOString()
                }]
            })
        }).catch(err => console.error("[VENTA-DISCORD] Error Webhook Discord:", err));

        // 2. Dar Rol automáticamente basado en los Items (Soporte Multi-VIP)
        if (DISCORD_BOT_TOKEN && DISCORD_SERVER_ID && orderData.user?.discord) {
            const discordId = orderData.user.discord.trim();
            // Comprobar si es un ID de Discord puramente numérico (17 a 19 dígitos)
            if (/^\d{17,20}$/.test(discordId)) {
                
                // Recorremos todos los iteradores comprados
                if (orderData.items && orderData.items.length > 0) {
                    orderData.items.forEach(item => {
                        // Buscar si el admin puso un ROL específico para el ID de este item
                        // Ejemplo: Si el item id es "vip1", buscará DISCORD_ROLE_VIP1 en el .env
                        let roleIdToGive = process.env[`DISCORD_ROLE_${item.id.toUpperCase()}`];
                        
                        // Fallback: Si no hay rol específico pero el nombre tiene "vip", usar el general
                        if (!roleIdToGive && item.name && item.name.toLowerCase().includes('vip')) {
                            roleIdToGive = DISCORD_VIP_ROLE_ID;
                        }

                        if (roleIdToGive) {
                            fetch(`https://discord.com/api/v10/guilds/${DISCORD_SERVER_ID}/members/${discordId}/roles/${roleIdToGive}`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bot ${DISCORD_BOT_TOKEN}`,
                                    'X-Audit-Log-Reason': `Compra Automática de ${item.name} en Web`
                                }
                            })
                            .then(r => {
                                if (!r.ok) console.error(`[VENTA-DISCORD] Error al asignar rol ${roleIdToGive} al usuario (Status: ${r.statusText})`);
                                else console.log(`[VENTA-DISCORD] Rol ${roleIdToGive} otorgado exitosamente al ID Discord ${discordId}`);
                            })
                            .catch(err => console.error(`[VENTA-DISCORD] Excepción dando rol de Discord: ${err.message}`));
                        }
                    });
                }
            } else {
                if(isVip) {
                     console.warn(`[VENTA-DISCORD] El jugador introdujo un ID de Discord inválido ("${discordId}"). Debe ser numérico. No se asignaron roles.`);
                }
            }
        }
    }
    // =========================================================================
    // [FIN AGREGADO: CÓDIGO PARA DISCORD (ROLES Y WEBHOOK)]
    // =========================================================================
    
    // =========================================================================
    // [INICIO AGREGADO: CÓDIGO PARA MANDAR LAS COMPRAS AL SERVIDOR FIVEM]
    // Si decides revertir la tienda automática, simplemente borra hasta donde dice FIN.
    // =========================================================================
    const FIVEM_IP_CLEAN = (FIVEM_IP || '').replace(/https?:\/\//, '').split('/')[0];
    
    fetch(`http://${FIVEM_IP_CLEAN}/gl_store_api/redeem`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FIVEM_API_KEY}`
        },
        body: JSON.stringify({ token: FIVEM_API_KEY, ...newOrder })
    })
    .then(r => r.text())
    .then(respText => {
        console.log(`[VENTA-FIVEM] Respuesta del Servidor de FiveM: ${respText}`);
    })
    .catch(err => {
        console.error(`[VENTA-FIVEM] Error enviando compra a FiveM. ¿Está encendido el servidor y gl_store_api iniciado?: ${err.message}`);
    });
    // =========================================================================
    // [FIN AGREGADO: CÓDIGO PARA MANDAR LAS COMPRAS AL SERVIDOR FIVEM]
    // =========================================================================

    res.json({ success: true, message: 'Pago registrado en el servidor correctamente.' });
});

// Endpoint para que el Admin vea TODOS los pedidos
app.get('/api/admin/orders', isAdmin, (req, res) => {
    const db = getDatabase();
    // Devolver todos los pedidos, ordenados por fecha descendente
    const allOrders = [...db.orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, orders: allOrders });
});


// Endpoint para obtener el historial de compras
app.get('/api/user/orders', (req, res) => {
    if (!req.isAuthenticated()) return res.json({ error: 'No autenticado', orders: [] });
    
    const steamId = req.user.id.toString();
    const db = getDatabase();
    
    const userOrders = db.orders.filter(o => o.user?.steamId === steamId).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({ success: true, orders: userOrders });
});

// Route catch-all para Single Page Application
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🌴 Global Life RP Backend ejecutándose en ${BASE_URL} 🌴`);
});
