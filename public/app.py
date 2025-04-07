import os
import logging
import uvicorn
import requests
from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from bs4 import BeautifulSoup
from langchain_community.vectorstores import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.schema import Document
from requests.exceptions import ConnectTimeout, HTTPError
import time
from typing import Optional

# Load environment variables
load_dotenv()

app = FastAPI()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500"],  # Add your frontend's origin here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHROMA_BASE_PATH = "chroma_db"
WEBSITE_URL = "https://insomniacs.in/"  # Replace with the specific website URL

google_embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=1.0)

# Global state for the vector store
vector_store = None

# -------- Models --------
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None  # Add this field

class Message(BaseModel):
    role: str
    content: str
    

class Conversation(BaseModel):
    messages: list[Message] = []

conversation_memory = {}  # { conversation_id: Conversation }

# -------- Utility Functions --------
def fetch_website_content(url: str) -> str:
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
    except ConnectTimeout:
        logger.error(f"Connection to {url} timed out.")
        return None
    except HTTPError as http_err:
        logger.error(f"HTTP error occurred: {http_err}")
        return None
    except Exception as err:
        logger.error(f"An error occurred: {err}")
        return None
    soup = BeautifulSoup(response.text, "html.parser")
    return soup.get_text()

def initialize_vector_store():
    global vector_store
    chroma_path = f"{CHROMA_BASE_PATH}/default"
    os.makedirs(chroma_path, exist_ok=True)

    # Create or reset Chroma collection
    vector_store = Chroma(
        collection_name="default_collection",
        embedding_function=google_embeddings,
        persist_directory=chroma_path,
    )
    vector_store.reset_collection()

    # Scrape website and add content to the vector store
    website_text = fetch_website_content(WEBSITE_URL)
    if not website_text:
        logger.error("Failed to scrape website content.")
        return

    doc = Document(page_content=website_text, metadata={"source": WEBSITE_URL})
    vector_store.add_documents([doc])
    logger.info(f"Stored website data for {WEBSITE_URL} in ChromaDB.")

# Initialize the vector store on startup
initialize_vector_store()

# -------- Endpoints --------
@app.post("/chat")
async def chat_with_bot(data: ChatRequest):
    if not vector_store:
        return {"status": "error", "message": "Vector store not initialized."}

    # Use the provided conversation_id or generate a default one
    conversation_id = data.conversation_id or "default"

    if conversation_id not in conversation_memory:
        conversation_memory[conversation_id] = Conversation(messages=[])

    conversation = conversation_memory[conversation_id]
    conversation.messages.append(Message(role="user", content=data.message))

    retriever = vector_store.as_retriever(search_kwargs={'k': 5})
    docs = retriever.get_relevant_documents(data.message)
    knowledge = "\n\n".join([doc.page_content for doc in docs])

    prompt_template = """
    You are an AI assistant that answers queries based on scraped website data.
    Use the website knowledge and conversation context to provide helpful answers.

    Website Knowledge:
    {knowledge}

    Previous Conversation:
    {previous_conversation}

    User Message:
    {user_message}
    """
    previous_conversation = '\n'.join([f'{msg.role}: {msg.content}' for msg in conversation.messages[-5:]])
    prompt = prompt_template.format(
        knowledge=knowledge,
        previous_conversation=previous_conversation,
        user_message=data.message
    )

    response = ""
    for chunk in llm.stream(prompt):
        if chunk.content:
            response += chunk.content

    conversation.messages.append(Message(role="assistant", content=response))
    return {"status": "success", "response": response or "No AI response generated."}


@app.get("/health")
async def health_check():
    """Health check endpoint to verify the API is running."""
    return {"status": "ok", "message": "API is operational"}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=5000)
