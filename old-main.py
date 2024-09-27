import os
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OpenAIEmbeddings
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from langchain_community.vectorstores import Pinecone as PineconeVectorStore

# Load environment variables and set OpenAI API key
load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

def extract_text_from_pdf(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                try:
                    text += page.extract_text() + "\n"
                except Exception as e:
                    print(f"Error extracting text from page: {e}")
            return text
    except Exception as e:
        print(f"Error opening PDF file: {e}")
        return ""

def create_semantic_chunks(text, chunk_size=300, chunk_overlap=100):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""]
    )
    return text_splitter.split_text(text)

def process_and_query_pdf(pdf_path, query, chunk_size=300, chunk_overlap=100, k=5):
    try:
        # Extract text from PDF
        print("Extracting text from PDF...")
        text = extract_text_from_pdf(pdf_path)
        if not text:
            raise ValueError("No text extracted from PDF")

        # Create semantic chunks
        print("Creating semantic chunks...")
        chunks = create_semantic_chunks(text, chunk_size, chunk_overlap)
        if not chunks:
            raise ValueError("No chunks created from text")

        # Initialize Pinecone
        print("Initializing Pinecone...")
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        
        # Create or get existing index
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
        
        # Initialize embeddings
        embeddings = OpenAIEmbeddings()

        # Create Pinecone vector store
        print("Creating Pinecone vector store...")
        vectorstore = PineconeVectorStore.from_texts(chunks, embeddings, index_name=index_name)

        # Perform similarity search
        print("Performing similarity search...")
        results = vectorstore.similarity_search(query, k=k)

        return results
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

if __name__ == '__main__':
    pdf_path = "./1.pdf"
    query = "tell me about Forfeited amounts"
    results = process_and_query_pdf(pdf_path, query)

    if results:
        for i, result in enumerate(results, 1):
            print(f"Result {i}:")
            print(result.page_content)
            print("-" * 50)
    else:
        print("No results returned.")