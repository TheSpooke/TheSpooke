import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time

class AplicacionBloqueo:
    def __init__(self):
        self.ventana = tk.Tk()
        self.ventana.title("Aplicación de Bloqueo")
        self.ventana.geometry("400x300")
        self.ventana.protocol("WM_DELETE_WINDOW", lambda: None)  # Disable close button
        self.ventana.configure(bg="#3498db")

        self.tiempo_inicial = None
        self.bloqueo_iniciado = False
        self.ventana_bloqueo = None

        self.label_tiempo = tk.Label(
            self.ventana, text="", font=("Helvetica", 16), bg="#3498db", fg="white"
        )
        self.label_tiempo.pack(pady=20)

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
                            "30 minutes", "1 hour", "2 hours", "3 hours", "5 hours", "10 hours"]
        self.menu_tiempos = ttk.Combobox(self.ventana, values=opciones_tiempos, state="readonly")
        self.menu_tiempos.pack(pady=10)

        self.contrasena_guardada = "1234"  # Set the password

    def iniciar_bloqueo(self):
        if not self.bloqueo_iniciado:
            tiempo_str = self.menu_tiempos.get()

            if tiempo_str == "":
                messagebox.showerror("Error", "Seleccione un tiempo válido.")
                return

            tiempo_ingresado = self.convertir_a_segundos(tiempo_str)

            if tiempo_ingresado > 0:
                self.bloqueo_iniciado = True
                self.ventana.iconify()  # Minimize the main window

                hilo_temporizador = threading.Thread(target=lambda: self.temporizador(tiempo_ingresado))
                hilo_temporizador.start()

    def temporizador(self, tiempo):
        tiempo_inicial = time.time()

        while time.time() - tiempo_inicial < tiempo and self.bloqueo_iniciado:
            tiempo_restante = int(tiempo - (time.time() - tiempo_inicial))
            if tiempo_restante > 0:
                self.label_tiempo.config(text=f"Tiempo restante: {tiempo_restante} segundos")
            time.sleep(1)

        if self.bloqueo_iniciado:
            self.bloquear_pantalla()

    def bloquear_pantalla(self):
        # Configuración de la ventana de bloqueo
        self.ventana_bloqueo = tk.Toplevel(self.ventana)
        self.ventana_bloqueo.title("Bloqueo Total")
        self.ventana_bloqueo.geometry("{0}x{1}+0+0".format(self.ventana.winfo_screenwidth(), self.ventana.winfo_screenheight()))
        self.ventana_bloqueo.overrideredirect(True)  # Oculta la barra de título y bordes
        self.ventana_bloqueo.attributes('-topmost', True)  # Mantener en la parte superior
        self.ventana_bloqueo.attributes('-fullscreen', True)  # Modo pantalla completa
        self.ventana_bloqueo.protocol("WM_DELETE_WINDOW", lambda: None)  # Desactivar botón de cierre
        self.ventana_bloqueo.bind("<Alt-Tab>", lambda event: "break")  # Desactivar Alt-Tab
        self.ventana_bloqueo.grab_set()  # Evitar interacción con otras ventanas

        # Contenedor central para los elementos
        contenedor = tk.Frame(self.ventana_bloqueo, bg="#3498db")
        contenedor.place(relx=0.5, rely=0.5, anchor="center")

        # Mensaje
        mensaje = tk.Label(contenedor, text="Gracias por haber jugado en Warpzone, tu ciber en casa",
                        font=("Helvetica", 16), bg="#3498db", fg="white")
        mensaje.pack(pady=10)

        # Entrada para la contraseña
        entrada_clave = tk.Entry(contenedor, show="*", font=("Helvetica", 16))
        entrada_clave.pack(pady=10)

        # Botón para desbloquear
        boton_desbloquear = tk.Button(contenedor, text="Desbloquear",
                                    command=lambda: self.verificar_contrasena_final(entrada_clave),
                                    font=("Helvetica", 16))
        boton_desbloquear.pack(pady=10)



    def verificar_contrasena_final(self, entrada_clave):
        if entrada_clave.get() == self.contrasena_guardada:
            self.bloqueo_iniciado = False  # Unlock
            self.ventana_bloqueo.destroy()  # Close the blocking window
            self.ventana.deiconify()  # Restore the main window
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

# This code sets the password to "1234" and makes the close button of both the main window and the blocking window non-responsive. 
# Please use this script responsibly, especially if you're planning to use it on a shared or public computer.

if __name__ == "__main__":
    aplicacion = AplicacionBloqueo()
    aplicacion.ventana.mainloop()
