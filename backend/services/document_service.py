import fitz  # PyMuPDF
import chromadb
from chromadb.utils import embedding_functions
import uuid
import os

class DocumentService:
    def __init__(self):
        self.chroma_client = chromadb.Client()
        openai_key = os.getenv("OPENAI_API_KEY")
        
        if openai_key:
            self.openai_ef = embedding_functions.OpenAIEmbeddingFunction(
                api_key=openai_key,
                model_name="text-embedding-ada-002"
            )
        else:
            # Fallback to default embedding function
            self.openai_ef = embedding_functions.DefaultEmbeddingFunction()
        
    def extract_text_from_pdf(self, pdf_bytes):
        """Extract text from PDF bytes"""
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    async def process_document(self, file_bytes, filename):
        """Process document: extract text, create embeddings, store in ChromaDB"""
        doc_id = str(uuid.uuid4())
        
        # Extract text from PDF
        text = self.extract_text_from_pdf(file_bytes)
        
        if not text.strip():
            raise Exception("No text content found in PDF")
        
        # Split text into chunks
        chunks = self.chunk_text(text)
        
        # Create or get collection
        collection = self.chroma_client.get_or_create_collection(
            name=f"doc_{doc_id}",
            embedding_function=self.openai_ef
        )
        
        # Add documents to collection
        collection.add(
            documents=chunks,
            ids=[f"{doc_id}_{i}" for i in range(len(chunks))],
            metadatas=[{"chunk_id": i, "filename": filename} for i in range(len(chunks))]
        )
        
        return doc_id
    
    def chunk_text(self, text, chunk_size=500, overlap=50):
        """Split text into overlapping chunks"""
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk:
                chunks.append(chunk)
        
        return chunks if chunks else [text]
    
    def retrieve_context(self, doc_id, query, top_k=3):
        """Retrieve relevant context from document based on query"""
        try:
            collection = self.chroma_client.get_collection(
                name=f"doc_{doc_id}",
                embedding_function=self.openai_ef
            )
            
            results = collection.query(
                query_texts=[query],
                n_results=top_k
            )
            
            if results and results['documents']:
                return "\n\n".join(results['documents'][0])
            return ""
        except Exception as e:
            print(f"Error retrieving context: {str(e)}")
            return ""
