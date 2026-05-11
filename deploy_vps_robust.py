import pty
import os
import sys
import time

def main():
    cmd = "ssh -o StrictHostKeyChecking=no root@187.124.220.187"
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
        
        # Wait for shell prompt
        time.sleep(2)
        
        # 1. Kill any hanging processes
        os.write(fd, "pkill -f drizzle-kit || true\n".encode())
        time.sleep(1)
        
        # 2. Add missing column if it doesn't exist
        sql = "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;"
        os.write(fd, f'sudo -u postgres psql -d amas_jewelry -c "{sql}"\n'.encode())
        time.sleep(2)
        
        # 3. Deploy
        # Note: We run vite build directly to ensure it works
        os.write(fd, "cd /var/www/amas-store && git reset --hard HEAD && git pull && npm install && npm run build && pm2 restart all\n".encode())
        
        # Keep reading for output
        for _ in range(120):
            chunk = os.read(fd, 4096)
            if not chunk:
                break
            sys.stdout.buffer.write(chunk)
            sys.stdout.buffer.flush()
            if b"PM2" in chunk:
                break
            time.sleep(1)

if __name__ == "__main__":
    main()
