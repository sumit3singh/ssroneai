import subprocess
import os

out = subprocess.check_output("netstat -ano | findstr :8000", shell=True).decode()
print("NETSTAT RESULT:\n", out)
lines = out.strip().split("\n")
for l in lines:
    parts = l.strip().split()
    if len(parts) >= 5 and "LISTENING" in parts:
        pid = parts[-1]
        print(f"Terminating PID {pid}...")
        subprocess.call(f"taskkill /F /PID {pid}", shell=True)
