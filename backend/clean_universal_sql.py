import os

def sanitize_sql():
    sql_path = r"C:\Users\hp\Desktop\Bursary\ng_cdfbursary.sql"
    print("Sanitizing ng_cdfbursary.sql for universal PostgreSQL version compatibility...")
    
    with open(sql_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    clean_lines = []
    for line in lines:
        stripped = line.strip()
        # Remove version-specific SET commands and pg_catalog calls
        if (stripped.startswith('SET ') or 
            stripped.startswith('SELECT pg_catalog') or 
            stripped.startswith('\\')):
            continue
        clean_lines.append(line)
        
    with open(sql_path, 'w', encoding='utf-8') as f:
        f.writelines(clean_lines)
        
    print(f"[SUCCESS] Universal SQL dump generated at: {sql_path}")
    print(f"File size: {os.path.getsize(sql_path)} bytes")

if __name__ == '__main__':
    sanitize_sql()
