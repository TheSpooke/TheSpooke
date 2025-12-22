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
        self.bloqueo_iniciado = False

        # Descargar y mostrar el logo
        url_logo = "https://i.ibb.co/P9x7rz5/logo.png"  # URL del logo
        respuesta = requests.get(url_logo)
        if respuesta.status_code == 200:
            imagen_logo = Image.open(BytesIO(respuesta.content))
            imagen_logo = imagen_logo.resize((200, 200), Image.Resampling.LANCZOS)  # Redimensionar a 200x200
            self.foto_logo = ImageTk.PhotoImage(imagen_logo)

            label_logo = tk.Label(self.ventana, image=self.foto_logo, bg="#3498db")
            label_logo.pack(pady=(0, 0))  # Reducir el espacio vertical después del logo

        self.label_ingrese_clave = tk.Label(
            self.ventana, text="Ingrese la contraseña:", font=("Helvetica", 12), bg="#3498db", fg="white"
        )
        self.label_ingrese_clave.pack(pady=(5, 10))  # Reducir el espacio antes del texto

        self.entrada_clave = tk.Entry(self.ventana, show="*", font=("Helvetica", 12))
        self.entrada_clave.pack(pady=10)

        self.boton_iniciar_bloqueo = tk.Button(
            self.ventana, text="Iniciar Bloqueo", command=self.iniciar_bloqueo, font=("Helvetica", 14)
        )
        self.boton_iniciar_bloqueo.pack(pady=20)

        opciones_tiempos = ["5 segundos", "10 segundos", "30 segundos", "1 minutos", "5 minutos", "10 minutos",
                            "30 minutos", "1 hora", "2 horas", "3 horas", "5 horas", "10 horas"]
        self.menu_tiempos = ttk.Combobox(self.ventana, values=opciones_tiempos, state="readonly")
        self.menu_tiempos.pack(pady=10)

        self.contrasena_guardada = "1234"  # Set the password

        # Crear la ventana de bloqueo de antemano, pero mantenerla oculta
        self.preparar_ventana_bloqueo()

    def preparar_ventana_bloqueo(self):
        self.ventana_bloqueo = tk.Toplevel(self.ventana)
        self.ventana_bloqueo.title("Bloqueo Total")
        self.ventana_bloqueo.geometry("{0}x{1}+0+0".format(self.ventana.winfo_screenwidth(), self.ventana.winfo_screenheight()))
        self.ventana_bloqueo.overrideredirect(True)
        self.ventana_bloqueo.attributes('-topmost', True)
        #self.ventana_bloqueo.attributes('-fullscreen', True)
        self.ventana_bloqueo.protocol("WM_DELETE_WINDOW", lambda: None)
        self.ventana_bloqueo.bind("<Alt-Tab>", lambda event: "break")
        # Añadir una etiqueta para la cuenta regresiva
        self.label_cuenta_regresiva = tk.Label(self.ventana_bloqueo, text="", font=("Helvetica", 30), bg="#3498db", fg="white")
        self.label_cuenta_regresiva.place(relx=0.5, rely=0.3, anchor="center")

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

        # Inicialmente, ocultar la ventana de bloqueo
        self.ventana_bloqueo.withdraw()

    def iniciar_bloqueo(self):
        tiempo_str = self.menu_tiempos.get()

        if tiempo_str == "":
            messagebox.showerror("Error", "Seleccione un tiempo válido.")
            return

        tiempo_ingresado = self.convertir_a_segundos(tiempo_str)

        if tiempo_ingresado > 0:
            messagebox.showinfo("Bloqueo Iniciado", f"Bloqueo iniciado por {tiempo_ingresado} segundos.")
            self.bloqueo_iniciado = True
            self.ventana.iconify()  # Minimiza la ventana principal
            hilo_temporizador = threading.Thread(target=lambda: self.temporizador(tiempo_ingresado))
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

        while time.time() - tiempo_inicial < tiempo and self.bloqueo_iniciado:
            tiempo_restante = int(tiempo - (time.time() - tiempo_inicial))
            if tiempo_restante > 0:
                if tiempo_restante <= 10:
                    # Actualizar la etiqueta con la cuenta regresiva
                    texto = f"{tiempo_restante}"
                    self.ventana_cuenta_regresiva.after(0, lambda: self.label_cuenta_regresiva.config(text=texto))
                    self.ventana_cuenta_regresiva.update()  # Actualizar la ventana
            else:
                # Cuando el tiempo se agote, mostrar la pantalla de bloqueo
                self.bloquear_pantalla()
            time.sleep(1)

        # Cerrar la ventana de cuenta regresiva
        self.ventana_cuenta_regresiva.destroy()

    def actualizar_label_tiempo(self, texto):
        if self.label_tiempo.winfo_exists():  # Verificar si el widget todavía existe
            self.label_tiempo.config(text=texto)

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
