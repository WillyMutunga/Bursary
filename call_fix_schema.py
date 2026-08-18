import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

login_url = 'https://bursary.skysoftsystems.co.ke/api/v1/auth/login/'
login_data = json.dumps({'username': 'admin', 'password': 'admin123'}).encode('utf-8')
headers = {'Content-Type': 'application/json'}

req = urllib.request.Request(login_url, data=login_data, headers=headers, method='POST')

with urllib.request.urlopen(req, context=ctx) as res:
    token = json.loads(res.read().decode('utf-8')).get('access')

# 1. GET budget
b_req = urllib.request.Request('https://bursary.skysoftsystems.co.ke/api/v1/applications/budget/', headers={'Authorization': f'Bearer {token}'})
with urllib.request.urlopen(b_req, context=ctx) as b_res:
    print("GET BUDGET RESULT:", b_res.read().decode('utf-8'))

# 2. Toggle to False
t1_req = urllib.request.Request('https://bursary.skysoftsystems.co.ke/api/v1/applications/toggle_window/', data=json.dumps({'is_window_open': False}).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}, method='POST')
with urllib.request.urlopen(t1_req, context=ctx) as t1_res:
    print("TOGGLE FALSE RESULT:", t1_res.read().decode('utf-8'))

# 3. GET budget after False
with urllib.request.urlopen(b_req, context=ctx) as b_res:
    print("GET BUDGET AFTER FALSE:", b_res.read().decode('utf-8'))

# 4. Toggle to True
t2_req = urllib.request.Request('https://bursary.skysoftsystems.co.ke/api/v1/applications/toggle_window/', data=json.dumps({'is_window_open': True}).encode('utf-8'), headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}, method='POST')
with urllib.request.urlopen(t2_req, context=ctx) as t2_res:
    print("TOGGLE TRUE RESULT:", t2_res.read().decode('utf-8'))
