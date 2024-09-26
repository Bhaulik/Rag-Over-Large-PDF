import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
import textwrap

# Load environment variables
load_dotenv()

# Initialize Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = "pdf-embeddings"  # Make sure this matches the index name used in vectorization

# Initialize OpenAI embeddings
embeddings = OpenAIEmbeddings()

# Initialize Pinecone vector store
index = pc.Index(index_name)
vectorstore = PineconeVectorStore(index=index, embedding=embeddings)

def query_vectorstore(query, k=5):
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
        
        results = query_vectorstore(user_query)
        
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