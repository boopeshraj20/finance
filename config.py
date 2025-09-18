import os
from dotenv import load_dotenv

load_dotenv()

# App Configuration
APP_TITLE = "Financial Advisor Chatbot"
PAGE_ICON = "💰"

# NLP Model Configuration
NLP_MODEL_NAME = "microsoft/DialoGPT-medium"
FINANCIAL_MODEL_NAME = "deepset/roberta-base-squad2"

# Data paths
DATA_DIR = "data"
SAMPLE_DATA_PATH = os.path.join(DATA_DIR, "sample_data.json")
INTENTS_PATH = os.path.join(DATA_DIR, "intents.json")