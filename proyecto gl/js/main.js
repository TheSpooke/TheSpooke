// ===== VICE CITY RP - MAIN JAVASCRIPT (RECONSTRUCTED) ===== //

// Evento de inicio
document.addEventListener('DOMContentLoaded', function() {
    initializeViceCity();
});

// ===== INICIALIZACIÓN PRINCIPAL ===== //
function initializeViceCity() {
    initLoadingScreen();
    initSmoothScrolling();
    initNavigation();
    initAnimations();
    initCounters();
    initTypingEffect();
    initMobileMenu();
    initScrollEffects();
    initInteractiveEffects();
    initSteamAuth();
    initEasterEggs();
    optimizePerformance();
    
    // Carga inicial de la SPA basada en el hash
    const initialHash = window.location.hash.replace('#', '') || 'home';
    navigateTo(initialHash);
    
    console.log('🌴 Global Life RP initialized successfully');
}

window.toggleHeroVolume = function() {
    const video = document.getElementById('hero-bg-video');
    const icon = document.getElementById('hero-audio-icon');
    const label = document.querySelector('#hero-audio-toggle span');
    
    if(!video || !icon) return;
    
    if(video.muted) {
        video.muted = false;
        video.volume = 0.5;
        icon.classList.remove('ri-volume-mute-line');
        icon.classList.add('ri-volume-up-line');
        if(label) label.innerText = "SILENCIAR";
        console.log("🔊 Hero audio active");
    } else {
        video.muted = true;
        icon.classList.remove('ri-volume-up-line');
        icon.classList.add('ri-volume-mute-line');
        if(label) label.innerText = "ACTIVAR SONIDO";
        console.log("🔇 Hero audio muted");
    }
};

// ===== PANTALLA DE CARGA ===== //
function initLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingProgress = document.querySelector('.loading-progress');
    if (!loadingScreen || !loadingProgress) return;
    
    let progress = 0;
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => { loadingScreen.remove(); }, 500);
            }, 500);
        }
    }, 100);
}

// ===== SCROLL SUAVE (LENIS) ===== //
function initSmoothScrolling() {
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            smooth: true
        });
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }
}

// ===== NAVEGACIÓN ===== //
function initNavigation() {
    const nav = document.querySelector('[data-nav]');
    if (!nav) return;
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScrollY = currentScrollY;
    });
}

// ===== MENU MÓVIL ===== //
function initMobileMenu() {
    const mobileToggle = document.querySelector('[data-mobile-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    if (!mobileToggle || !mobileMenu) return;
    
    mobileToggle.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('opacity-100');
        if (!isOpen) {
            mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
            mobileMenu.classList.add('opacity-100', 'pointer-events-auto');
        } else {
            mobileMenu.classList.add('opacity-0', 'pointer-events-none');
            mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
        }
    });
}

// ===== EFECTOS Y ANIMACIONES ===== //
function initAnimations() {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    
    // Solo animar si el elemento existe
    if (document.querySelector('.brand-text')) {
        gsap.from('.brand-text', { duration: 1.5, y: 100, opacity: 0, ease: 'power3.out' });
    }
}

function initTypingEffect() {
    const typingElements = document.querySelectorAll('.typing-text');
    typingElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setTimeout(typeWriter, 500);
                observer.unobserve(element);
            }
        });
        observer.observe(element);
    });
}

function initScrollEffects() {
    const revealElements = document.querySelectorAll('.brand-card, .brand-feature-card');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        revealObserver.observe(el);
    });
}

