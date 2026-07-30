import subprocess

out = subprocess.check_output("netstat -ano | findstr :8000", shell=True).decode()
print("NETSTAT OUTPUT:\n", out)
lines = out.strip().split("\n")
pids = set()
for line in lines:
    parts = line.strip().split()
    if len(parts) >= 5 and "LISTENING" in parts:
        pids.add(parts[-1])

print("PIDs to kill:", pids)
for pid in pids:
    subprocess.call(f"taskkill /F /PID {pid}", shell=True)
