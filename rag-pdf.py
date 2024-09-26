import os
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
import textwrap

# Load environment variables
load_dotenv()

def extract_text_from_pdf(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

def create_semantic_chunks(text, chunk_size=1000, chunk_overlap=200):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
    return text_splitter.split_text(text)

def initialize_pinecone():
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index_name = "pdf-embeddings"
    
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=1536,  # OpenAI embeddings are 1536 dimensions
            metric='cosine',
            spec=ServerlessSpec(
                cloud='aws',
                region='us-east-1'  # Choose an appropriate region
            )
        )
    return pc.Index(index_name), index_name

def process_and_index_pdf(pdf_path):
    print("Extracting text from PDF...")
    text = extract_text_from_pdf(pdf_path)
    if not text:
        raise ValueError("No text extracted from PDF")

    print("Creating semantic chunks...")
    chunks = create_semantic_chunks(text)
    if not chunks:
        raise ValueError("No chunks created from text")

    print("Initializing Pinecone...")
    index, index_name = initialize_pinecone()
    
    print("Creating embeddings and indexing in Pinecone...")
    embeddings = OpenAIEmbeddings()
    vectorstore = PineconeVectorStore.from_texts(chunks, embeddings, index_name=index_name)
    
    print("Indexing complete.")
    return vectorstore

def query_vectorstore(vectorstore, query, k=5):
    """
    Query the vector store and return results.
    """
    try:
        results = vectorstore.similarity_search(query, k=k)
        return results
    except Exception as e:
        print(f"Error querying vector store: {e}")
        return None

def format_result(result, index):
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

def main():
    pdf_path = "./2.pdf"
    
    # Process and index the PDF (only needs to be done once)
    vectorstore = process_and_index_pdf(pdf_path)
    
    print("Welcome to the PDF Query Interface!")
    print("You can ask questions about the content of the vectorized PDF.")
    print("Type 'quit' to exit the program.\n")

    while True:
        user_query = input("Enter your query: ").strip()
        
        if user_query.lower() == 'quit':
            print("Thank you for using the PDF Query Interface. Goodbye!")
            break
        
        if not user_query:
            print("Please enter a valid query.")
            continue
        
        results = query_vectorstore(vectorstore, user_query)
        
        if results:
            print("\nHere are the most relevant excerpts from the PDF:")
            for i, result in enumerate(results, 1):
                print(format_result(result, i))
            
            print("Remember: These excerpts are for reference only. Please consult the full document for complete information.")
        else:
            print("No relevant information found for your query. Try rephrasing or ask a different question.")
        
        print("\nWould you like to ask another question? (Type 'quit' to exit)")

if __name__ == "__main__":
    main()