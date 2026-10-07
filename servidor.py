"""Servidor local para desarrollar Pac-Papa.

Sirve la carpeta del juego sin caché, para que cada recarga del navegador
use los archivos más recientes. Escucha en toda la red local, así que
también se puede abrir desde un celular conectado al mismo wifi.

Uso:  python servidor.py [puerto]     (por defecto 8765)
"""

import functools
import http.server
import os
import socket
import sys


ICONOS_PERMITIDOS = {"/iconos/icono-192.png", "/iconos/icono-512.png"}
LOCALES = {"127.0.0.1", "::1", "::ffff:127.0.0.1"}


class SinCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # Guarda los íconos generados en herramientas/iconos.html.
    # Solo desde esta misma PC, solo esos dos archivos y solo PNG.
    def do_PUT(self):
        largo = int(self.headers.get("Content-Length", 0))
        if (self.client_address[0] not in LOCALES
                or self.path not in ICONOS_PERMITIDOS
                or not 0 < largo < 3_000_000):
            self.send_error(403)
            return
        datos = self.rfile.read(largo)
        if not datos.startswith(b"\x89PNG\r\n\x1a\n"):
            self.send_error(400)
            return
        ruta = os.path.join(self.directory, *self.path.strip("/").split("/"))
        os.makedirs(os.path.dirname(ruta), exist_ok=True)
        with open(ruta, "wb") as f:
            f.write(datos)
        self.send_response(204)
        self.end_headers()


def ip_local():
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("10.255.255.255", 1))
            return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"


def main():
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    carpeta = os.path.dirname(os.path.abspath(__file__))
    manejador = functools.partial(SinCache, directory=carpeta)
    with http.server.ThreadingHTTPServer(("0.0.0.0", puerto), manejador) as servidor:
        print(f"Pac-Papa en http://localhost:{puerto}")
        print(f"Desde el celular: http://{ip_local()}:{puerto}")
        servidor.serve_forever()


if __name__ == "__main__":
    main()
