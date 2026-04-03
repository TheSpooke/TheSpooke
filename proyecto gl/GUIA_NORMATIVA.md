# 📖 GUÍA COMPLETA Y NORMATIVA | Global Life RP

Bienvenido a la guía oficial de **Global Life Roleplay**. Este documento contiene los conceptos fundamentales para jugar en el servidor, las reglas de convivencia y una guía técnica para los sistemas que hemos implementado.

---

## 🌎 1. CONCEPTOS GENERALES DE ROLEPLAY

### 🗣️ Interpretación Básica
*   **IC (In Character):** Todo lo que vive y experimenta tu personaje dentro del juego. Sus conocimientos, habilidades y relaciones.
*   **OOC (Out Of Character):** Todo lo que ocurre fuera de la interpretación (tú como jugador). **Regla de oro:** No mezclar IC con OOC.
*   **RDINT (Rol de Interacción):** La base del juego. Toda acción debe tener una justificación lógica y una interacción realista entre personajes.

### 🚫 Infracciones Comunes
*   **MG (Metagaming):** Usar información obtenida fuera del juego (ej: Discord, streams) para beneficio de tu personaje.
*   **PG (Powergaming):** Realizar acciones irreales o forzar situaciones que tu personaje no podría hacer físicamente (ej: conducir un deportivo por la montaña como si nada).
*   **DM (Deathmatch):** Agredir o matar a otros jugadores sin un motivo de rol previo o justificación de peso.
*   **VDM (Vehicle Deathmatch):** Usar un vehículo como arma para atropellar a otros sin sentido.

### 💀 Muerte y Memoria
*   **PK (Player Kill):** Muerte temporal. Pierdes la memoria de los últimos 15 minutos (no recuerdas quién te mató ni por qué).
*   **CK (Character Kill):** Muerte definitiva. La historia de tu personaje termina aquí. Debes crear uno nuevo con nombre y trasfondo diferente.
*   **RK (Revenge Kill):** Volver al lugar donde moriste para vengarte. **Está estrictamente prohibido.**

---

## 📜 2. NORMATIVA DE CONVIVENCIA

1.  **Valorar Vida:** Tu personaje debe actuar con miedo real ante amenazas de muerte. No eres un superhéroe.
2.  **Rol de Entorno (RDE):** Interpreta que la ciudad no está vacía. Hay cámaras, testigos invisibles y autoridades.
3.  **Fair Play:** El objetivo es que todos se diviertan. No busques siempre ganar (win-to-play), busca crear buenas historias.
4.  **Evasión de Rol:** No te desconectes ni fuerces fallos técnicos para evitar un arresto o un robo.
5.  **Respeto OOC:** Mantén siempre el respeto hacia otros jugadores y el staff fuera del personaje.

---

## 🛒 3. GUÍA TÉCNICA: TIENDA AUTOMÁTICA (GL Store API)

Hemos instalado un sistema de entregas automáticas para las compras realizadas en la web.

### 📂 Ubicación del Script
El script de integración se encuentra en la carpeta: `gl_store_api`.

### 🛠️ Configuración (Importante)
Para que el servidor reciba las compras, debes configurar el Token de sincronización en `shared/config.lua`:

```lua
Config.SecretToken = "TU_TOKEN_AQUÍ" -- Debe coincidir con el token del servidor web
Config.StoreURL = "http://tu-web.com/api/store/process"
```

### 📋 Comandos Disponibles (Solo Admin)
*   `testbuy [id_producto]`: Simula una compra para verificar que los items se entregan correctamente.
*   `reloadstore`: Recarga la configuración de la tienda sin reiniciar el servidor.

### 📦 Entrega de Items
El sistema está preparado para entregar:
*   **Coins:** Se suman directamente a la base de datos del jugador.
*   **Vehículos:** Se guardan en el garaje del jugador (requiere que el jugador esté online o el script lo buscará por su licencia).
*   **Ranks/VIP:** Asignación automática de grupos en el servidor.

---

## 🔗 4. ENLACES DE INTERÉS

*   **🌐 Sitio Web:** [http://localhost:3000](http://localhost:3000)
*   **✍️ GitBook Completo:** [https://globallife.gitbook.io/globallife-normativa](https://globallife.gitbook.io/globallife-normativa)
*   **🎮 Conexión FiveM:** `fivem://connect/cfx.re/join/ep8yop`
*   **💬 Discord:** [https://discord.gg/tu-servidor](https://discord.gg/tu-servidor)

---
*Última actualización: 28 de Marzo, 2026*
