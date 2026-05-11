import pty
import os
import sys
import time

def main():
    password = sys.argv[1]
    
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
        
        os.write(fd, (password + "\n").encode())
        time.sleep(2)
        
        # Check PM2 status
        os.write(fd, "pm2 status\n".encode())
        time.sleep(1)
        
        # Check PM2 logs
        os.write(fd, "pm2 logs amas-store --lines 100 --out --err\n".encode())
        
        # Keep reading for a bit to see output
        for _ in range(20):
            chunk = os.read(fd, 4096)
            if not chunk:
                break
            sys.stdout.buffer.write(chunk)
            sys.stdout.buffer.flush()
            time.sleep(1)
        
        os.write(fd, "exit\n".encode())

if __name__ == "__main__":
    main()
