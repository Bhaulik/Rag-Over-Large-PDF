import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import html2text
from bs4 import BeautifulSoup
from typing import List, Dict
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
import logging

app = FastAPI()

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY is not set in the environment variables")

client = OpenAI(api_key=openai_api_key)

# Initialize OpenAI embeddings
embeddings = OpenAIEmbeddings()

# Global variable to store the vector store
vectorstore = None

class Query(BaseModel):
    query: str

def process_html_file(file_path: str) -> (str, Dict[str, str]):
    """
    Process an HTML file, converting it to plain text and creating a reference dictionary.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            html_content = file.read()
        
        soup = BeautifulSoup(html_content, 'html.parser')
        headers = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        reference_dict = {header.get_text().strip(): header.name + " " + header.get_text().strip() for header in headers}
        
        h = html2text.HTML2Text()
        h.ignore_links = True
        h.ignore_images = True
        plain_text = h.handle(html_content)
        
        return plain_text, reference_dict
    except Exception as e:
        logging.error(f"Error processing HTML file: {e}")
        raise HTTPException(status_code=500, detail="Error processing HTML file")

def create_vector_store(text_content: str, reference_dict: Dict[str, str]) -> FAISS:
    """
    Create a vector store from the text content with metadata.
    """
    try:
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_text(text_content)
        
        documents = []
        current_reference = None
        
        for chunk in chunks:
            metadata = {}
            for key, value in reference_dict.items():
                if key in chunk:
                    current_reference = value
                    break
            
            if current_reference:
                metadata['reference'] = current_reference
            
            documents.append({"content": chunk, "metadata": metadata})
        
        vectorstore = FAISS.from_texts([doc["content"] for doc in documents], embeddings, metadatas=[doc["metadata"] for doc in documents])
        return vectorstore
    except Exception as e:
        logging.error(f"Error creating vector store: {e}")
        raise HTTPException(status_code=500, detail="Error creating vector store")

def query_vectorstore(query: str, k: int = 5):
    """
    Query the vector store and retrieve relevant results.
    """
    global vectorstore
    if not vectorstore:
        raise HTTPException(status_code=500, detail="Vector store not initialized")
    
    try:
        results = vectorstore.similarity_search(query, k=k)
        return results
    except Exception as e:
        logging.error(f"Error querying vector store: {e}")
        raise HTTPException(status_code=500, detail="Error querying vector store")

def openai_generate_answer(excerpts: List[Dict], query: str) -> str:
    """
    Use OpenAI to generate an answer based on retrieved excerpts and the user's query.
    """
    try:
        prompt = (
            f"Provide a detailed answer to the following question based on the given excerpts. "
            f"Focus on accuracy and relevant information. "
            f"If the information is incomplete, clearly state what additional details are needed. "
            f"Include a relevant example if possible.\n\n"
            f"Question: {query}\n\n"
            f"Excerpts:\n"
        )
        for i, excerpt in enumerate(excerpts, 1):
            reference = excerpt.metadata.get('reference', 'No reference available')
            prompt += f"Excerpt {i} (Reference: {reference}):\n{excerpt.page_content}\n\n"
        
        prompt += (
            "Provide your answer in the following structure:\n"
            "1. Direct Answer\n"
            "2. Explanation\n"
            "3. Relevant Example (if applicable)\n"
            "4. Additional Information (if applicable)\n"
            "5. References (cite the relevant excerpt references)\n"
        )

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert providing accurate and detailed information with relevant examples."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logging.error(f"Error generating response from OpenAI: {e}")
        raise HTTPException(status_code=500, detail="Error generating response from OpenAI")

@app.on_event("startup")
async def startup_event():
    """
    Initialize the vector store at startup by loading and processing an HTML file.
    """
    global vectorstore
    html_file_path = "Income Tax Act.html"  # Replace with the actual path

    try:
        text_content, reference_dict = process_html_file(html_file_path)
        vectorstore = create_vector_store(text_content, reference_dict)
        logging.info("Vector store initialized successfully.")
    except HTTPException as e:
        logging.error(f"Startup error: {e.detail}")
        raise

@app.post("/query")
async def query(query: Query):
    """
    Handle user query and return generated answer along with relevant excerpts.
    """
    try:
        results = query_vectorstore(query.query)
        answer = openai_generate_answer(results, query.query)
        return {
            "answer": answer, 
            "excerpts": [
                {"content": r.page_content, "reference": r.metadata.get('reference', 'No reference available')} 
                for r in results
            ]
        }
    except HTTPException as e:
        logging.error(f"Query error: {e.detail}")
        raise e

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
