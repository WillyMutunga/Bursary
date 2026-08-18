import urllib.request
import urllib.parse
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = 'https://bursary.skysoftsystems.co.ke/api/v1/auth/login/'
data = json.dumps({
    'username': '41354126',
    'password': 'William#20'
}).encode('utf-8')

headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Origin': 'https://bursary.skysoftsystems.co.ke',
    'Referer': 'https://bursary.skysoftsystems.co.ke/login'
}

req = urllib.request.Request(url, data=data, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req, context=ctx) as response:
        status_code = response.getcode()
        body = response.read().decode('utf-8')
        print(f"HTTP STATUS: {status_code}")
        print(f"RESPONSE BODY: {body}")
except urllib.error.HTTPError as e:
    print(f"HTTP ERROR CODE: {e.code}")
    print(f"HTTP ERROR BODY: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"EXCEPTION: {str(e)}")
