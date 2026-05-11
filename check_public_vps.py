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
        
        # Check files in dist/public
        os.write(fd, "ls -R /var/www/amas-store/dist/public\n".encode())
        time.sleep(1)
        
        # Keep reading
        for _ in range(10):
            chunk = os.read(fd, 4096)
            if not chunk:
                break
            sys.stdout.buffer.write(chunk)
            sys.stdout.buffer.flush()
            time.sleep(1)
        
        os.write(fd, "exit\n".encode())

if __name__ == "__main__":
    main()
