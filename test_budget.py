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

b_req = urllib.request.Request('https://bursary.skysoftsystems.co.ke/api/v1/applications/budget/', headers={'Authorization': f'Bearer {token}'})

try:
    with urllib.request.urlopen(b_req, context=ctx) as b_res:
        print("BUDGET OK:", b_res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    html = e.read().decode('utf-8', errors='ignore')
    import re
    matches = re.findall(r'<pre class="exception_value">(.*?)</pre>', html, re.DOTALL)
    print("EXCEPTION VALUES:", matches)
    matches_type = re.findall(r'<th>Exception Type:</th>\s*<td>(.*?)</td>', html, re.DOTALL)
    print("EXCEPTION TYPES:", matches_type)