function initInteractiveEffects() {
    document.querySelectorAll('.brand-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

window.addEventListener('resize', debounce(() => {
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
}, 250));

async function initSteamAuth() {
    try {
        const res = await fetch('/api/user');
        const data = await res.json();
        
        const loginBtn = document.getElementById('auth-btn-desktop');
        const loginText = document.getElementById('auth-text-desktop');
        const adminLink = document.getElementById('nav-admin-desktop');
        
        if (data.authenticated) {
            console.log("👤 Usuario autenticado:", data.user.username);
            
            // Actualizar botón de login a perfil/logout
            if (loginBtn) {
                loginBtn.href = '/logout';
                loginBtn.classList.remove('bg-[#131826]', 'border-[#BF1F3C]');
                loginBtn.classList.add('bg-brand-gold/10', 'border-brand-gold/20');
                
                if (loginText) {
                    loginText.innerHTML = `
                        <img src="${data.user.avatar || 'assets/default_avatar.png'}" class="w-5 h-5 rounded-full border border-brand-gold/50">
                        <span>${data.user.username.toUpperCase()}</span>
                    `;
                }
                
                // Tooltip de cerrar sesión
                loginBtn.title = "Cerrar Sesión";
            }
            
            // Mostrar link de admin si es administrador
            if (data.user.isAdmin && adminLink) {
                adminLink.classList.remove('hidden');
            }
            
            // Si estamos en la página de perfil, cargar sus datos
            if (window.location.hash === '#profile') loadUserProfile();
            
        } else {
            if (adminLink) adminLink.classList.add('hidden');
        }
    } catch (e) {
        console.warn("⚠️ Error al verificar sesión de Steam:", e);
    }
}
function initEasterEggs() { /* Secondary feature */ }
function optimizePerformance() { /* Secondary feature */ }
function initCounters() { /* Handled by intersection observer if needed */ }

// ==========================================
// ====== SPA & ECOMMERCE LOGIC ======
// ==========================================

const pages = {
    'home': document.getElementById('page-home'),
    'store': document.getElementById('page-store'),
    'coins': document.getElementById('page-coins'),
    'autos': document.getElementById('page-autos'),
    'rules': document.getElementById('page-rules'),
    'status': document.getElementById('page-status'),
    'admin': document.getElementById('page-admin'),
    'profile': document.getElementById('page-profile')
};

function navigateTo(pageId) {
    if (!pages[pageId]) return;
    Object.values(pages).forEach(page => { if(page) page.classList.add('hidden'); });
    pages[pageId].classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Close mobile menu if open
    const mobileMenu = document.querySelector('[data-mobile-menu]');
    if (mobileMenu) {
        mobileMenu.classList.add('opacity-0', 'pointer-events-none');
        mobileMenu.classList.remove('opacity-100', 'pointer-events-auto');
    }

    if (pageId === 'home') loadHomeVIPs();
    if (pageId === 'store') loadStore();
    if (pageId === 'coins') loadCoins();
    if (pageId === 'autos') loadAutos();
    if (pageId === 'status') loadServerStatus();
    if (pageId === 'admin') loadAdminPanel();
}

// Configurar enlaces SPA
document.querySelectorAll('.spa-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const id = href.replace('#', '');
            navigateTo(id);
            history.pushState(null, '', href);
        }
    });
});

window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '') || 'home';
    navigateTo(hash);
});

// --- CARRITO LOGIC ---
let cart = JSON.parse(localStorage.getItem('glrp_cart')) || [];

window.toggleCart = function() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar.classList.contains('translate-x-full')) {
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        renderCart();
    } else {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    }
}

window.addToCart = function(productStr) {
    const product = typeof productStr === 'string' ? JSON.parse(decodeURIComponent(productStr)) : productStr;
    cart.push(product);
    localStorage.setItem('glrp_cart', JSON.stringify(cart));
    updateCartCount();
    
    const btn = event.currentTarget;
    const ogText = btn.innerHTML;
    btn.innerHTML = '<i class="ri-check-line"></i> AÑADIDO';
    setTimeout(() => { btn.innerHTML = ogText; }, 2000);
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem('glrp_cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function updateCartCount() {
    const counters = document.querySelectorAll('#cart-counter, #cart-counter-mobile');
    counters.forEach(c => { if(c) c.innerText = cart.length; });
}
updateCartCount();

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (cart.length === 0) {
        container.innerHTML = '<div class="text-center text-brand-text-muted mt-10">Tu carrito está vacío.</div>';
        totalEl.innerText = '$0.00';
        return;
    }
    let html = '';
    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        html += `
            <div class="flex items-center gap-4 bg-white/5 p-3 rounded-lg border border-white/5 shadow-sm">
                <img src="${item.image || item.img}" class="w-16 h-16 object-cover rounded border border-brand-gold/20">
                <div class="flex-1">
                    <h4 class="font-bold text-white text-sm">${item.name}</h4>
                    <span class="text-brand-gold font-orbitron font-bold">$${item.price.toFixed(2)}</span>
                </div>
                <button onclick="removeFromCart(${index})" class="text-brand-text-muted hover:text-red-500 transition-colors">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>`;
    });
    container.innerHTML = html;
    totalEl.innerText = '$' + total.toFixed(2);
}

