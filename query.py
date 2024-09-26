import os
from dotenv import load_dotenv
from pinecone import Pinecone
from langchain_openai import OpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore

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
    results = vectorstore.similarity_search(query, k=k)
    return results

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
        
        try:
            results = query_vectorstore(user_query)
            
            if results:
                print("\nHere are the most relevant excerpts from the PDF:")
                for i, result in enumerate(results, 1):
                    print(f"\nResult {i}:")
                    print(result.page_content)
                    print("-" * 50)
            else:
                print("No relevant information found for your query.")
        
        except Exception as e:
            print(f"An error occurred while processing your query: {e}")
        
        print("\n")  # Add a blank line for readability

if __name__ == "__main__":
    main()