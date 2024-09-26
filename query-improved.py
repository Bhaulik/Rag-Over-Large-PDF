import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from openai import OpenAI
import textwrap
import re
from typing import List, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load environment variables
load_dotenv()

# Check if OPENAI_API_KEY is set
if not os.getenv("OPENAI_API_KEY"):
    raise ValueError("OPENAI_API_KEY is not set in the environment variables")

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Pinecone
try:
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = "pdf-embeddings"
    index = pc.Index(index_name)
except Exception as e:
    logging.error(f"Failed to initialize Pinecone: {e}")
    raise

# Initialize OpenAI embeddings
try:
    embeddings = OpenAIEmbeddings()
except Exception as e:
    logging.error(f"Failed to initialize OpenAI embeddings: {e}")
    raise

# Initialize Pinecone vector store
vectorstore = PineconeVectorStore(index=index, embedding=embeddings)

def query_vectorstore(query: str, k: int = 5) -> List[Dict]:
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
Metadata: {result.metadata}
"""

def openai_generate_answer(excerpts: List[Dict], query: str) -> str:
    """
    Use OpenAI to generate an accountant-focused answer based on the retrieved excerpts and the query.
    """
    prompt = (
        f"As an expert accountant, provide a precise and detailed answer to the following question based on the given excerpts. "
        f"Focus on accuracy, relevant financial regulations, and practical implications. "
        f"Include specific references to sections or paragraphs when applicable. "
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
        "3. Relevant Regulations or Sections\n"
        "4. Practical Implications\n"
        "5. Additional Information Needed (if applicable)\n"
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert accountant providing accurate and detailed information."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.2
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logging.error(f"Error generating response from OpenAI: {e}")
        return None

def extract_section_numbers(text: str) -> List[str]:
    """
    Extract section numbers from the text.
    """
    pattern = r'section (\d+(\.\d+)*)'
    return re.findall(pattern, text.lower())

def main():
    print("Welcome to the Accountant's PDF Query Interface!")
    print("You can ask detailed questions about financial regulations and accounting practices.")
    print("Type 'quit' to exit the program.\n")

    while True:
        user_query = input("Enter your accounting query: ").strip()
        
        if user_query.lower() == 'quit':
            print("Thank you for using the Accountant's PDF Query Interface. Goodbye!")
            break
        
        if not user_query:
            print("Please enter a valid query.")
            continue
        
        # Extract section numbers from the query
        sections = extract_section_numbers(user_query)
        if sections:
            print(f"Detected section numbers: {', '.join(section[0] for section in sections)}")
        
        results = query_vectorstore(user_query)
        
        if results:
            print("\nRelevant excerpts from the document:")
            for i, result in enumerate(results, 1):
                print(format_result(result, i))
            
            openai_answer = openai_generate_answer(results, user_query)
            
            if openai_answer:
                print("\nExpert Accountant's Analysis:\n")
                print(openai_answer)
                
                # Highlight any mentioned sections
                mentioned_sections = extract_section_numbers(openai_answer)
                if mentioned_sections:
                    print("\nKey Sections Mentioned:")
                    for section in mentioned_sections:
                        print(f"- Section {section[0]}")
            else:
                print("\nI apologize, but I couldn't generate a comprehensive answer at this time. Please consult the provided excerpts or rephrase your query.")
            
            print("\nDisclaimer: This information is based on the available excerpts. Always refer to the complete, up-to-date documentation for official guidance.")
        else:
            print("I couldn't find relevant information for your query. Please try rephrasing or specifying any particular sections you're interested in.")
        
        print("\nWould you like to ask another accounting question? (Type 'quit' to exit)")

if __name__ == "__main__":
    main()