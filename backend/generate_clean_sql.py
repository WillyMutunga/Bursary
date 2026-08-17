import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

def export_clean_sql():
    sql_path = r"C:\Users\hp\Desktop\Bursary\ng_cdfbursary.sql"
    print("Generating pure standard SQL dump for phpPgAdmin / cPanel import...")

    # We will use Django's sqlmigrate or direct dump via cursor/pg_dump flags
    import subprocess
    env = os.environ.copy()
    env['PGPASSWORD'] = 'William#20'

    # pg_dump with --inserts and --no-owner --no-privileges to ensure clean SQL statements
    pg_dump_cmd = "pg_dump"
    possible_paths = [
        r"C:\Program Files\PostgreSQL\17\bin\pg_dump.exe",
        r"C:\Program Files\PostgreSQL\16\bin\pg_dump.exe",
        r"C:\Program Files\PostgreSQL\15\bin\pg_dump.exe",
        r"C:\Program Files\PostgreSQL\14\bin\pg_dump.exe",
        r"C:\Program Files\PostgreSQL\13\bin\pg_dump.exe",
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            pg_dump_cmd = f'"{path}"'
            break

    # --inserts creates standard INSERT INTO statements
    # --no-owner and --no-acl removes ownership/permission commands
    cmd = f'{pg_dump_cmd} -U postgres -h localhost -p 5432 -d ng_cdfbursary --inserts --no-owner --no-acl -f "{sql_path}"'
    
    res = subprocess.run(cmd, env=env, shell=True, capture_output=True, text=True)
    if res.returncode == 0:
        # Filter out any lingering backslash commands (\restrict, \connect, \set, \.)
        with open(sql_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        clean_lines = []
        for line in lines:
            stripped = line.strip()
            if stripped.startswith('\\') or stripped.startswith('--') and 'psql' in stripped:
                continue
            clean_lines.append(line)
        
        with open(sql_path, 'w', encoding='utf-8') as f:
            f.writelines(clean_lines)
            
        print(f"[SUCCESS] Clean SQL export generated at: {sql_path}")
        print(f"File size: {os.path.getsize(sql_path)} bytes")
    else:
        print(f"[ERROR] pg_dump failed: {res.stderr}")

if __name__ == '__main__':
    export_clean_sql()
