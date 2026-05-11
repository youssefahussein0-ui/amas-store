import pty
import os
import sys
import time

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
        cmd = "cd /var/www/amas-store && git pull origin main && npm run build && pm2 restart amas-store\n"
        os.write(fd, cmd.encode())
        done = False
        for _ in range(120):
            try:
                chunk = os.read(fd, 4096)
                if not chunk: break
                text = chunk.decode(errors='replace')
                sys.stdout.write(text)
                sys.stdout.flush()
                if "online" in text and "amas-store" in text:
                    done = True
                    break
            except OSError:
                break
            time.sleep(1)
        print("\n✅ Deployment Finished!" if done else "\n⚠️ Deployment Timed Out")

if __name__ == "__main__":
    run()
