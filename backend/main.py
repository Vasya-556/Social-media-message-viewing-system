import uvicorn
from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import sqlite3
import bcrypt
import secrets
from telethon import TelegramClient, errors

app = FastAPI()
load_dotenv() 

api_id = int(os.getenv("API_ID"))
api_hash = os.getenv("API_HASH")

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    conn = sqlite3.connect("users.db")
    conn.row_factory = sqlite3.Row  
    return conn

@app.on_event("startup")
def startup():
    conn = get_db_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            session_token TEXT DEFAULT NULL,
            phone TEXT DEFAULT NULL,
            telegram_username TEXT DEFAULT NULL,
            telegram_code TEXT DEFAULT NULL
        )
        """
    )
    conn.commit()
    conn.close()

class User(BaseModel):
    name: str
    username: str
    phone: str

class UserSignup(BaseModel):
    username: str
    password: str

class UserSignin(BaseModel):
    username: str
    password: str

# class TelegramConnection(BaseModel):
#     telegram_username: str
#     telegram_phone: str
#     telegram_code: str  

class ReceiveCodeRequest(BaseModel):
    telegram_username: str
    telegram_phone: str

class EnterCodeRequest(BaseModel):
    telegram_username: str
    telegram_phone: str
    code: str
    phone_code_hash: str

class EnterPasswordRequest(BaseModel):
    telegram_username: str
    password: str

class FetchDataRequest(BaseModel):
    telegram_username: str

@app.post("/signup")
def signup(user: UserSignup):
    conn = get_db_connection()
    cursor = conn.cursor()
    password_hash = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()

    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (user.username, password_hash)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")

    conn.close()
    return {"message": "User created successfully"}

@app.post("/signin")
def signin(user: UserSignin):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (user.username,))
    db_user = cursor.fetchone()

    if db_user is None or not bcrypt.checkpw(user.password.encode(), db_user["password_hash"].encode()):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = secrets.token_hex(16)
    cursor.execute("UPDATE users SET session_token = ? WHERE id = ?", (token, db_user["id"]))
    conn.commit()
    conn.close()
    
    telegram_username = db_user.get("telegram_username") if "telegram_username" in db_user else None

    return {
        "message": "Signed in successfully",
        "token": token,
        "telegram_username": telegram_username
    }

@app.post("/logout")
def logout(Authorization: str = Header(None)):
    if not Authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE session_token = ?", (Authorization,))
    user = cursor.fetchone()

    if user is None:
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid token")

    cursor.execute("UPDATE users SET session_token = NULL WHERE id = ?", (user["id"],))
    conn.commit()
    conn.close()
    return {"message": "Logged out successfully"}
    
@app.get("/token_check")
def get_current_user(Authorization: str = Header(None)):
    if not Authorization:
        raise HTTPException(status_code=401, detail="Missing token")

    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE session_token = ?", (Authorization,)).fetchone()
    conn.close()
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    return {"username": user["username"], "phone": user["phone"]}

@app.post("/receive_code")
async def receive_code(data: ReceiveCodeRequest):
    client = TelegramClient(f'session_{data.telegram_username}', api_id, api_hash)
    await client.connect()

    try:
        sent = await client.send_code_request(data.telegram_phone)
    except errors.ApiIdInvalidError:
        await client.disconnect()
        raise HTTPException(status_code=400, detail="Invalid API ID or hash")

    await client.disconnect()
    return {"phone_code_hash": sent.phone_code_hash}

@app.post("/enter_code")
async def enter_code(data: EnterCodeRequest):
    client = TelegramClient(f'session_{data.telegram_username}', api_id, api_hash)
    await client.connect()

    try:
        await client.sign_in(data.telegram_phone, data.code, phone_code_hash=data.phone_code_hash)
    except errors.SessionPasswordNeededError:
        await client.disconnect()
        raise HTTPException(status_code=400, detail="Two-factor auth password required")
    except errors.PhoneCodeInvalidError:
        await client.disconnect()
        raise HTTPException(status_code=400, detail="Invalid code")

    me = await client.get_me()
    await client.disconnect()

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE users SET telegram_username = ? WHERE username = ?",
        (me.username, data.telegram_username)
    )
    conn.commit()
    conn.close()

    return {"message": f"Logged in as {me.username}"}

@app.post("/enter_password")
async def enter_password(data: EnterPasswordRequest):
    client = TelegramClient(f'session_{data.telegram_username}', api_id, api_hash)
    await client.connect()
    try:
        await client.sign_in(password=data.password)
        me = await client.get_me()
    except Exception as e:
        await client.disconnect()
        raise HTTPException(status_code=400, detail=str(e))
    await client.disconnect()
    return {"message": f"Logged in with 2fa as {me.username}"}

@app.post("/fetch_chats_messages")
async def fetch_chats_messages(data: FetchDataRequest): 
    client = TelegramClient(f'session_{data.telegram_username}', api_id, api_hash)
    await client.start() 

    dialogs = await client.get_dialogs()
    all_data = {}

    for dialog in dialogs:
        chat_title = dialog.name or dialog.title or str(dialog.id)
        messages = []
        async for message in client.iter_messages(dialog.id, limit=100):  
            messages.append({
                "id": message.id,
                "date": message.date.isoformat(),
                "sender_id": message.sender_id,
                "message": message.message,
            })
        all_data[chat_title] = messages

    await client.disconnect()
    return all_data

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)