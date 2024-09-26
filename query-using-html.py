import os
from dotenv import load_dotenv
from openai import OpenAI
import textwrap
import re
from typing import List, Dict
import logging
import html2text
from bs4 import BeautifulSoup
from langchain_community.document_loaders import BSHTMLLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()

# Check if OPENAI_API_KEY is set
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY is not set in the environment variables")

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize OpenAI embeddings
try:
    embeddings = OpenAIEmbeddings()
except Exception as e:
    logging.error(f"Failed to initialize OpenAI embeddings: {e}")
    raise

def process_html_file(file_path: str) -> str:
    """
    Process the HTML file and return its content as plain text.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            html_content = file.read()
        
        # Use html2text to convert HTML to plain text
        h = html2text.HTML2Text()
        h.ignore_links = True
        h.ignore_images = True
        plain_text = h.handle(html_content)
        
        return plain_text
    except Exception as e:
        logging.error(f"Error processing HTML file: {e}")
        return ""

def create_vector_store(text_content: str) -> FAISS:
    """
    Create a vector store from the text content.
    """
    try:
        # Split the text into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_text(text_content)
        
        # Create the vector store
        vectorstore = FAISS.from_texts(chunks, embeddings)
        return vectorstore
    except Exception as e:
        logging.error(f"Error creating vector store: {e}")
        return None

def query_vectorstore(vectorstore: FAISS, query: str, k: int = 5) -> List[Dict]:
    """
    Query the vector store and return results.
    """
    try:
        results = vectorstore.similarity_search(query, k=k)
        return results
    except Exception as e:
        logging.error(f"Error querying vector store: {e}")
        return []

def format_result(result: Dict, index: int) -> str:
    """
    Format a single result for display.
    """
    wrapped_content = textwrap.fill(result.page_content, width=80)
    return f"""
Result {index}:
{'-' * 80}
Content:
{wrapped_content}
{'-' * 80}
"""

def openai_generate_answer(excerpts: List[Dict], query: str) -> str:
    """
    Use OpenAI to generate an answer based on the retrieved excerpts and the query.
    """
    prompt = (
        f"Provide a detailed answer to the following question based on the given excerpts. "
        f"Focus on accuracy and relevant information. "
        f"If the information is incomplete, clearly state what additional details are needed.\n\n"
        f"Question: {query}\n\n"
        f"Excerpts:\n"
    )
    for i, excerpt in enumerate(excerpts, 1):
        prompt += f"Excerpt {i}:\n{excerpt.page_content}\n\n"
    
    prompt += (
        "Provide your answer in the following structure:\n"
        "1. Direct Answer\n"
        "2. Explanation\n"
        "3. Additional Information (if applicable)\n"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert providing accurate and detailed information."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logging.error(f"Error generating response from OpenAI: {e}")
        return None

def main():
    print("Welcome to the HTML Query Interface!")
    print("Please provide the path to your HTML file.")
    
    html_file_path = input("Enter the path to your HTML file: ").strip()
    
    if not os.path.exists(html_file_path):
        print("The specified file does not exist. Please check the path and try again.")
        return
    
    print("Processing HTML file...")
    text_content = process_html_file(html_file_path)
    
    if not text_content:
        print("Failed to process the HTML file. Please check the file and try again.")
        return
    
    print("Creating vector store...")
    vectorstore = create_vector_store(text_content)
    
    if not vectorstore:
        print("Failed to create vector store. Please try again.")
        return
    
    print("Vector store created successfully. You can now ask questions about the content.")
    print("Type 'quit' to exit the program.\n")

    while True:
        user_query = input("Enter your query: ").strip()
        
        if user_query.lower() == 'quit':
            print("Thank you for using the HTML Query Interface. Goodbye!")
            break
        
        if not user_query:
            print("Please enter a valid query.")
            continue
        
        results = query_vectorstore(vectorstore, user_query)
        
        if results:
            print("\nRelevant excerpts from the document:")
            for i, result in enumerate(results, 1):
                print(format_result(result, i))
            
            openai_answer = openai_generate_answer(results, user_query)
            
            if openai_answer:
                print("\nGenerated Answer:\n")
                print(openai_answer)
            else:
                print("\nI apologize, but I couldn't generate a comprehensive answer at this time. Please consult the provided excerpts or rephrase your query.")
            
            print("\nDisclaimer: This information is based on the available excerpts. Always refer to the complete, up-to-date documentation for official guidance.")
        else:
            print("I couldn't find relevant information for your query. Please try rephrasing your question.")
        
        print("\nWould you like to ask another question? (Type 'quit' to exit)")

if __name__ == "__main__":
    main()