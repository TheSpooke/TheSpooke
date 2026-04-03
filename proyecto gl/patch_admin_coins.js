const fs = require('fs');
const path = require('path');

// 1. PATCH SERVER.JS
let serverPath = 'c:/Users/olaaa/Downloads/proyecto gl/server.js';
let server = fs.readFileSync(serverPath, 'utf8');
if (!server.includes('/api/admin/coins')) {
    const coinRoutes = `
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

`;
    server = server.replace("// --- ENDPOINTS ADMINISTRADOR ---", "// --- ENDPOINTS ADMINISTRADOR ---\n" + coinRoutes);
    fs.writeFileSync(serverPath, server, 'utf8');
    console.log("Server.js patched.");
}

// 2. PATCH MAIN.JS
let mainPath = 'c:/Users/olaaa/Downloads/proyecto gl/js/main.js';
let main = fs.readFileSync(mainPath, 'utf8');

if (!main.includes("const tabs = ['products', 'autos', 'coins', 'config'];")) {
    main = main.replace("const tabs = ['products', 'autos', 'config'];", "const tabs = ['products', 'autos', 'coins', 'config'];");
}

if (!main.includes("renderAdminCoins(coins);")) {
    const loadAdminFixStr = `const resAutos = await fetch('/api/store/autos');
        const autos = await resAutos.json();

        renderAdminProducts(products);
        renderAdminAutos(autos);`;
        
    const loadAdminNewStr = `const resAutos = await fetch('/api/store/autos');
        const autos = await resAutos.json();
        const resCoins = await fetch('/api/store/coins');
        const coins = await resCoins.json();

        renderAdminProducts(products);
        renderAdminAutos(autos);
        renderAdminCoins(coins);`;
        
    main = main.replace(loadAdminFixStr, loadAdminNewStr);
}

if (!main.includes("function renderAdminCoins")) {
    const renderCoinsCode = `
function renderAdminCoins(coins) {
    const table = document.getElementById('admin-coins-table');
    if(!table) return;
    table.innerHTML = '';
    coins.forEach(c => {
        table.innerHTML += \`
            <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td class="py-4 px-4"><img src="\${c.image}" class="w-10 h-10 rounded object-cover shadow-lg bg-black/50"></td>
                <td class="py-4 px-4 font-mono text-sm text-brand-amber">\${c.id}</td>
                <td class="py-4 px-4 text-white font-bold">\${c.name}</td>
                <td class="py-4 px-4 text-brand-amber">$\${c.price}</td>
                <td class="py-4 px-4 text-right">
                    <button onclick='editAdminItem("coin", \${JSON.stringify(c).replace(/"/g, '&quot;')})' class="text-brand-gold hover:text-white mr-3"><i class="ri-edit-line"></i></button>
                    <button onclick="deleteAdminItem('coin', '\${c.id}')" class="text-red-500 hover:text-white"><i class="ri-delete-bin-line"></i></button>
                </td>
            </tr>
        \`;
    });
}
`;
    main = main.replace("const adminModal = document.getElementById('admin-modal');", renderCoinsCode + "\nconst adminModal = document.getElementById('admin-modal');");
}

main = main.replace(
    "context === 'product' ? 'NUEVO PRODUCTO VIP' : 'NUEVO VEHÍCULO'",
    "context === 'product' ? 'NUEVO PRODUCTO VIP' : (context === 'coin' ? 'NUEVO PAQUETE COINS' : 'NUEVO VEHÍCULO')"
);

main = main.replace(
    "context === 'product' ? 'EDITAR PRODUCTO' : 'EDITAR VEHÍCULO'",
    "context === 'product' ? 'EDITAR PRODUCTO' : (context === 'coin' ? 'EDITAR PAQUETE COINS' : 'EDITAR VEHÍCULO')"
);

main = main.replace(
    "document.getElementById('admin-input-image').value = context === 'product' ? item.image : item.img;",
    "document.getElementById('admin-input-image').value = (context === 'product' || context === 'coin') ? item.image : item.img;"
);

