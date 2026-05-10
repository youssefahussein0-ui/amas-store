import pty
import os
import sys
import time

def main():
    cmd = "ssh -o StrictHostKeyChecking=no root@187.124.220.187"
    password = sys.argv[1]
    
    def read(fd):
        data = os.read(fd, 1024)
        return data

    pid, fd = pty.fork()
    
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "root@187.124.220.187"])
    else:
        # Wait for password prompt
        buffer = b""
        while b"password:" not in buffer.lower():
            chunk = os.read(fd, 1024)
            if not chunk:
                break
            buffer += chunk
            sys.stdout.buffer.write(chunk)
            sys.stdout.buffer.flush()
        
        os.write(fd, (password + "\n").encode())
        
        # Wait for shell prompt
        time.sleep(2)
        os.write(fd, "cd /var/www/amas-store && git reset --hard HEAD && git pull && npm install && npx drizzle-kit push:pg && npm run build && pm2 restart all\n".encode())
        
        # Keep reading for a bit to see output
        for _ in range(50):
            chunk = os.read(fd, 4096)
            if not chunk:
                break
            sys.stdout.buffer.write(chunk)
            sys.stdout.buffer.flush()
            if b"PM2" in chunk: # Usually last part of deployment
                break
            time.sleep(1)

if __name__ == "__main__":
    main()
