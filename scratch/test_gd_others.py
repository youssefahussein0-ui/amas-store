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
        
        # Test curling a couple of other product image IDs
        os.write(fd, "echo '--- Curl Image 1 ---' && curl -i -L 'https://drive.google.com/uc?export=download&id=1sI44rm-3uVQOkhbB4b-FcXakLqmAPaJh'\n".encode())
        time.sleep(1)
        os.write(fd, "echo '--- Curl Image 2 ---' && curl -i -L 'https://drive.google.com/uc?export=download&id=1-X7V8fbc274ChQZMTaAvFTmzGRBEyxXt'\n".encode())
        
        # Non-blocking read loop
        out = b""
        for _ in range(15):
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
