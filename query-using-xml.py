import os
from dotenv import load_dotenv
from openai import OpenAI
import textwrap
import logging
import xml.etree.ElementTree as ET
from typing import Tuple, Dict, List
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter

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

def process_xml_file(file_path: str) -> Tuple[str, Dict[str, str]]:
    """
    Process the XML file and return its content as plain text along with a reference dictionary.
    """
    try:
        tree = ET.parse(file_path)
        root = tree.getroot()

        plain_text = []
        reference_dict = {}

        for elem in root.iter():
            if elem.tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
                header_text = elem.text.strip() if elem.text else ''
                reference_dict[header_text] = f"{elem.tag} {header_text}"
            if elem.text:
                plain_text.append(elem.text.strip())

        plain_text = "\n".join(plain_text)
        
        return plain_text, reference_dict
    except Exception as e:
        logging.error(f"Error processing XML file: {e}")
        return "", {}

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
            logging.debug(f"Chunk: {chunk[:100]}... assigned to reference: {current_reference}")
        
        vectorstore = FAISS.from_texts([doc["content"] for doc in documents], embeddings, metadatas=[doc["metadata"] for doc in documents])
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
    reference = result.metadata.get('reference', 'No reference available')
    logging.debug(f"Formatted result with reference: {reference}")
    return f"""
Result {index}:
{'-' * 80}
Content:
{wrapped_content}

Reference: {reference}
{'-' * 80}
"""

def refine_query(query: str) -> str:
    """
    Use OpenAI to refine the user's query for optimal vector database search.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": (
                    "You are an AI assistant specializing in optimizing queries for vector database searches in tax documents. "
                    "Your task is to refine user queries to improve search results. Follow these guidelines:\n"
                    "1. Identify and focus on key tax-related terms and concepts.\n"
                    "2. Remove any conversational language or filler words.\n"
                    "3. Use specific technical terms that are likely to appear in tax documents.\n"
                    "4. Phrase the query in a way that matches how information might be stated in a formal tax document.\n"
                    "5. If the original query is vague, make educated guesses about what specific information the user might be looking for.\n"
                    "6. Limit the refined query to 2-3 sentences maximum for optimal search performance."
                )},
                {"role": "user", "content": f"Refine this query for searching a tax document: {query}"}
            ],
            max_tokens=150,
            temperature=0.7
        )
        refined_query = response.choices[0].message.content.strip()
        logging.info(f"Original query: {query}")
        logging.info(f"Refined query: {refined_query}")
        return refined_query
    except Exception as e:
        logging.error(f"Error refining query with OpenAI: {e}")
        return query

def extract_search_terms(refined_query: str) -> str:
    """
    Extract key search terms from the refined query for vector search.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": (
                    "You are an AI assistant tasked with extracting key search terms from a refined query. "
                    "Your goal is to identify the most important words or phrases that will yield the best results in a vector database search. "
                    "Focus on technical terms, tax-specific concepts, and unique identifiers. "
                    "Exclude common words and focus on the essence of the query. "
                    "Return only the key terms, separated by spaces."
                )},
                {"role": "user", "content": f"Extract key search terms from this refined query: {refined_query}"}
            ],
            max_tokens=50,
            temperature=0.5
        )
        search_terms = response.choices[0].message.content.strip()
        logging.info(f"Extracted search terms: {search_terms}")
        return search_terms
    except Exception as e:
        logging.error(f"Error extracting search terms with OpenAI: {e}")
        return refined_query

def openai_generate_answer(excerpts: List[Dict], query: str) -> str:
    """
    Use OpenAI to generate an answer based on the retrieved excerpts and the query.
    """
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

    try:
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
        return None

def main():
    print("Welcome to the Improved XML Query Interface!")
    print("Please provide the path to your XML file.")
    
    xml_file_path = input("Enter the path to your XML file: ").strip()
    
    if not os.path.exists(xml_file_path):
        print("The specified file does not exist. Please check the path and try again.")
        return
    
    print("Processing XML file...")
    text_content, reference_dict = process_xml_file(xml_file_path)
    
    if not text_content:
        print("Failed to process the XML file. Please check the file and try again.")
        return
    
    print("Creating vector store...")
    vectorstore = create_vector_store(text_content, reference_dict)
    
    if not vectorstore:
        print("Failed to create vector store. Please try again.")
        return
    
    print("Vector store created successfully. You can now ask questions about the content.")
    print("Type 'quit' to exit the program.\n")

    while True:
        user_query = input("Enter your query: ").strip()
        
        if user_query.lower() == 'quit':
            print("Thank you for using the Improved XML Query Interface. Goodbye!")
            break
        
        if not user_query:
            print("Please enter a valid query.")
            continue
        
        print("Refining your query...")
        refined_query = refine_query(user_query)
        print(f"Refined query: {refined_query}")
        
        print("Extracting key search terms...")
        search_terms = extract_search_terms(refined_query)
        print(f"Search terms: {search_terms}")
        
        results = query_vectorstore(vectorstore, search_terms)
        
        if results:
            print("\nRelevant excerpts from the document:")
            for i, result in enumerate(results, 1):
                print(format_result(result, i))
            
            print("Generating a comprehensive answer...")
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