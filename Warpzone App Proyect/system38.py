import io
import tkinter as tk
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
import threading
import time
import os
import requests

class AplicacionBloqueo:
    def __init__(self):
        self.ventana = tk.Tk()
        self.ventana.title("Aplicación de Bloqueo")
        self.ventana.geometry("400x700")
        self.ventana.protocol("WM_DELETE_WINDOW", lambda: None)  # Disable close button
        self.ventana.configure(bg="#3498db")
        self.alerta_mostrada_15 = self.alerta_mostrada_10 = self.alerta_mostrada_5 = False

        self.tiempo_restante = 0  # Mantener el tiempo restante
        self.bloqueo_iniciado = False
        self.temporizador_activo = False  # Para rastrear el hilo del temporizador actual
        self.ultima_duracion_recibida = 0  # Para rastrear la última duración recibida

        self.label_tiempo = tk.Label(
            self.ventana, text="", font=("Helvetica", 16), bg="#3498db", fg="white"
        )
        self.label_tiempo.pack(pady=20)

        # Precargar la imagen de fondo
        path_fondo = os.path.join(os.path.dirname(__file__), 'halo-warpzone.png')
        self.foto_fondo_pre_cargada = self.cargar_imagen_desde_archivo(path_fondo)

        # Descargar y mostrar el logo
        path_logo = os.path.join(os.path.dirname(__file__), 'logo.png')
        self.foto_logo = self.cargar_imagen_desde_archivo(path_logo, (150, 150))
        
        if self.foto_logo:
            label_logo = tk.Label(self.ventana, image=self.foto_logo, bg="#3498db")
            label_logo.pack(pady=(0, 30))  # Reducir el espacio vertical después del logo

        self.label_ingrese_clave = tk.Label(
            self.ventana, text="Ingrese la contraseña:", font=("Helvetica", 12), bg="#3498db", fg="white"
        )
        self.label_ingrese_clave.pack(pady=10)

        self.entrada_clave = tk.Entry(self.ventana, show="*", font=("Helvetica", 12))
        self.entrada_clave.pack(pady=10)

        self.boton_iniciar_bloqueo = tk.Button(
            self.ventana, text="Iniciar Bloqueo", command=self.iniciar_bloqueo, font=("Helvetica", 14)
        )
        self.boton_iniciar_bloqueo.pack(pady=20)

        opciones_tiempos = ["5 seconds", "10 seconds", "30 seconds", "1 minute", "5 minutes", "10 minutes",
                            "15 minutes","30 minutes", "1 hour", "2 hours", "3 hours", "4 hours", "5 hours", "6 hours", "7 hours", "8 hours", "9 hours", "10 hours"]
        self.menu_tiempos = ttk.Combobox(self.ventana, values=opciones_tiempos, state="readonly")
        self.menu_tiempos.pack(pady=10)

        self.boton_agregar_mas_tiempo = tk.Button(
            self.ventana, text="Agregar Más Tiempo", command=self.agregar_mas_tiempo, font=("Helvetica", 14), state=tk.DISABLED
        )
        self.boton_agregar_mas_tiempo.pack(pady=10)

        self.contrasena_guardada = "ciber1234*"

        self.preparar_ventana_bloqueo()

        self.ventana_mensaje = None

        # Inicia la escucha de comandos del servidor en un hilo separado
        hilo_servidor = threading.Thread(target=self.escuchar_servidor)
        hilo_servidor.daemon = True  # Esto permite que el hilo se cierre cuando la aplicación principal se cierre
        hilo_servidor.start()

    def cargar_imagen_desde_archivo(self, path, size=None):
        try:
            imagen = Image.open(path)
            if size:
                imagen = imagen.resize(size, Image.Resampling.LANCZOS)
            return ImageTk.PhotoImage(imagen)
        except Exception as e:
            print(f"Error al cargar la imagen desde archivo: {e}")
            return None

    def agregar_mas_tiempo(self):
        if self.entrada_clave.get() != self.contrasena_guardada:
            messagebox.showerror("Error", "Contraseña incorrecta.")
            return
        
        if self.bloqueo_iniciado:
            tiempo_extra_str = self.menu_tiempos.get()
            tiempo_extra = self.convertir_a_segundos(tiempo_extra_str)
            if tiempo_extra > 0:
                self.actualizar_tiempo_restante(tiempo_extra)
                messagebox.showinfo("Tiempo Añadido", f"Agregados {tiempo_extra} segundos adicionales.")
        else:
            messagebox.showwarning("Advertencia", "El bloqueo no ha sido iniciado.")

    def mostrar_mensaje_grande(self, mensaje):
        if self.ventana_mensaje is not None and self.ventana_mensaje.winfo_exists():
            self.ventana_mensaje.destroy()
        
        self.ventana_mensaje = tk.Toplevel(self.ventana)
        self.ventana_mensaje.attributes('-topmost', True)
        self.ventana_mensaje.attributes('-fullscreen', True)
        self.ventana_mensaje.overrideredirect(True)
        self.ventana_mensaje.attributes('-alpha', 0.7)
        self.ventana_mensaje.configure(bg='black')
        label_mensaje = tk.Label(self.ventana_mensaje, text=mensaje, font=("Helvetica", 36), bg='black', fg="white")
        label_mensaje.pack(expand=True, fill="both")
        
        self.ventana_mensaje.after(3000, self.cerrar_mensaje)

    def cerrar_mensaje(self):
        if self.ventana_mensaje is not None and self.ventana_mensaje.winfo_exists():
            self.ventana_mensaje.destroy()
            self.ventana_mensaje = None

    def preparar_ventana_bloqueo(self):
        self.ventana_bloqueo = tk.Toplevel(self.ventana)
        self.ventana_bloqueo.title("Bloqueo Total")

        pantalla_ancho = self.ventana.winfo_screenwidth()
        pantalla_alto = self.ventana.winfo_screenheight()
        self.ventana_bloqueo.geometry(f"{pantalla_ancho}x{pantalla_alto}+0+0")

        self.ventana_bloqueo.overrideredirect(True)
        self.ventana_bloqueo.attributes('-topmost', True)
        self.ventana_bloqueo.protocol("WM_DELETE_WINDOW", lambda: None)
        self.ventana_bloqueo.bind("<Alt-Tab>", lambda event: "break")

        path_fondo = os.path.join(os.path.dirname(__file__), 'halo-warpzone.png')
        foto_fondo = self.cargar_imagen_desde_archivo(path_fondo, (pantalla_ancho, pantalla_alto))
        
        if foto_fondo:
            label_fondo = tk.Label(self.ventana_bloqueo, image=foto_fondo)
            label_fondo.place(x=0, y=0, relwidth=1, relheight=1)
            label_fondo.image = foto_fondo

        contenedor = tk.Frame(self.ventana_bloqueo, bg="#3498db")
        contenedor.place(relx=0.5, rely=0.5, anchor="center")

        path_logo = os.path.join(os.path.dirname(__file__), 'logo.png')
        foto_logo = self.cargar_imagen_desde_archivo(path_logo, (250, 250))
        
        if foto_logo:
            label_logo = tk.Label(contenedor, image=foto_logo, bg="#3498db")
            label_logo.image = foto_logo
            label_logo.pack(pady=(10, 10))

        mensaje = tk.Label(contenedor, text="Gracias por haber jugado en Warpzone, tu ciber en casa",
                           font=("Helvetica", 16), bg="#3498db", fg="white")
        mensaje.pack(pady=(10, 10))

        entrada_clave = tk.Entry(contenedor, show="*", font=("Helvetica", 16))
        entrada_clave.pack(pady=10)

        boton_desbloquear = tk.Button(contenedor, text="Desbloquear",
                                      command=lambda: self.verificar_contrasena_final(entrada_clave),
                                      font=("Helvetica", 16))
        boton_desbloquear.pack(pady=10)

        self.ventana_bloqueo.withdraw()

    def iniciar_bloqueo(self):
        if self.entrada_clave.get() != self.contrasena_guardada:
            messagebox.showerror("Error", "Contraseña incorrecta.")
            return

        tiempo_str = self.menu_tiempos.get()
        if tiempo_str == "":
            messagebox.showerror("Error", "Seleccione un tiempo válido.")
            return

        tiempo_ingresado = self.convertir_a_segundos(tiempo_str)
        if tiempo_ingresado > 0:
            self.bloqueo_iniciado = True
            self.actualizar_tiempo_restante(tiempo_ingresado)
            self.boton_agregar_mas_tiempo.config(state=tk.NORMAL)
            messagebox.showinfo("Bloqueo Iniciado", f"Bloqueo iniciado por {tiempo_ingresado} segundos.")
            self.crear_ventana_cuenta_regresiva()
            self.iniciar_temporizador()

    def crear_ventana_cuenta_regresiva(self):
        if not hasattr(self, 'ventana_cuenta_regresiva') or not self.ventana_cuenta_regresiva.winfo_exists():
            self.ventana_cuenta_regresiva = tk.Toplevel(self.ventana, bg='white')
            self.ventana_cuenta_regresiva.attributes('-transparentcolor', 'white')
            self.ventana_cuenta_regresiva.attributes('-topmost', True)
            self.ventana_cuenta_regresiva.overrideredirect(True)
            self.label_cuenta_regresiva = tk.Label(self.ventana_cuenta_regresiva, text="", font=("Helvetica", 20), bg='white', fg="yellow")
            self.label_cuenta_regresiva.pack(expand=True, fill="both")

    def iniciar_temporizador(self):
        if not self.temporizador_activo:  # Asegurarse de que no haya otro temporizador corriendo
            self.temporizador_activo = True
            threading.Thread(target=self.temporizador).start()

    def actualizar_tiempo_restante(self, duracion):
        self.tiempo_restante += duracion

    def temporizador(self):
        tiempo_inicial = time.time()

        while self.bloqueo_iniciado:
            tiempo_actual = time.time()
            tiempo_transcurrido = tiempo_actual - tiempo_inicial
            self.tiempo_restante -= tiempo_transcurrido
            tiempo_inicial = tiempo_actual

            if self.tiempo_restante <= 0:
                break

            horas = int(self.tiempo_restante // 3600)
            minutos = int((self.tiempo_restante % 3600) // 60)
            segundos = int(self.tiempo_restante % 60)

            tiempo_formateado = f"{horas} h, {minutos} m, {segundos} s"
            self.label_cuenta_regresiva.config(text=tiempo_formateado)
            self.ventana_cuenta_regresiva.update()

            if self.tiempo_restante <= 900 and not self.alerta_mostrada_15:
                self.mostrar_mensaje_grande("¡15 minutos restantes!")
                self.alerta_mostrada_15 = True
            elif self.tiempo_restante <= 600 and not self.alerta_mostrada_10:
                self.mostrar_mensaje_grande("¡10 minutos restantes!")
                self.alerta_mostrada_10 = True
            elif self.tiempo_restante <= 300 and not self.alerta_mostrada_5:
                self.mostrar_mensaje_grande("¡5 minutos restantes!")
                self.alerta_mostrada_5 = True

            time.sleep(1)

        self.temporizador_activo = False
        self.ventana.after(0, self.ventana_cuenta_regresiva.destroy)
        self.ventana.after(1, self.bloquear_pantalla)

    def bloquear_pantalla(self):
        self.ventana_bloqueo.deiconify()

    def verificar_contrasena_final(self, entrada_clave):
        if entrada_clave.get() == self.contrasena_guardada:
            self.bloqueo_iniciado = False
            self.ventana_bloqueo.withdraw()
            self.ventana.deiconify()
        else:
            messagebox.showerror("Error", "Contraseña incorrecta. Inténtelo de nuevo.")

    def escuchar_servidor(self):
        while True:
            try:
                response = requests.get(f'http://{SERVER_IP}:{SERVER_PORT}/controlpc/api/control_bloqueo/?pc_id={PC_ID}')
                if response.status_code == 200:
                    print("Respuesta completa del servidor:", response.json())  # Imprime la respuesta completa
                    data = response.json()
                    action = data.get('action')
                    duration = data.get('duration', 0)
                    print(f'Acción recibida: {action}, duración: {duration} segundos para PC ID: {PC_ID}')

                    if action == 'add_hours':
                        if duration != self.ultima_duracion_recibida:
                            self.ultima_duracion_recibida = duration
                            if not self.bloqueo_iniciado:
                                self.bloqueo_iniciado = True
                                self.actualizar_tiempo_restante(duration)
                                self.crear_ventana_cuenta_regresiva()
                                self.iniciar_temporizador()
                            else:
                                self.actualizar_tiempo_restante(duration - self.tiempo_restante)

                else:
                    print(f'Error: {response.status_code}, {response.text}')
            except requests.exceptions.RequestException as e:
                print(f'Error al comunicarse con el servidor: {e}')

            time.sleep(10)

    def convertir_a_segundos(self, tiempo_str):
        cantidad, unidad = tiempo_str.split()
        cantidad = int(cantidad)

        if unidad in ["second", "seconds"]:
            return cantidad
        elif unidad in ["minute", "minutes"]:
            return cantidad * 60
        elif unidad in ["hour", "hours"]:
            return cantidad * 3600
        else:
            return 0

if __name__ == "__main__":
    SERVER_IP = '127.0.0.1'  # Cambia esto por la IP de tu servidor
    SERVER_PORT = 8000  # Cambia esto por el puerto en el que está corriendo tu servidor Django
    PC_ID = 2  # Cambia esto por el ID del PC en la base de datos
    
    aplicacion = AplicacionBloqueo()
    aplicacion.ventana.mainloop()
