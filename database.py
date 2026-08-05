import sqlite3

conn = sqlite3.connect("jaltantra.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS reports(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT,
    roof REAL,
    rainfall REAL,
    harvested REAL,
    tank REAL,
    soil TEXT,
    groundwater TEXT,
    structure TEXT,
    cost REAL,
    subsidy REAL,
    finalcost REAL
)
""")

conn.commit()
conn.close()

print("Database Created Successfully")