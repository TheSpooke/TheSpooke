# Guía rápida para pruebas desde el navegador (in Spanish)

Resumen:
- Este conjunto de archivos contiene una plantilla de autorización (`PERMISSION.txt`) y dos páginas de prueba (`test_files/csrf_test.html`, `test_files/xss_test.html`) para ejecutar pruebas manuales desde el navegador.

Pasos recomendados antes de empezar:
1. Asegúrate de tener autorización por escrito (usa `PERMISSION.txt` y consigue la firma del propietario).
2. Trabaja en un entorno de prueba o con permiso explícito.

Preparación del navegador y proxy (Burp/OWASP ZAP):
- Instala Burp Suite Community o OWASP ZAP.
- Configura el proxy en `127.0.0.1:8080` (o el puerto que uses).
- En Windows/Chrome, puedes usar la extensión `FoxyProxy` o cambiar el proxy del sistema.

Importar certificado CA de Burp (HTTPS intercept):
1. Abre Burp -> Proxy -> Options -> Export CA certificate (DER).
2. En Windows: abre "Manage user certificates" -> Trusted Root Certification Authorities -> Import el .der exportado.
3. Reinicia el navegador para evitar errores TLS.

Comandos / ejemplos útiles (PowerShell):
 - Abrir Firefox/Chrome desde PowerShell (opcional):
```powershell
Start-Process "C:\Program Files\Mozilla Firefox\firefox.exe"
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe"
```

Pruebas manuales rápidas (desde DevTools o con los archivos en `test_files`):
- XSS:
  - Usa `test_files/xss_test.html`, introduce `https://target/search?q=` y pulsa "Abrir con payload".
  - Prueba payloads simples: `<script>alert(1)</script>`, `"><img src=x onerror=alert(1)>` (usa encodeURI/encodeURIComponent en la URL).
- CSRF:
  - Edita `test_files/csrf_test.html` reemplazando `ACTION_URL` por la acción POST objetivo.
  - Abre el HTML desde un origen distinto (por ejemplo, abre el archivo local) y observa si la petición se ejecuta sin token anti-CSRF.
- CORS:
  - En la consola de otra web, prueba:
```javascript
fetch('https://target/api/data', {method:'GET', credentials:'include'})
  .then(r=>r.text()).then(console.log).catch(console.error);
```
  - Observa la presencia de `Access-Control-Allow-Origin` en la respuesta.
- Cookies:
  - Revisa en DevTools -> Application -> Cookies si `HttpOnly`, `Secure`, `SameSite` están bien configurados.

Recomendaciones al documentar hallazgos:
- Guarda capturas de pantalla y copia exacta de la petición/respuesta (headers y body).
- Anota pasos para reproducir, impacto, y una recomendación de mitigación simple.

Siguientes pasos que puedo hacer por ti ahora:
 - A) Ayudarte a configurar Burp/ZAP en Windows y el navegador (guiado paso a paso).
 - B) Ejecutar ejemplos de payloads guiados y revisar las respuestas (si pegas request/response).
 - C) Crear más plantillas (IDOR brute-force, upload test) y scripts automatizados ligeros.

Indica qué opción prefieres y procedo con los pasos prácticos.

-- Scripts añadidos --
- `scripts/recon_target.ps1`: Recon no intrusivo (robots, sitemap, HEAD/GET root, archivos comunes) y guarda salida en `scripts_output`.
- `scripts/check_headers_and_cookies.ps1`: Comprueba cabeceras de seguridad y muestra cookies.
- `scripts/git_enum.ps1`: Comprueba exposición de `.git` y guarda archivos encontrados (solo lectura).
- `scripts/check_cdn_bootstrap.ps1`: (ya presente) descarga el recurso CDN y calcula SRI.

-- Payloads y plantillas --
- `payloads/xss_payloads.txt`: lista de payloads de XSS y guía breve.
- `payloads/csrf_examples.html`: plantillas para probar CSRF (auto-submit).

-- Cómo ejecutar los scripts (PowerShell) --
Abrir PowerShell en la carpeta del proyecto y ejecutar:
```powershell
cd 'c:\Users\olaaa\Desktop\Optimizador'
.\scripts\recon_target.ps1 -Target 'https://unbrave-squally-china.ngrok-free.dev' -OutDir '.\\scripts_output'
.\scripts\check_headers_and_cookies.ps1 -Target 'https://unbrave-squally-china.ngrok-free.dev'
.\scripts\git_enum.ps1 -Target 'https://unbrave-squally-china.ngrok-free.dev' -OutDir '.\\scripts_output'
.\scripts\check_cdn_bootstrap.ps1 -Url 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'
```

Guarda la salida (archivos en `scripts_output`) y pégala aquí para que la analice. No ejecutes comandos que modifiquen el objetivo.
