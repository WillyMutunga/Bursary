import subprocess
import os

def export_pg_sql():
    sql_path = r"C:\Users\hp\Desktop\Bursary\ng_cdfbursary.sql"
    print("Generating PostgreSQL .sql database import file...")
    
    # Try pg_dump via subprocess with environment password
    env = os.environ.copy()
    env['PGPASSWORD'] = 'William#20'
    
    # Search common Postgres installation paths if pg_dump is not in PATH
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

    cmd = f'{pg_dump_cmd} -U postgres -h localhost -p 5432 -d ng_cdfbursary --clean --if-exists -f "{sql_path}"'
    
    try:
        res = subprocess.run(cmd, env=env, shell=True, capture_output=True, text=True)
        if res.returncode == 0:
            print(f"[SUCCESS] Exported PostgreSQL database to: {sql_path}")
            print(f"File size: {os.path.getsize(sql_path)} bytes")
        else:
            print(f"[ERROR] pg_dump failed: {res.stderr}")
    except Exception as e:
        print(f"[ERROR] Exception during export: {e}")

if __name__ == '__main__':
    export_pg_sql()
