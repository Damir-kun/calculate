import os
from dotenv import load_dotenv
import uvicorn
from config import API_HOST, API_PORT, API_RELOAD

# Загрузка переменных окружения
load_dotenv()

if __name__ == "__main__":
    uvicorn.run("main:app", host=API_HOST, port=API_PORT, reload=API_RELOAD, workers=4) 
    