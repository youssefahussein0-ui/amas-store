import pty, os, sys, time

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
        
        # Get error logs
        os.write(fd, "echo '--- PM2 Error Logs ---' && pm2 logs amas-store --err --lines 30 --nostream\n".encode())
        
        # Non-blocking read loop
        out = b""
        for _ in range(10):
            try:
                os.set_blocking(fd, False)
                chunk = os.read(fd, 4096)
                if chunk:
                    out += chunk
            except OSError:
                pass
            time.sleep(0.5)
            
        sys.stdout.buffer.write(out)
        sys.stdout.flush()

if __name__ == "__main__":
    run()