// Submit logic
if(!main.includes("else if (context === 'coin') {")){
    const submitOld = `if (context === 'product') {
        body.image = document.getElementById('admin-input-image').value;
        body.desc = document.getElementById('admin-input-desc').value;
        body.category = 'vip'; // default
        body.rarity = 'Premium';
    } else {
        body.img = document.getElementById('admin-input-image').value;
        body.type = document.getElementById('admin-input-desc').value;
        body.speed = 90; // default
        body.acc = 80;
        body.rarity = 'Raro';
    }`;
    const submitNew = `if (context === 'product') {
        body.image = document.getElementById('admin-input-image').value;
        body.desc = document.getElementById('admin-input-desc').value;
        body.category = 'vip';
        body.rarity = 'Premium';
    } else if (context === 'coin') {
        body.image = document.getElementById('admin-input-image').value;
        body.desc = document.getElementById('admin-input-desc').value;
        body.rarity = 'Común';
    } else {
        body.img = document.getElementById('admin-input-image').value;
        body.type = document.getElementById('admin-input-desc').value;
        body.speed = 90;
        body.acc = 80;
        body.rarity = 'Raro';
    }`;
    main = main.replace(submitOld, submitNew);
    
    main = main.replace(
        "const endpoint = context === 'product' ? '/api/admin/products' : '/api/admin/autos';",
        "const endpoint = context === 'product' ? '/api/admin/products' : (context === 'coin' ? '/api/admin/coins' : '/api/admin/autos');"
    );
}

// Delete logic
main = main.replace(
    "const endpoint = context === 'product' ? `/api/admin/products/\${id}` : `/api/admin/autos/\${id}`;",
    "const endpoint = context === 'product' ? \`/api/admin/products/\${id}\` : (context === 'coin' ? \`/api/admin/coins/\${id}\` : \`/api/admin/autos/\${id}\`);"
);

fs.writeFileSync(mainPath, main, 'utf8');
console.log("Main.js patched.");

// 3. PATCH INDEX.HTML
let htmlPath = 'c:/Users/olaaa/Downloads/proyecto gl/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

if (!html.includes('id="btn-admin-tab-coins"')) {
    const btnCoins = `
                <button onclick="switchAdminTab('coins')" id="btn-admin-tab-coins" class="admin-tab-button px-6 py-3 rounded-lg font-bold bg-[#131826]/50 text-brand-text-muted border border-[#384359] hover:border-[#F29580] hover:text-white transition-all whitespace-nowrap"><i class="ri-copper-coin-line mr-2"></i> Coins</button>`;
    html = html.replace(
        "Vehículos</button>",
        "Vehículos</button>" + btnCoins
    );
}

if (!html.includes('id="admin-tab-coins"')) {
    const coinsTab = `
            <!-- Coins Table TAB -->
            <div id="admin-tab-coins" class="admin-tab-content hidden">
                <div class="brand-card bg-brand-card/50 backdrop-blur-sm border border-[#F29580]/30 rounded-2xl p-8 mb-12">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-orbitron font-bold text-brand-amber">PAQUETES DE GL COINS</h3>
                    <button onclick="openAdminModal('coin')"
                        class="brand-button bg-brand-gradient px-4 py-2 rounded font-bold text-brand-dark flex items-center hover:scale-105 transition-all text-sm">
                        <i class="ri-add-line mr-1"></i> AÑADIR NUEVO
                    </button>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                            <tr class="border-b border-brand-gold/20 text-brand-text-muted font-orbitron text-sm">
                                <th class="py-3 px-4">IMG</th>
                                <th class="py-3 px-4">ID</th>
                                <th class="py-3 px-4">NOMBRE</th>
                                <th class="py-3 px-4">PRECIO</th>
                                <th class="py-3 px-4 text-right">ACCIONES</th>
                            </tr>
                        </thead>
                        <tbody id="admin-coins-table">
                            <tr>
                                <td colspan="5" class="text-center py-4">Cargando...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                </div>
            </div>
`;
    html = html.replace("</div> <!-- Close Admin Tab Autos -->", "</div> <!-- Close Admin Tab Autos -->\n" + coinsTab);
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log("Index.html patched.");
