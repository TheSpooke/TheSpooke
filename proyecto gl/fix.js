const fs = require('fs');
const file = 'c:/Users/olaaa/Downloads/proyecto gl/js/main.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    "const labelFivem = document.querySelector('label[for=\"checkout-fivem-id\"]') || document.querySelector('#checkout-fivem-id').previousElementSibling;",
    "const labFivemInput = document.getElementById('checkout-fivem-id');\n            const labelFivem = labFivemInput ? labFivemInput.closest('.group').querySelector('label') : null;"
);

content = content.replace(
    "'store': document.getElementById('page-store'),",
    "'store': document.getElementById('page-store'),\n    'coins': document.getElementById('page-coins'),"
);

content = content.replace(
    "if (pageId === 'store') loadStore();",
    "if (pageId === 'store') loadStore();\n    if (pageId === 'coins') loadCoins();"
);

const loadCoinsFunc = `
// --- LOAD COINS ---
async function loadCoins() {
    const grid = document.getElementById('coins-grid');
    if (!grid) return;
    try {
        const res = await fetch('/api/store/coins');
        const coins = await res.json();
        let html = '';
        coins.forEach(coin => {
            const coinJson = encodeURIComponent(JSON.stringify(coin));
            html += \`
                <div class="brand-card group bg-brand-surface border border-brand-amber/20 hover:border-brand-amber transition-all duration-300 transform hover:-translate-y-2 rounded-2xl overflow-hidden flex flex-col h-full shadow-[0_0_15px_rgba(242,149,128,0.05)] hover:shadow-[0_0_30px_rgba(242,149,128,0.3)]">
                    <div class="h-40 overflow-hidden relative">
                        <div class="absolute inset-0 bg-brand-amber/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                        <img src="\${coin.image}" alt="\${coin.name}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 text-brand-dark flex items-center justify-center font-bold">
                    </div>
                    <div class="p-6 flex flex-col flex-1">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-xl font-bold text-white leading-tight font-orbitron">\${coin.name}</h3>
                        </div>
                        <p class="text-brand-text-muted text-sm mb-6 flex-1">\${coin.desc || 'Paquete de Monedas (GL Coins)'}</p>
                        <div class="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                            <span class="text-2xl font-orbitron font-black text-brand-gold">$\${coin.price.toFixed(2)}</span>
                            <button onclick="addToCart('\${coinJson}')" class="brand-button border border-brand-amber text-brand-amber hover:bg-brand-amber hover:text-black font-bold px-4 py-2 rounded-lg transition-colors group-hover:bg-brand-amber group-hover:text-black">
                                <i class="ri-shopping-cart-2-line"></i> AÑADIR
                            </button>
                        </div>
                    </div>
                </div>\`;
        });
        grid.innerHTML = html;
    } catch(err) {
        console.error("Error", err);
    }
}
`;

content = content.replace("// --- LOAD STORE ---", loadCoinsFunc + "\n// --- LOAD STORE ---");

fs.writeFileSync(file, content);
console.log("Archivo main.js inyectado exitosamente.");
