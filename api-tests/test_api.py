import requests
url = "http://localhost:8000/detect/"

print("\nTesting animal detection API...")
try:
    with open("test.jpg", "rb") as f:
        response = requests.post(url, files={"file": f})
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print("Response:", response.json())
    else:
        print("Error:", response.text)
except Exception as e:
    print("Failed:", str(e))
