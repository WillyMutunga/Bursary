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
        token = json.loads(res.read().decode('utf-8')).get('access')

    toggle_url = 'https://bursary.skysoftsystems.co.ke/api/v1/applications/toggle_window/'
    toggle_data = json.dumps({'is_window_open': False}).encode('utf-8')
    toggle_headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }

    t_req = urllib.request.Request(toggle_url, data=toggle_data, headers=toggle_headers, method='POST')
    with urllib.request.urlopen(t_req, context=ctx) as t_res:
        print("SUCCESS:", t_res.read().decode('utf-8'))

except urllib.error.HTTPError as e:
    body = e.read().decode('utf-8', errors='ignore')
    for line in body.splitlines():
        if 'Exception' in line or 'column' in line or 'Table' in line or 'table' in line or 'django.db' in line or 'ProgrammingError' in line:
            print("MATCH:", line[:200])
