import time
import urllib.request
import datetime

SERVER_URL = "https://airbnb-ojom.onrender.com/health"
INTERVAL_SECONDS = 300  # 5 minutes

def ping_server():
    try:
        start_time = time.time()
        with urllib.request.urlopen(SERVER_URL, timeout=10) as response:
            duration_ms = int((time.time() - start_time) * 1000)
            now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{now}] [Status: {response.status}] Backend ping successful ({duration_ms}ms) - alive")
    except Exception as e:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{now}] Ping error: {e}")

if __name__ == "__main__":
    print(f"🚀 Keepalive monitor started for: {SERVER_URL}")
    print(f"⏱️ Triggering ping every 5 minutes...")
    ping_server()
    while True:
        time.sleep(INTERVAL_SECONDS)
        ping_server()
