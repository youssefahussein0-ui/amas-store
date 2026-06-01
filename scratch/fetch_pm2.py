import pty
import os
import sys
import time

def run():
    password = "R1f4@,NE@fC)+);cxAp)"
    pid, fd = pty.fork()
    if pid == 0:
        os.execvp("ssh", ["ssh", "-o", "StrictHostKeyChecking=no", "root@187.124.220.187"])
    else:
        buf = b""
        while b"password:" not in buf.lower():
            chunk = os.read(fd, 1024)
            if not chunk: break
            buf += chunk
        
        os.write(fd, (password + "\n").encode())
        time.sleep(2)
        
        # Clear buffer
        os.read(fd, 8192)
        
        # Get logs
        os.write(fd, "pm2 logs amas-store --lines 50 --nostream\n".encode())
        time.sleep(3)
        
        out = b""
        for _ in range(10):
            try:
                chunk = os.read(fd, 16384)
                if not chunk: break
                out += chunk
            except OSError:
                break
            time.sleep(0.5)
            
        sys.stdout.buffer.write(out)
        sys.stdout.flush()

if __name__ == "__main__":
    run()
