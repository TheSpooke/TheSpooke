import tkinter as tk
from tkinter import ttk, messagebox
from PIL import Image, ImageTk
import threading
import time
import requests
from io import BytesIO

class AplicacionBloqueo:
    def __init__(self):
        self.ventana = tk.Tk()
        self.ventana.title("Aplicación de Bloqueo")
        self.ventana.geometry("400x500")
        self.ventana.protocol("WM_DELETE_WINDOW", lambda: None)  # Disable close button
        self.ventana.configure(bg="#3498db")

        self.tiempo_inicial = None
        self.bloqueo_iniciado = False

        self.label_tiempo = tk.Label(
            self.ventana, text="", font=("Helvetica", 16), bg="#3498db", fg="white"
        )
        self.label_tiempo.pack(pady=20)

        # Descargar y mostrar el logo
        url_logo = "https://i.ibb.co/zX34xfD/logo.png"  # URL del logo
        respuesta = requests.get(url_logo)
        if respuesta.status_code == 200:
            imagen_logo = Image.open(BytesIO(respuesta.content))
            imagen_logo = imagen_logo.resize((150, 150), Image.Resampling.LANCZOS)  # Redimensionar a 200x200
            self.foto_logo = ImageTk.PhotoImage(imagen_logo)

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
                            "15 minutes","30 minutes", "1 hour", "2 hours", "3 hours", "5 hours", "10 hours"]
        self.menu_tiempos = ttk.Combobox(self.ventana, values=opciones_tiempos, state="readonly")
        self.menu_tiempos.pack(pady=10)


        # Botón para agregar tiempo adicional
        self.entrada_tiempo_adicional = tk.Entry(self.ventana, font=("Helvetica", 12))
        self.boton_agregar_tiempo = tk.Button(
            self.ventana, text="Agregar Tiempo", command=self.agregar_tiempo_adicional, font=("Helvetica", 14)
        )
        self.boton_agregar_tiempo.pack(pady=10)
        self.menu_tiempos = ttk.Combobox(self.ventana, values=opciones_tiempos, state="readonly")
        self.menu_tiempos.pack(pady=10)

    

        self.contrasena_guardada = "1234"  # Set the password

        # Crear la ventana de bloqueo de antemano, pero mantenerla oculta
        self.preparar_ventana_bloqueo()

         # Variable para almacenar la ventana del mensaje
        self.ventana_mensaje = None

    def agregar_tiempo_adicional(self):
        tiempo_adicional_str = self.entrada_tiempo_adicional.get()
        tiempo_adicional = self.convertir_a_segundos(tiempo_adicional_str)

        if tiempo_adicional > 0:
            self.tiempo_total += tiempo_adicional
            self.actualizar_label_cuenta_regresiva()

    def actualizar_label_cuenta_regresiva(self):
        tiempo_restante = self.tiempo_total - (time.time() - self.tiempo_inicial)
        if tiempo_restante > 0:
            texto = f"{int(tiempo_restante)} segundos"
        else:
            texto = "Tiempo agotado"
        self.label_cuenta_regresiva.config(text=texto)
    
    def mostrar_mensaje_grande(self, mensaje):
        if self.ventana_mensaje is not None and self.ventana_mensaje.winfo_exists():
            self.ventana_mensaje.destroy()
        
        self.ventana_mensaje = tk.Toplevel(self.ventana)
        self.ventana_mensaje.attributes('-topmost', True)  # Mostrar encima de otras ventanas
        self.ventana_mensaje.attributes('-fullscreen', True)  # Modo pantalla completa
        self.ventana_mensaje.overrideredirect(True)  # Sin bordes ni barra de título
        self.ventana_mensaje.attributes('-alpha', 0.7)  # Fondo transparente
        self.ventana_mensaje.configure(bg='black')  # Fondo negro
        label_mensaje = tk.Label(self.ventana_mensaje, text=mensaje, font=("Helvetica", 36), bg='black', fg="white")
        label_mensaje.pack(expand=True, fill="both")
        
        # Cerrar la ventana después de 10 segundos
        self.ventana_mensaje.after(3000, self.cerrar_mensaje)

    def cerrar_mensaje(self):
        if self.ventana_mensaje is not None and self.ventana_mensaje.winfo_exists():
            self.ventana_mensaje.destroy()
            self.ventana_mensaje = None

    def preparar_ventana_bloqueo(self):
        self.ventana_bloqueo = tk.Toplevel(self.ventana)
        self.ventana_bloqueo.title("Bloqueo Total")
        self.ventana_bloqueo.geometry("{0}x{1}+0+0".format(self.ventana.winfo_screenwidth(), self.ventana.winfo_screenheight()))
        self.ventana_bloqueo.overrideredirect(True)
        self.ventana_bloqueo.attributes('-topmost', True)
        self.ventana_bloqueo.protocol("WM_DELETE_WINDOW", lambda: None)
        self.ventana_bloqueo.bind("<Alt-Tab>", lambda event: "break")

        contenedor = tk.Frame(self.ventana_bloqueo, bg="#3498db")
        contenedor.place(relx=0.5, rely=0.5, anchor="center")

        # Descargar y mostrar el logo dentro del contenedor
        url_logo = "https://i.ibb.co/zX34xfD/logo.png"  # URL del logo
        respuesta = requests.get(url_logo)
        if respuesta.status_code == 200:
            imagen_logo = Image.open(BytesIO(respuesta.content))
            imagen_logo = imagen_logo.resize((250, 250), Image.Resampling.LANCZOS)
            foto_logo = ImageTk.PhotoImage(imagen_logo)

            label_logo = tk.Label(contenedor, image=foto_logo, bg="#3498db")
            label_logo.image = foto_logo  # Mantener una referencia
            label_logo.pack(pady=(10, 10))  # Ajustar espacio según sea necesario

        mensaje = tk.Label(contenedor, text="Gracias por haber jugado en Warpzone, tu ciber en casa",
                           font=("Helvetica", 16), bg="#3498db", fg="white")
        mensaje.pack(pady=(10, 10))

        entrada_clave = tk.Entry(contenedor, show="*", font=("Helvetica", 16))
        entrada_clave.pack(pady=10)

        boton_desbloquear = tk.Button(contenedor, text="Desbloquear",
                                      command=lambda: self.verificar_contrasena_final(entrada_clave),
                                      font=("Helvetica", 16))
        boton_desbloquear.pack(pady=10)

        # Inicialmente, ocultar la ventana de bloqueo
        self.ventana_bloqueo.withdraw()


    def iniciar_bloqueo(self):
        if not self.bloqueo_iniciado:
            tiempo_str = self.menu_tiempos.get()
            tiempo_adicional_str = self.entrada_tiempo_adicional.get()
            tiempo_adicional = self.convertir_a_segundos(tiempo_adicional_str)

            if tiempo_str == "":
                messagebox.showerror("Error", "Seleccione un tiempo válido.")
                return

            tiempo_ingresado = self.convertir_a_segundos(tiempo_str)

            if tiempo_ingresado > 0:
                self.bloqueo_iniciado = True
                self.tiempo_total = tiempo_ingresado + tiempo_adicional  # Sumar tiempo adicional
                self.tiempo_inicial = time.time()
                self.actualizar_label_cuenta_regresiva()
                hilo_temporizador = threading.Thread(target=self.temporizador)
                hilo_temporizador.start()

    def crear_ventana_cuenta_regresiva(self):
        self.ventana_cuenta_regresiva = tk.Toplevel(self.ventana, bg='white')
        self.ventana_cuenta_regresiva.attributes('-transparentcolor', 'white')
        self.ventana_cuenta_regresiva.attributes('-topmost', True)  # Siempre en primer plano
        self.ventana_cuenta_regresiva.overrideredirect(True)  # Sin bordes ni barra de título
        self.label_cuenta_regresiva = tk.Label(self.ventana_cuenta_regresiva, text="", font=("Helvetica", 30), bg='white', fg="yellow")
        self.label_cuenta_regresiva.pack(expand=True, fill="both")

    def temporizador(self, tiempo):
        tiempo_inicial = time.time()
        tiempo_restante = tiempo

        while tiempo_restante > 0 and self.bloqueo_iniciado:
            tiempo_restante = int(tiempo - (time.time() - tiempo_inicial))
            
            if tiempo_restante == 900:  # 15 minutos restantes
                self.mostrar_mensaje_grande("¡15 minutos restantes!")
            elif tiempo_restante == 600:  # 10 minutos restantes
                self.mostrar_mensaje_grande("¡10 minutos restantes!")
            elif tiempo_restante == 300:  # 5 minutos restantes
                self.mostrar_mensaje_grande("¡5 minutos restantes!")

            if tiempo_restante > 0:
                if tiempo_restante <= 10:
                    # Actualizar la etiqueta con la cuenta regresiva
                    texto = f"{tiempo_restante}"
                    self.ventana_cuenta_regresiva.after(0, lambda: self.label_cuenta_regresiva.config(text=texto))
                    self.ventana_cuenta_regresiva.update()
            else:
                # Cuando el tiempo se agote, mostrar la pantalla de bloqueo
                self.bloquear_pantalla()
            time.sleep(1)

        # Cerrar la ventana de cuenta regresiva
        self.ventana_cuenta_regresiva.destroy()

    def bloquear_pantalla(self):
        self.ventana_bloqueo = tk.Toplevel(self.ventana)
        self.ventana_bloqueo.title("Bloqueo Total")
        self.ventana_bloqueo.geometry("{0}x{1}+0+0".format(self.ventana.winfo_screenwidth(), self.ventana.winfo_screenheight()))
        self.ventana_bloqueo.overrideredirect(True)  # Oculta la barra de título y bordes
        self.ventana_bloqueo.attributes('-topmost', True)  # Mantener en la parte superior
        #self.ventana_bloqueo.attributes('-fullscreen', True)  # Modo pantalla completa
        self.ventana_bloqueo.protocol("WM_DELETE_WINDOW", lambda: None)  # Desactivar botón de cierre
        self.ventana_bloqueo.bind("<Alt-Tab>", lambda event: "break")  # Desactivar Alt-Tab
        self.ventana_bloqueo.grab_set()  # Evitar interacción con otras ventanas

        contenedor = tk.Frame(self.ventana_bloqueo, bg="#3498db")
        contenedor.place(relx=0.5, rely=0.5, anchor="center")

        mensaje = tk.Label(contenedor, text="Gracias por haber jugado en Warpzone, tu ciber en casa",
                           font=("Helvetica", 16), bg="#3498db", fg="white")
        mensaje.pack(pady=10)

        entrada_clave = tk.Entry(contenedor, show="*", font=("Helvetica", 16))
        entrada_clave.pack(pady=10)

        boton_desbloquear = tk.Button(contenedor, text="Desbloquear",
                                      command=lambda: self.verificar_contrasena_final(entrada_clave),
                                      font=("Helvetica", 16))
        boton_desbloquear.pack(pady=10)

        # Asegurarse de que la ventana de bloqueo reciba el enfoque
        self.ventana_bloqueo.focus_set()
        # En lugar de crear una nueva ventana, simplemente mostramos la ventana de bloqueo
        self.ventana_bloqueo.deiconify()

    def verificar_contrasena_final(self, entrada_clave):
        if entrada_clave.get() == self.contrasena_guardada:
            self.bloqueo_iniciado = False
            self.ventana_bloqueo.destroy()
            self.ventana.deiconify()
        else:
            messagebox.showerror("Error", "Contraseña incorrecta. Inténtelo de nuevo.")

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
