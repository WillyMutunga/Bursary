import os

frontend_src = r'C:\Users\hp\Desktop\Bursary\frontend\src'

target_files = [
    r'components\AnalyticsCharts.jsx',
    r'components\AwardLetterModal.jsx',
    r'components\NotificationCenter.jsx',
    r'pages\admin\AdminDashboard.jsx',
    r'pages\applicant\ApplicationWizard.jsx',
    r'pages\applicant\Dashboard.jsx',
    r'pages\committee\CommitteeDashboard.jsx',
    r'pages\finance\FinanceDashboard.jsx',
    r'pages\public\Home.jsx',
    r'pages\public\Login.jsx',
    r'pages\public\Register.jsx'
]

for rel_path in target_files:
    full_path = os.path.join(frontend_src, rel_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        depth = len(rel_path.split(os.sep)) - 1
        import_path = '../' * depth + 'config'
        
        if 'API_BASE_URL' not in content:
            content = f"import API_BASE_URL from '{import_path}';\n" + content
        
        content = content.replace("'http://localhost:8000", "API_BASE_URL + '")
        content = content.replace('"http://localhost:8000', 'API_BASE_URL + "')
        content = content.replace('http://localhost:8000', '${API_BASE_URL}')
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {rel_path}")

print("All frontend files updated to use dynamic API_BASE_URL!")