// --- PAYPAL & CHECKOUT ---
let paypalSdkLoaded = false;
async function initCheckoutConfig() {
    try {
        const res = await fetch('/api/config');
        const config = await res.json();
        if(config.settings) applyWebSettings(config.settings);
        loadPaypalSdk(config.paypalClientId);
    } catch (e) { console.error("Error Checkout Config:", e); }
}
initCheckoutConfig();

function loadPaypalSdk(clientId) {
    if (paypalSdkLoaded) return;
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.onload = () => { paypalSdkLoaded = true; };
    document.head.appendChild(script);
}

window.openCheckout = async function() {
    if (cart.length === 0) return alert("El carrito está vacío.");
    const modal = document.getElementById('checkout-modal');
    if(!modal) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    renderCheckoutSummary();

    // Elements for UI
    const authLoading = document.getElementById('auth-loading');
    const authLogin = document.getElementById('auth-check-login');
    const authUser = document.getElementById('auth-user-id');
    const paypalContainer = document.getElementById('paypal-button-container');

    // Reset UI
    authLoading.classList.remove('hidden');
    authLogin.classList.add('hidden');
    authUser.classList.add('hidden');
    paypalContainer.innerHTML = '';
    
    try {
        const res = await fetch('/api/user');
        const data = await res.json();

        authLoading.classList.add('hidden');

        if (!data.authenticated) {
            authLogin.classList.remove('hidden');
            paypalContainer.innerHTML = '<p class="text-center text-xs text-brand-text/30 italic py-4 border border-dashed border-white/10 rounded-xl">Identifícate con Steam para activar el pago.</p>';
        } else {
            authUser.classList.remove('hidden');
            document.getElementById('checkout-user-name').innerText = data.user.username;
            document.getElementById('checkout-user-avatar').src = data.user.avatar || 'assets/default_avatar.png';
            
            // Fetch FiveM Identifiers
            document.getElementById('checkout-user-status').innerText = 'Detectando Licencia...';
            document.getElementById('checkout-user-status').className = 'text-[10px] text-brand-amber uppercase tracking-widest font-bold';
            
            const idRes = await fetch('/api/user/identifiers');
            const idData = await idRes.json();
            
            if (idData.found) {
                document.getElementById('checkout-user-status').innerText = 'Conectado al Servidor';
                document.getElementById('checkout-user-status').className = 'text-[10px] text-green-500 uppercase tracking-widest font-bold';
                document.getElementById('checkout-user-license').innerText = idData.license || 'N/A';
            } else {
                document.getElementById('checkout-user-status').innerText = 'No Conectado (Steam Only)';
                document.getElementById('checkout-user-status').className = 'text-[10px] text-yellow-500 uppercase tracking-widest font-bold';
                document.getElementById('checkout-user-license').innerText = 'No detectada';
            }
            
            // Convert Steam ID to Hex for internal reference
            const steamHex = data.user.steamId ? 'steam:' + BigInt(data.user.steamId).toString(16) : 'N/A';
            document.getElementById('checkout-user-steam').innerText = steamHex;

            // Store user for handlePaymentSuccess
            window.lastAuthUser = { ...data.user, license: idData.license, steamHex: steamHex };
            
            // Show PayPal Buttons
            initPaypalButtons();
        }
    } catch (e) {
        console.error("Error Auth Checkout:", e);
        authLoading.classList.add('hidden');
        authLogin.classList.remove('hidden');
    }
}

