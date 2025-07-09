#!/usr/bin/env python3
import http.server
import socketserver
import os

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def main():
    PORT = 8081
    
    print('🔥 ULTIMATE RACING MADNESS SERVER! 🔥')
    print('10 INSANE VEHICLES READY!')
    print(f'Starting server from: {os.getcwd()}')
    print(f'Files available: {os.listdir(".")}')
    print(f'Open: http://localhost:{PORT}/')
    print(f'Test page: http://localhost:{PORT}/test.html')
    print('')
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"Server running on port {PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    main() 