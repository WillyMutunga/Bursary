import urllib.request
import urllib.parse
import json
import ssl
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

login_url = 'https://bursary.skysoftsystems.co.ke/api/v1/auth/login/'
login_data = json.dumps({'username': 'admin', 'password': 'admin123'}).encode('utf-8')
headers = {'Content-Type': 'application/json'}

req = urllib.request.Request(login_url, data=login_data, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req, context=ctx) as res:
        data = json.loads(res.read().decode('utf-8'))
        token = data.get('access')
        print(f"Logged in as admin! Token: {token[:15]}...")

    toggle_url = 'https://bursary.skysoftsystems.co.ke/api/v1/applications/toggle_window/'
    toggle_data = json.dumps({'is_window_open': False}).encode('utf-8')
    toggle_headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }

    t_req = urllib.request.Request(toggle_url, data=toggle_data, headers=toggle_headers, method='POST')
    with urllib.request.urlopen(t_req, context=ctx) as t_res:
        print("TOGGLE STATUS:", t_res.getcode())
        print("TOGGLE BODY:", t_res.read().decode('utf-8'))

except urllib.error.HTTPError as e:
    print("HTTP ERROR CODE:", e.code)
    body = e.read().decode('utf-8', errors='ignore')
    match = re.search(r'<th>Exception Value:</th>\s*<td><pre>(.*?)</pre></td>', body, re.DOTALL)
    if match:
        print("EXACT DJANGO EXCEPTION:", match.group(1).strip())
    else:
        print("FIRST 500 CHARS OF BODY:", body[:500])
except Exception as e:
    print("EXCEPTION:", str(e))
