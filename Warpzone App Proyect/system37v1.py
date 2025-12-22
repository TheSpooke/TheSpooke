import io
import tkinter as tk
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
import threading
import time
import os

class AplicacionBloqueo:
    def __init__(self):
        self.ventana = tk.Tk()
        self.ventana.title("Aplicación de Bloqueo")
        self.ventana.geometry("400x700")
        self.ventana.protocol("WM_DELETE_WINDOW", lambda: None)  # Disable close button
        self.ventana.configure(bg="#3498db")
        self.alerta_mostrada_15 = self.alerta_mostrada_10 = self.alerta_mostrada_5 = False
        self.tiempo_agregado_despues_de_alerta = False  # Nueva variable

        self.tiempo_inicial = 0
        self.tiempo_inicial_total = 0  # Nueva variable para rastrear el tiempo total inicial
        self.bloqueo_iniciado = False

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

        # Vincular la tecla Enter al método iniciar_bloqueo
        self.entrada_clave.bind("<Return>", lambda event: self.iniciar_bloqueo())

        self.boton_iniciar_bloqueo = tk.Button(
            self.ventana, text="Iniciar Bloqueo", command=self.iniciar_bloqueo, font=("Helvetica", 14)
        )
        self.boton_iniciar_bloqueo.pack(pady=20)

        opciones_tiempos = ["5 seconds", "10 seconds", "30 seconds", "1 minute", "5 minutes", "10 minutes",
                            "15 minutes","30 minutes", "1 hour", "2 hours", "3 hours", "4 hour", "5 hours", "6 hour", "7 hour", "8 hour", "9 hour", "10 hours"]
        self.menu_tiempos = ttk.Combobox(self.ventana, values=opciones_tiempos, state="readonly")
        self.menu_tiempos.pack(pady=10)

        self.boton_agregar_mas_tiempo = tk.Button(
            self.ventana, text="Agregar Más Tiempo", command=self.agregar_mas_tiempo, font=("Helvetica", 14), state=tk.DISABLED
        )
        self.boton_agregar_mas_tiempo.pack(pady=10)

        self.contrasena_guardada = "ciber1234*"  # Set the password

        # Crear la ventana de bloqueo de antemano, pero mantenerla oculta
        self.preparar_ventana_bloqueo()

         # Variable para almacenar la ventana del mensaje
        self.ventana_mensaje = None
    
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
            self.mostrar_mensaje_grande("Contraseña incorrecta.", duracion=3000)
            return
        
        if self.bloqueo_iniciado:
            tiempo_extra_str = self.menu_tiempos.get()
            tiempo_extra = self.convertir_a_segundos(tiempo_extra_str)
            if tiempo_extra > 0:
                tiempo_anterior = self.tiempo_total
                self.tiempo_total += tiempo_extra

                # Restablecer las alertas basándose en el tiempo total actualizado
                if self.tiempo_total >= 900 and tiempo_anterior < 900:
                    self.alerta_mostrada_15 = False
                if self.tiempo_total >= 600 and tiempo_anterior < 600:
                    self.alerta_mostrada_10 = False
                if self.tiempo_total >= 300 and tiempo_anterior < 300:
                    self.alerta_mostrada_5 = False

                self.mostrar_mensaje_grande(f"Agregados {tiempo_extra} segundos adicionales.", duracion=3000)
        else:
            self.mostrar_mensaje_grande("El bloqueo no ha sido iniciado.", duracion=3000)

    def mostrar_mensaje_grande(self, mensaje, duracion=3000):
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
        
        # Cerrar la ventana después de duracion milisegundos
        self.ventana_mensaje.after(duracion, self.cerrar_mensaje)

    def cerrar_mensaje(self):
        if self.ventana_mensaje is not None and self.ventana_mensaje.winfo_exists():
            self.ventana_mensaje.destroy()
            self.ventana_mensaje = None

    def notificaciones_emergentes(self):
        mensaje1 = (
            "- Recuerda no abrir ni instalar ningún juego de Riot Games.\n"
            "- Recuerda no apagar ni reiniciar la PC.\n"
            "- No instalar software de terceros sin la autorización de un agente de soporte.\n"
            "- Si requieres asistencia, solicita ayuda de soporte en instagram o discord.\n"
        )
        self.mostrar_mensaje_grande(mensaje1, duracion=10000)
    

    def preparar_ventana_bloqueo(self):
        self.ventana_bloqueo = tk.Toplevel(self.ventana)
        self.ventana_bloqueo.title("Bloqueo Total")

        # Configurar la ventana para que cubra toda la pantalla
        pantalla_ancho = self.ventana.winfo_screenwidth()
        pantalla_alto = self.ventana.winfo_screenheight()
        self.ventana_bloqueo.geometry(f"{pantalla_ancho}x{pantalla_alto}+0+0")

        self.ventana_bloqueo.overrideredirect(True)  # Oculta la barra de título y bordes
        self.ventana_bloqueo.attributes('-topmost', True)  # Mantener en la parte superior
        self.ventana_bloqueo.protocol("WM_DELETE_WINDOW", lambda: None)  # Desactivar botón de cierre
        self.ventana_bloqueo.bind("<Alt-Tab>", lambda event: "break")  # Desactivar Alt-Tab

        # Descargar y mostrar la imagen de fondo
        path_fondo = os.path.join(os.path.dirname(__file__), 'halo-warpzone.png')
        foto_fondo = self.cargar_imagen_desde_archivo(path_fondo, (pantalla_ancho, pantalla_alto))
        
        if foto_fondo:
            label_fondo = tk.Label(self.ventana_bloqueo, image=foto_fondo)
            label_fondo.place(x=0, y=0, relwidth=1, relheight=1)
            label_fondo.image = foto_fondo

        contenedor = tk.Frame(self.ventana_bloqueo, bg="#3498db")
        contenedor.place(relx=0.5, rely=0.5, anchor="center")

        # Descargar y mostrar el logo dentro del contenedor
        path_logo = os.path.join(os.path.dirname(__file__), 'logo.png')
        foto_logo = self.cargar_imagen_desde_archivo(path_logo, (250, 250))
        
        if foto_logo:
            label_logo = tk.Label(contenedor, image=foto_logo, bg="#3498db")
            label_logo.image = foto_logo  # Mantener una referencia
            label_logo.pack(pady=(10, 10))  # Ajustar espacio según sea necesario

        mensaje = tk.Label(contenedor, text="Gracias por haber jugado en Warpzone, tu ciber en casa",
                           font=("Helvetica", 16), bg="#3498db", fg="white")
        mensaje.pack(pady=(10, 10))

        entrada_clave = tk.Entry(contenedor, show="*", font=("Helvetica", 16))
        entrada_clave.pack(pady=10)
        
        # Vincular la tecla Enter al método verificar_contrasena_final
        entrada_clave.bind("<Return>", lambda event: self.verificar_contrasena_final(entrada_clave))

        boton_desbloquear = tk.Button(contenedor, text="Desbloquear",
                                    command=lambda: self.verificar_contrasena_final(entrada_clave),
                                    font=("Helvetica", 16))
        boton_desbloquear.pack(pady=10)

        # Inicialmente, ocultar la ventana de bloqueo
        self.ventana_bloqueo.withdraw()

    def iniciar_bloqueo(self):
        if self.entrada_clave.get() != self.contrasena_guardada:
            self.mostrar_mensaje_grande("Contraseña incorrecta.", duracion=3000)
            self.entrada_clave.delete(0, tk.END)  # Borrar la entrada de contraseña
            return

        tiempo_str = self.menu_tiempos.get()
        if tiempo_str == "":
            self.mostrar_mensaje_grande("Seleccione un tiempo válido.", duracion=3000)
            return

        tiempo_ingresado = self.convertir_a_segundos(tiempo_str)
        if tiempo_ingresado > 0:
            if not self.bloqueo_iniciado:
                self.bloqueo_iniciado = True
                self.tiempo_total = tiempo_ingresado
                self.boton_agregar_mas_tiempo.config(state=tk.NORMAL)
                self.mostrar_mensaje_grande(f"Bloqueo iniciado por {tiempo_ingresado} segundos.", duracion=3000)
                self.crear_ventana_cuenta_regresiva()
                hilo_temporizador = threading.Thread(target=lambda: self.temporizador(tiempo_ingresado))
                hilo_temporizador.start()
                self.ventana.after(15000, self.notificaciones_emergentes)
            self.tiempo_inicial_total = self.tiempo_total
        # Borrar la entrada de contraseña después de iniciar el bloqueo
        self.entrada_clave.delete(0, tk.END)

    def crear_ventana_cuenta_regresiva(self):
        self.ventana_cuenta_regresiva = tk.Toplevel(self.ventana, bg='white')
        self.ventana_cuenta_regresiva.attributes('-transparentcolor', 'white')
        self.ventana_cuenta_regresiva.attributes('-topmost', True)  # Siempre en primer plano
        self.ventana_cuenta_regresiva.overrideredirect(True)  # Sin bordes ni barra de título
        self.label_cuenta_regresiva = tk.Label(self.ventana_cuenta_regresiva, text="", font=("Helvetica", 20), bg='white', fg="yellow")
        self.label_cuenta_regresiva.pack(expand=True, fill="both")

    def temporizador(self, tiempo):
        self.tiempo_total = tiempo
        tiempo_inicial = time.time()
        alerta_mostrada_15 = alerta_mostrada_10 = alerta_mostrada_5 = False

        while self.bloqueo_iniciado:
            tiempo_actual = time.time()
            tiempo_transcurrido = tiempo_actual - tiempo_inicial
            tiempo_restante = self.tiempo_total - tiempo_transcurrido

            if tiempo_restante <= 0:
                break

            # Calculate hours, minutes, and seconds
            horas = int(tiempo_restante // 3600)
            minutos = int((tiempo_restante % 3600) // 60)
            segundos = int(tiempo_restante % 60)

            # Format the time remaining
            tiempo_formateado = f"{horas} h, {minutos} m, {segundos} s"
            self.label_cuenta_regresiva.config(text=tiempo_formateado)
            self.ventana_cuenta_regresiva.update()

            # Check for alerts
            if self.tiempo_total >= 900 and tiempo_restante < 900 and not alerta_mostrada_15:
                self.mostrar_mensaje_grande("¡15 minutos restantes!", duracion=3000)
                alerta_mostrada_15 = True
            elif self.tiempo_total >= 600 and tiempo_restante < 600 and not alerta_mostrada_10:
                self.mostrar_mensaje_grande("¡10 minutos restantes!", duracion=3000)
                alerta_mostrada_10 = True
            elif self.tiempo_total >= 300 and tiempo_restante < 300 and not alerta_mostrada_5:
                self.mostrar_mensaje_grande("¡5 minutos restantes!", duracion=3000)
                alerta_mostrada_5 = True

            time.sleep(1)

        # Destruir la ventana de cuenta regresiva antes de bloquear la pantalla
        self.ventana.after(0, self.ventana_cuenta_regresiva.destroy)
        self.ventana.after(1, self.bloquear_pantalla)

    def verificar_contrasena_final(self, entrada_clave):
        if entrada_clave.get() == self.contrasena_guardada:
            self.bloqueo_iniciado = False
            self.ventana_bloqueo.withdraw()
            self.ventana.deiconify()
        else:
            self.mostrar_mensaje_grande("Contraseña incorrecta. Inténtelo de nuevo.", duracion=3000)
        
        # Borrar la contraseña después de intentar desbloquear, ya sea que sea correcto o no
        entrada_clave.delete(0, tk.END)

    def bloquear_pantalla(self):
        # Limpiar la entrada de la contraseña antes de bloquear la pantalla
        self.entrada_clave.delete(0, tk.END)
        self.ventana_bloqueo.deiconify()



    def bloquear_movimiento_ventana(self, event):
        self.ventana_bloqueo.geometry("{0}x{1}+0+0".format(self.ventana_bloqueo.winfo_width(), self.ventana_bloqueo.winfo_height()))

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
    aplicacion = AplicacionBloqueo()
    aplicacion.ventana.mainloop()