window.closeCheckout = function() {
    const modal = document.getElementById('checkout-modal');
    if(modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function renderCheckoutSummary() {
    const list = document.getElementById('checkout-items-list');
    const totalEl = document.getElementById('checkout-final-total');
    let total = 0;
    list.innerHTML = cart.map(item => {
        total += item.price;
        return `<div class="flex justify-between text-sm text-white"><span>${item.name}</span><span>$${item.price}</span></div>`;
    }).join('');
    totalEl.innerText = '$' + total.toFixed(2);
}

function initPaypalButtons() {
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = '';
    if (!paypalSdkLoaded) { container.innerHTML = 'Cargando PayPal...'; return; }
    paypal.Buttons({
        createOrder: (data, actions) => {
            const total = cart.reduce((acc, i) => acc + i.price, 0);
            return actions.order.create({ purchase_units: [{ amount: { value: total.toFixed(2) } }] });
        },
        onApprove: (data, actions) => actions.order.capture().then(details => handlePaymentSuccess(details))
    }).render('#paypal-button-container');
}

async function handlePaymentSuccess(details) {
    alert("¡Pago realizado con éxito!");
    
    // Preparar datos con identificadores
    const orderData = { 
        transactionId: details.id, 
        items: cart, 
        total: cart.reduce((acc, i) => acc + i.price, 0),
        user: {
            name: window.lastAuthUser?.username || details.payer?.name?.given_name || 'Anónimo',
            steamId: window.lastAuthUser?.steamId || 'N/A',
            steamHex: window.lastAuthUser?.steamHex || 'N/A',
            license: window.lastAuthUser?.license || 'N/A'
        }
    };

    try { 
        await fetch('/api/checkout', { 
            method: 'POST', 
            body: JSON.stringify(orderData), 
            headers: {'Content-Type': 'application/json'} 
        }); 
    } catch(e) {
        console.error("Error al registrar el pedido:", e);
    }

    cart = []; 
    localStorage.removeItem('glrp_cart'); 
    updateCartCount();
    window.location.reload();
}

// --- DATA FETCHING ---
async function loadStore() {
    try {
        const res = await fetch('/api/store/products');
        const products = await res.json();
        const grid = document.getElementById('store-grid');
        if(!grid) return;
        grid.innerHTML = products.map(p => `
            <div class="brand-card bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col">
                <img src="${p.image}" class="w-full h-40 object-cover rounded-xl mb-4">
                <h3 class="text-xl font-bold text-white mb-2">${p.name}</h3>
                <div class="mt-auto flex justify-between items-center">
                    <span class="text-2xl font-orbitron font-bold text-brand-gold">$${p.price}</span>
                    <button onclick="addToCart('${encodeURIComponent(JSON.stringify(p))}')" class="brand-button px-4 py-2 bg-brand-gradient rounded text-brand-dark font-bold">COMPRAR</button>
                </div>
            </div>`).join('');
    } catch(e) {}
}

async function loadAutos() {
    try {
        const res = await fetch('/api/store/autos');
        const autos = await res.json();
        window.allAutos = autos; // Guardar para filtrado
        renderAutosGrid(autos);
    } catch(e) {}
}

window.filterAutos = function(category) {
    if (!window.allAutos) return;
    const filtered = category === 'Todos' 
        ? window.allAutos 
        : window.allAutos.filter(a => a.type === category || a.category === category);
    renderAutosGrid(filtered);
}

function renderAutosGrid(autos) {
    const grid = document.getElementById('autos-grid');
    if(!grid) return;
    grid.innerHTML = autos.map(a => `<div class="brand-card p-4 bg-white/5 rounded-2xl border border-white/5"><img src="${a.img}" class="w-full h-32 object-contain mb-2"><h4 class="text-white font-bold">${a.name}</h4><div class="flex justify-between items-center mt-2"><span class="text-brand-gold font-bold">$${a.price}</span><button onclick="addToCart('${encodeURIComponent(JSON.stringify(a))}')" class="text-xs bg-brand-gold text-black px-2 py-1 rounded">AÑADIR</button></div></div>`).join('');
}

async function loadHomeVIPs() {
    try {
        const res = await fetch('/api/store/products');
        const products = await res.json();
        const container = document.getElementById('home-featured-vips-container');
        if(!container) return;
        // Mostrar solo los 3 primeros como destacados
        container.innerHTML = products.slice(0, 3).map(p => `
            <div class="brand-card bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col items-center text-center group hover:border-brand-gold/50 transition-all">
                <img src="${p.image}" class="w-24 h-24 object-cover rounded-2xl mb-6 shadow-2xl group-hover:scale-110 transition-transform">
                <h3 class="text-2xl font-bold text-white mb-2">${p.name}</h3>
                <p class="text-brand-text/60 text-sm mb-6">${p.desc || 'Ventajas exclusivas para ciudadanos premium.'}</p>
                <div class="mt-auto">
                    <span class="block text-3xl font-orbitron font-black text-brand-gold mb-6">$${p.price}</span>
                    <button onclick="addToCart('${encodeURIComponent(JSON.stringify(p))}')" class="px-8 py-3 bg-brand-gradient rounded-xl font-black text-brand-dark hover:shadow-glow transition-all">ADQUIRIR YA</button>
                </div>
            </div>`).join('');
    } catch(e) {}
}

async function loadServerStatus() {
    try {
        const res = await fetch('/api/server/status');
        const data = await res.json();
        
        const statusEl = document.getElementById('live-server-status');
        const playersEl = document.getElementById('live-server-players');
        const pingEl = document.getElementById('live-server-ping');

        if(statusEl) {
            statusEl.innerText = data.online ? 'EN LÍNEA' : 'DESCONECTADO';
            statusEl.classList.remove('text-white', 'text-red-500', 'text-green-500');
            statusEl.classList.add(data.online ? 'text-green-500' : 'text-red-500');
        }

        if(playersEl) {
            playersEl.innerText = data.online ? `${data.clients} / ${data.maxClients}` : '0 / 0';
        }

        if(pingEl) {
            pingEl.innerText = data.online ? `${data.ping} ms` : '-- ms';
        }
    } catch(e) {
        console.error("Error loading server status:", e);
    }
}

// Auto-update status every 15 seconds if on status page
setInterval(() => {
    if (window.location.hash === '#status') {
        loadServerStatus();
    }
}, 15000);

async function loadCoins() {
    try {
        const res = await fetch('/api/store/coins');
        const coins = await res.json();
        const grid = document.getElementById('coins-grid');
        if(!grid) return;
        grid.innerHTML = coins.map(c => `<div class="brand-card p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center"><img src="${c.image}" class="w-20 mb-4"><h3 class="text-white font-bold">${c.name}</h3><span class="text-brand-gold font-bold text-xl mb-4">$${c.price}</span><button onclick="addToCart('${encodeURIComponent(JSON.stringify(c))}')" class="brand-button w-full bg-brand-gradient py-2 rounded font-bold text-brand-dark">AÑADIR</button></div>`).join('');
    } catch(e) {}
}

// --- PERFIL ---
async function loadUserProfile() {
    try {
        const res = await fetch('/api/user/orders');
        const data = await res.json();
        const container = document.getElementById('profile-orders-container');
        if(container && data.success) {
            container.innerHTML = data.orders.map(o => `<div class="bg-white/5 p-4 rounded-xl mb-2 flex justify-between"><span>Pedido #${o.id.slice(-6)}</span><span class="font-bold text-brand-gold">$${o.total}</span></div>`).join('');
        }
    } catch(e) {}
}

// ==========================================
// ====== ADMIN DASHBOARD (PROFESSIONAL) ======
// ==========================================

async function loadAdminPanel() {
    try {
        const [oRes, pRes, aRes, cRes] = await Promise.all([
            fetch('/api/admin/orders'), fetch('/api/store/products'),
            fetch('/api/store/autos'), fetch('/api/store/coins')
        ]);
        
        // Manejar respuesta 403 (No Administrador) sin mostrar error rojo
        if (oRes.status === 403) {
            console.warn("🔐 Acceso denegado al panel administrativo. Inicia sesión con SteamID de Administrador.");
            return;
        }

        const orders = (await oRes.json()).orders || [];
        const products = await pRes.json();
        const autos = await aRes.json();
        const coins = await cRes.json();

        renderAdminDashboard(orders);
        renderAdminOrders(orders);
        renderAdminProducts(products);
        renderAdminAutos(autos);
        renderAdminCoins(coins);
    } catch(e) { 
        // Silenciar errores de conexión
    }
}

function renderAdminDashboard(orders) {
    const totalRev = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const revEl = document.getElementById('dash-stat-revenue');
    const ordEl = document.getElementById('dash-stat-orders');
    if(revEl) revEl.innerText = `$${totalRev.toFixed(2)}`;
    if(ordEl) ordEl.innerText = orders.length;

    const recent = document.getElementById('dash-recent-orders');
    if(recent) {
        recent.innerHTML = orders.slice(0, 5).map(o => `
            <div class="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5 hover:border-brand-gold/20 transition-all">
                <div class="text-sm font-bold text-white">${o.user?.name || 'Cliente'}</div>
                <div class="text-sm font-bold text-brand-gold">$${parseFloat(o.total).toFixed(2)}</div>
            </div>`).join('') || '<div class="text-center py-4 text-white/50 italic text-sm">No hay pedidos recientes.</div>';
    }
}

function renderAdminOrders(orders) {
    const table = document.getElementById('admin-orders-table');
    if(!table) return;
    table.innerHTML = orders.map(o => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="py-4 px-4 text-xs font-bold text-white uppercase">#${o.id.slice(-6)}</td>
            <td class="py-4 px-4 text-xs text-white">${o.user?.name || '---'}</td>
            <td class="py-4 px-4 text-xs text-brand-gold font-bold">$${parseFloat(o.total).toFixed(2)}</td>
            <td class="py-4 px-4 text-right"><span class="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20 uppercase">Pagado</span></td>
        </tr>`).join('') || '<tr><td colspan="4" class="text-center py-10 text-white/50">No hay ventas registradas.</td></tr>';
}

function renderAdminProducts(products) {
    const table = document.getElementById('admin-products-table');
    if(!table) return;
    table.innerHTML = products.map(p => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="py-4 px-4"><img src="${p.image}" class="w-8 h-8 rounded object-cover"></td>
            <td class="py-4 px-4 text-sm font-bold text-white">${p.name}</td>
            <td class="py-4 px-4 text-sm text-brand-gold">$${p.price}</td>
            <td class="py-4 px-4 text-right">
                <button onclick='editAdminItem("product", ${JSON.stringify(p).replace(/"/g, '&quot;')})' class="text-brand-gold hover:text-white mr-2"><i class="ri-edit-line"></i></button>
                <button onclick="deleteAdminItem('product', '${p.id}')" class="text-red-500 hover:text-white"><i class="ri-delete-bin-line"></i></button>
            </td>
        </tr>`).join('');
}

function renderAdminAutos(autos) {
    const table = document.getElementById('admin-autos-table');
    if(!table) return;
    table.innerHTML = autos.map(a => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="py-4 px-4"><img src="${a.img}" class="w-10 h-6 object-contain"></td>
            <td class="py-4 px-4 text-sm font-bold text-white">${a.name}</td>
            <td class="py-4 px-4 text-sm text-brand-gold">$${a.price}</td>
            <td class="py-4 px-4 text-right">
                <button onclick='editAdminItem("auto", ${JSON.stringify(a).replace(/"/g, '&quot;')})' class="text-brand-gold hover:text-white mr-2"><i class="ri-edit-line"></i></button>
                <button onclick="deleteAdminItem('auto', '${a.id}')" class="text-red-500 hover:text-white"><i class="ri-delete-bin-line"></i></button>
            </td>
        </tr>`).join('');
}

function renderAdminCoins(coins) {
    const table = document.getElementById('admin-coins-table');
    if(!table) return;
    table.innerHTML = coins.map(c => `
        <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td class="py-4 px-4 text-sm font-bold text-white">${c.name}</td>
            <td class="py-4 px-4 text-sm text-brand-gold">${c.price}</td>
            <td class="py-4 px-4 text-right">
                <button onclick="deleteAdminItem('coin', '${c.id}')" class="text-red-500 hover:text-white"><i class="ri-delete-bin-line"></i></button>
            </td>
        </tr>`).join('');
}

// --- CMS & UTILS ---
function applyWebSettings(s) {
    if(!s) return;
    const t = document.getElementById('ui-hero-title');
    const st = document.getElementById('ui-hero-subtitle');
    if(t && s.heroTitle) t.innerText = s.heroTitle;
    if(st && s.heroSubtitle) st.innerText = s.heroSubtitle;
    
    // Sincronizar inputs del admin si existen
    const inputTitle = document.getElementById('config-hero-title');
    const inputSubtitle = document.getElementById('config-hero-subtitle');
    const inputDiscord = document.getElementById('config-discord-url');
    const inputVideo = document.getElementById('config-hero-video');
    
    if(inputTitle) inputTitle.value = s.heroTitle || '';
    if(inputSubtitle) inputSubtitle.value = s.heroSubtitle || '';
    if(inputDiscord) inputDiscord.value = s.discordUrl || '';
    if(inputVideo) inputVideo.value = s.heroVideo || '';

    const v = document.getElementById('hero-bg-video');
    if(v && s.heroVideo) {
        const src = v.querySelector('source');
        if(src && src.src !== s.heroVideo) { src.src = s.heroVideo; v.load(); }
    }
}

function switchAdminTab(t) {
    const tabs = ['dashboard', 'orders', 'products', 'autos', 'coins', 'config'];
    tabs.forEach(tab => {
        const el = document.getElementById(`admin-tab-${tab}`);
        // Soporte para ambos formatos de ID de botón (side-btn y btn-admin-tab)
        const btn = document.getElementById(`btn-admin-tab-${tab}`) || document.getElementById(`side-btn-admin-${tab}`);
        if(el) el.classList.add('hidden');
        if(btn) { 
            btn.classList.remove('bg-brand-gold/10', 'text-brand-gold', 'active'); 
            btn.classList.add('text-white/50'); 
        }
    });
    const activeEl = document.getElementById(`admin-tab-${t}`);
    const activeBtn = document.getElementById(`btn-admin-tab-${t}`) || document.getElementById(`side-btn-admin-${t}`);
    if(activeEl) activeEl.classList.remove('hidden');
    if(activeBtn) { 
        activeBtn.classList.remove('text-white/50'); 
        activeBtn.classList.add('bg-brand-gold/10', 'text-brand-gold', 'active'); 
    }
}

async function saveWebSettings() {
    const s = {
        heroTitle: document.getElementById('config-hero-title').value,
        heroSubtitle: document.getElementById('config-hero-subtitle').value,
        discordUrl: document.getElementById('config-discord-url').value,
        heroVideo: document.getElementById('config-hero-video').value
    };
    try {
        const res = await fetch('/api/admin/config', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(s) });
        if((await res.json()).success) alert("✅ Configuración guardada.");
    } catch(e) {}
}

// --- MODALES ADMIN ---
function openAdminModal(ctx) {
    document.getElementById('admin-form').reset();
    document.getElementById('admin-input-context').value = ctx;
    document.getElementById('admin-modal').classList.remove('hidden');
    document.getElementById('admin-modal').classList.add('flex');
}
function closeAdminModal() { document.getElementById('admin-modal').classList.add('hidden'); }

function editAdminItem(ctx, item) {
    openAdminModal(ctx);
    document.getElementById('admin-input-id').value = item.id;
    document.getElementById('admin-input-name').value = item.name;
    document.getElementById('admin-input-price').value = item.price;
    document.getElementById('admin-input-image').value = item.image || item.img || '';
    document.getElementById('admin-input-desc').value = item.desc || '';
}

async function submitAdminForm() {
    const ctx = document.getElementById('admin-input-context').value;
    const body = {
        id: document.getElementById('admin-input-id').value,
        name: document.getElementById('admin-input-name').value,
        price: parseFloat(document.getElementById('admin-input-price').value),
        image: document.getElementById('admin-input-image').value,
        desc: document.getElementById('admin-input-desc').value
    };
    const ep = ctx === 'product' ? '/api/admin/products' : (ctx === 'auto' ? '/api/admin/autos' : '/api/admin/coins');
    try {
        const res = await fetch(ep, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body) });
        if(res.ok) { closeAdminModal(); loadAdminPanel(); }
    } catch(e) {}
}

async function deleteAdminItem(ctx, id) {
    if(!confirm("¿Borrar?")) return;
    const ep = ctx === 'product' ? `/api/admin/products/${id}` : (ctx === 'auto' ? `/api/admin/autos/${id}` : `/api/admin/coins/${id}`);
    try { if((await fetch(ep, { method: 'DELETE' })).ok) loadAdminPanel(); } catch(e) {}
}
