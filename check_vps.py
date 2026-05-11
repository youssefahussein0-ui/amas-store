import pty, os, sys, time

def run():
    password = sys.argv[1]
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
        # Check env file and recent logs
        os.write(fd, "cat /var/www/amas-store/.env && echo '---LOGS---' && pm2 logs amas-store --lines 20 --nostream\n".encode())
        out = b""
        for _ in range(15):
            try:
                chunk = os.read(fd, 4096)
                if not chunk: break
                out += chunk
            except OSError: break
            time.sleep(1)
        sys.stdout.buffer.write(out)

if __name__ == "__main__":
    run()
