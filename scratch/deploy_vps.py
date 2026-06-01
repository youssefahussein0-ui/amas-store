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
        
        # Send password
        os.write(fd, (password + "\n").encode())
        time.sleep(2)
        
        # 1. Set up persistent upload directory and symlink safely
        setup_cmds = (
            "echo '--- Setting up persistent uploads symlink ---'\n"
            "mkdir -p /var/www/uploads\n"
            "[ -d /var/www/amas-store/uploads ] && [ ! -L /var/www/amas-store/uploads ] && cp -r /var/www/amas-store/uploads/. /var/www/uploads/ 2>/dev/null || true\n"
            "rm -rf /var/www/amas-store/uploads\n"
            "ln -s /var/www/uploads /var/www/amas-store/uploads\n"
            "echo '--- Uploads symlink setup done! ---'\n"
        )
        os.write(fd, setup_cmds.encode())
        time.sleep(2)
        
        # 2. Add execute permission and run the deployment script
        os.write(fd, "cd /var/www/amas-store && chmod +x ./deploy.sh && ./deploy.sh\n".encode())
        
        # Read the output stream
        out = b""
        for _ in range(90): # Allow up to 90 seconds for complete build and deploy
            try:
                chunk = os.read(fd, 4096)
                if not chunk: break
                out += chunk
                sys.stdout.buffer.write(chunk)
                sys.stdout.flush()
            except OSError:
                break
            time.sleep(1)

if __name__ == "__main__":
    run()
