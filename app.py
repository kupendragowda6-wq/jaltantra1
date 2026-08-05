from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import sqlite3
import os

app = FastAPI()

app.mount("/static", StaticFiles(directory="frontend"), name="static")


@app.get("/")
def home():
    return FileResponse(os.path.join("frontend", "index.html"))


@app.post("/save-report")
async def save_report(request: Request):

    data = await request.json()

    conn = sqlite3.connect("jaltantra.db")
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO reports
        (
            location,
            roof,
            rainfall,
            harvested,
            tank,
            soil,
            groundwater,
            structure,
            cost,
            subsidy,
            finalcost
        )

        VALUES (?,?,?,?,?,?,?,?,?,?,?)

    """,
    (
        data["location"],
        data["roof"],
        data["rainfall"],
        data["harvested"],
        data["tank"],
        data["soil"],
        data["groundwater"],
        data["structure"],
        data["cost"],
        data["subsidy"],
        data["finalcost"]
    ))

    conn.commit()
    conn.close()

    return {"message": "Saved Successfully"}

@app.get("/history")
def history():

    conn = sqlite3.connect("jaltantra.db")
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM reports
        ORDER BY id DESC
    """)

    data = cursor.fetchall()

    conn.close()

    return [dict(row) for row in data]