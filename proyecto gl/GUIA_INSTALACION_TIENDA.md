# 🛠️ GUÍA DE INSTALACIÓN: INTEGRACIÓN TIENDA (gl_store_api)

Esta es la guía paso a paso para instalar el script de sincronización en tu servidor de FiveM. Este script permite que cuando alguien compre en tu web, los ítems (Coins, Autos, VIP) se entreguen automáticamente en el juego.

---

## 📋 1. Requisitos Previos
*   Tener el framework **QBCore** (es el configurado por defecto).
*   Tener el recurso **oxmysql** para entregas offline.
*   Acceso a la carpeta `resources` de tu servidor FiveM.

---

## 🚀 2. Pasos de Instalación

### Paso 1: Mover la carpeta
Copia la carpeta `gl_store_api` que está en este proyecto y pégala dentro de la carpeta `resources` de tu servidor de FiveM.

### Paso 2: Configurar la API Key (CRÍTICO)
1.  Abre el archivo `gl_store_api/shared/config.lua`.
2.  Busca la línea: `Config.ApiKey = "GL_RP_Secure_Key_8492_XyZ!"`.
3.  Asegúrate de que esa clave sea la **MISMA** que tienes en el archivo `.env` de tu carpeta web (`FIVEM_API_KEY`). Si no coinciden, la web no podrá enviarle los pedidos al servidor.

### Paso 3: Configurar Monedas (Solo QBCore)
Si vas a vender **Coins**, debes registrar el tipo de moneda en tu base:
1.  Ve a `resources/[qb]/qb-core/shared/main.lua`.
2.  Busca `QBConfig.Money.MoneyTypes`.
3.  Añade `'coins' = 0` (o el nombre que prefieras, pero debe coincidir con `Config.CurrencyName` en el script).

### Paso 4: Activar el script
Añade la siguiente línea a tu archivo `server.cfg`:
```cfg
ensure gl_store_api
```

---

## 🌐 3. Sincronización con la Web

Para que la web sepa a dónde enviar los datos, en el panel de administración de la web o en el código del servidor web (`server.js`), la URL de destino debe ser:
`http://TU_IP_SERVIDOR:30120/gl_store_api/redeem`

*   **Nota:** Si tu servidor tiene firewall, asegúrate de que el puerto `30120` (o el que uses para FiveM) permita peticiones POST.

---

## 🧪 4. Cómo Probar la Instalación

Una vez que el script esté encendido (`ensure gl_store_api`), puedes probarlo de dos maneras:

1.  **Comando de Prueba (Consola o Juego):**
    Usa el comando `/testbuy [id_producto]` (si eres admin) para simular que alguien compró algo. Deberías ver un mensaje en la consola del servidor confirmando la recepción.

2.  **Desde la Web:**
    Realiza una compra de prueba en modo local. Si todo está bien configurado, verás en la consola de FiveM:
    `[Tienda Web] Nueva orden recibida: #XXXX`

---

## ⚠️ Solución de Problemas Comunes

*   **Error 401 (No autorizado):** Las API Keys no coinciden. Revisa el `config.lua` del script y el `.env` de la web.
*   **Error 404:** El nombre del recurso no es `gl_store_api` o no se ha iniciado correctamente.
*   **No entrega el auto:** Revisa que el ID del auto en la web coincida con el nombre del modelo (spawn name) en tu servidor.

---
*Si tienes dudas técnicas sobre la base de datos, revisa la lógica en `server/main.lua`.*
