import sqlite3
import os
import json
from datetime import datetime
from typing import List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "aura_fashion.db")

def init_db():
    """Initialize the SQLite database and create tables if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Table for sourced images (Step 2)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sourcing_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prompt TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            images_json TEXT NOT NULL
        )
    ''')

    # Table for generated assets (Step 3)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS generation_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prompt TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            assets_json TEXT NOT NULL
        )
    ''')

    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")

def save_sourcing_record(prompt: str, images_data: List[Dict[str, Any]]):
    """Save the results of image sourcing to the database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO sourcing_history (prompt, timestamp, images_json) VALUES (?, ?, ?)',
            (prompt, datetime.now().isoformat(), json.dumps(images_data, ensure_ascii=False))
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error saving sourcing record: {e}")

def save_generation_record(prompt: str, assets_data: Dict[str, Any]):
    """Save the results of generated assets to the database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO generation_history (prompt, timestamp, assets_json) VALUES (?, ?, ?)',
            (prompt, datetime.now().isoformat(), json.dumps(assets_data, ensure_ascii=False))
        )
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error saving generation record: {e}")

def get_generation_history() -> List[Dict[str, Any]]:
    """Retrieve all generation history records."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT id, prompt, timestamp, assets_json FROM generation_history ORDER BY timestamp DESC')
        rows = cursor.fetchall()
        
        history = []
        for row in rows:
            history.append({
                "id": row["id"],
                "prompt": row["prompt"],
                "timestamp": row["timestamp"],
                "assets_json": json.loads(row["assets_json"])
            })
            
        conn.close()
        return history
    except Exception as e:
        print(f"Error fetching generation history: {e}")
        return []
