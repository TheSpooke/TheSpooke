import time
import threading
from plyer import notification

def notificaciones_emergentes(titulo, mensaje, duracion):
    while True:
        notification.notify(
            title=titulo,
            message=mensaje,
            timeout=duracion
        )
        time.sleep(5)  # Mostrar la notificación cada hora

class AplicacionBloqueo:
    def __init__(self):
        # Tu código aquí...

        # Lanzar hilo para notificaciones emergentes
        self.notificaciones_thread = threading.Thread(target=self.notificaciones_emergentes)
        self.notificaciones_thread.daemon = True
        self.notificaciones_thread.start()

    # Tu código aquí...

    def notificaciones_emergentes(self):
        # Llamar a la función de notificaciones emergentes con los argumentos necesarios
        titulo = "Título de la notificación"
        mensaje = "hola mate wea"
        duracion = 10  # Duración en segundos
        notificaciones_emergentes(titulo, mensaje, duracion)

if __name__ == "__main__":
    app = AplicacionBloqueo()
    app.ventana.mainloop()
