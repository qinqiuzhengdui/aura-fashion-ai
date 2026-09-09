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

    # Table for datasets (Admin dataset management)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS datasets (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            version TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            images_json TEXT NOT NULL,
            texts_json TEXT NOT NULL,
            sample_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Table for RAG indexes and training models
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS rag_indexes (
            id TEXT PRIMARY KEY,
            dataset_id TEXT NOT NULL,
            name TEXT NOT NULL,
            model_type TEXT NOT NULL,
            chunk_size INTEGER DEFAULT 500,
            chunk_overlap INTEGER DEFAULT 50,
            chunks_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'training',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dataset_id) REFERENCES datasets (id)
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

# ==================== DATASET & RAG DATABASE OPERATIONS ====================

def save_dataset(dataset_id: str, name: str, version: str, category: str, description: str, images: list, texts: list):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        sample_count = len(images) + len(texts)
        cursor.execute(
            '''INSERT OR REPLACE INTO datasets 
               (id, name, version, category, description, images_json, texts_json, sample_count, created_at) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (
                dataset_id, name, version, category, description,
                json.dumps(images, ensure_ascii=False),
                json.dumps(texts, ensure_ascii=False),
                sample_count,
                datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            )
        )
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error saving dataset: {e}")
        return False

def get_datasets() -> List[Dict[str, Any]]:
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM datasets ORDER BY created_at DESC')
        rows = cursor.fetchall()
        
        datasets = []
        for row in rows:
            datasets.append({
                "id": row["id"],
                "name": row["name"],
                "version": row["version"],
                "category": row["category"],
                "description": row["description"],
                "images": json.loads(row["images_json"]),
                "texts": json.loads(row["texts_json"]),
                "sample_count": row["sample_count"],
                "created_at": row["created_at"]
            })
        conn.close()
        return datasets
    except Exception as e:
        print(f"Error fetching datasets: {e}")
        return []

def delete_dataset(dataset_id: str) -> bool:
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM datasets WHERE id = ?', (dataset_id,))
        cursor.execute('DELETE FROM rag_indexes WHERE dataset_id = ?', (dataset_id,))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error deleting dataset: {e}")
        return False

def save_rag_index(index_id: str, dataset_id: str, name: str, model_type: str, chunk_size: int, chunk_overlap: int, chunks_count: int, status: str = 'ready'):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            '''INSERT OR REPLACE INTO rag_indexes 
               (id, dataset_id, name, model_type, chunk_size, chunk_overlap, chunks_count, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (
                index_id, dataset_id, name, model_type, chunk_size, chunk_overlap, chunks_count, status,
                datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            )
        )
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error saving rag index: {e}")
        return False

def get_rag_indexes() -> List[Dict[str, Any]]:
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('''
            SELECT r.*, d.name as dataset_name 
            FROM rag_indexes r 
            LEFT JOIN datasets d ON r.dataset_id = d.id 
            ORDER BY r.created_at DESC
        ''')
        rows = cursor.fetchall()
        
        indexes = []
        for row in rows:
            indexes.append({
                "id": row["id"],
                "dataset_id": row["dataset_id"],
                "dataset_name": row["dataset_name"],
                "name": row["name"],
                "model_type": row["model_type"],
                "chunk_size": row["chunk_size"],
                "chunk_overlap": row["chunk_overlap"],
                "chunks_count": row["chunks_count"],
                "status": row["status"],
                "created_at": row["created_at"]
            })
        conn.close()
        return indexes
    except Exception as e:
        print(f"Error fetching rag indexes: {e}")
        return []

