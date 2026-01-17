# import fitz  # PyMuPDF
# import chromadb
# from chromadb.utils import embedding_functions
# import uuid
# import os

# class DocumentService:
#     def __init__(self):
#         self.chroma_client = chromadb.Client()
#         openai_key = os.getenv("OPENAI_API_KEY")
        
#         if openai_key:
#             self.openai_ef = embedding_functions.OpenAIEmbeddingFunction(
#                 api_key=openai_key,
#                 model_name="text-embedding-ada-002"
#             )
#         else:
#             # Fallback to default embedding function
#             self.openai_ef = embedding_functions.DefaultEmbeddingFunction()
        
#     def extract_text_from_pdf(self, pdf_bytes):
#         """Extract text from PDF bytes"""
#         try:
#             doc = fitz.open(stream=pdf_bytes, filetype="pdf")
#             text = ""
#             for page in doc:
#                 text += page.get_text()
#             doc.close()
#             return text
#         except Exception as e:
#             raise Exception(f"Error extracting text from PDF: {str(e)}")
    
#     async def process_document(self, file_bytes, filename):
#         """Process document: extract text, create embeddings, store in ChromaDB"""
#         doc_id = str(uuid.uuid4())
        
#         # Extract text from PDF
#         text = self.extract_text_from_pdf(file_bytes)
        
#         if not text.strip():
#             raise Exception("No text content found in PDF")
        
#         # Split text into chunks
#         chunks = self.chunk_text(text)
        
#         # Create or get collection
#         collection = self.chroma_client.get_or_create_collection(
#             name=f"doc_{doc_id}",
#             embedding_function=self.openai_ef
#         )
        
#         # Add documents to collection
#         collection.add(
#             documents=chunks,
#             ids=[f"{doc_id}_{i}" for i in range(len(chunks))],
#             metadatas=[{"chunk_id": i, "filename": filename} for i in range(len(chunks))]
#         )
        
#         return doc_id
    
#     def chunk_text(self, text, chunk_size=500, overlap=50):
#         """Split text into overlapping chunks"""
#         words = text.split()
#         chunks = []
        
#         for i in range(0, len(words), chunk_size - overlap):
#             chunk = " ".join(words[i:i + chunk_size])
#             if chunk:
#                 chunks.append(chunk)
        
#         return chunks if chunks else [text]
    
#     def retrieve_context(self, doc_id, query, top_k=3):
#         """Retrieve relevant context from document based on query"""
#         try:
#             collection = self.chroma_client.get_collection(
#                 name=f"doc_{doc_id}",
#                 embedding_function=self.openai_ef
#             )
            
#             results = collection.query(
#                 query_texts=[query],
#                 n_results=top_k
#             )
            
#             if results and results['documents']:
#                 return "\n\n".join(results['documents'][0])
#             return ""
#         except Exception as e:
#             print(f"Error retrieving context: {str(e)}")
#             return ""
# FILE: backend/services/document_service.py
# FIXED VERSION - Better error handling

import fitz
import chromadb
from chromadb.utils import embedding_functions
import uuid
import os

class DocumentService:
    def __init__(self):
        self.chroma_client = chromadb.Client()
        openai_key = os.getenv("OPENAI_API_KEY")
        
        if openai_key:
            try:
                self.openai_ef = embedding_functions.OpenAIEmbeddingFunction(
                    api_key=openai_key,
                    model_name="text-embedding-ada-002"
                )
            except Exception as e:
                print(f"Warning: Could not initialize OpenAI embeddings: {e}")
                self.openai_ef = embedding_functions.DefaultEmbeddingFunction()
        else:
            print("Warning: No OpenAI API key found, using default embeddings")
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
        try:
            doc_id = str(uuid.uuid4())
            
            # Extract text from PDF
            text = self.extract_text_from_pdf(file_bytes)
            
            if not text.strip():
                raise Exception("No text content found in PDF. The PDF might be image-based or empty.")
            
            # Split text into chunks
            chunks = self.chunk_text(text)
            
            print(f"Processing document: {filename}")
            print(f"Extracted {len(text)} characters")
            print(f"Created {len(chunks)} chunks")
            
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
            
            print(f"Successfully stored document with ID: {doc_id}")
            
            return doc_id
            
        except Exception as e:
            error_msg = str(e)
            
            # Check for quota error
            if "quota" in error_msg.lower() or "429" in error_msg:
                raise Exception("""OpenAI API Quota Exceeded. 

To fix this:
1. Go to https://platform.openai.com/account/billing
2. Add payment method and credits
3. Wait a few minutes
4. Try uploading again

The document upload requires API calls to create embeddings.""")
            
            # Check for authentication error
            elif "authentication" in error_msg.lower() or "401" in error_msg:
                raise Exception("""Invalid OpenAI API Key.

To fix this:
1. Get a valid API key from https://platform.openai.com/api-keys
2. Update your .env file with the correct key
3. Restart the backend server
4. Try uploading again""")
            
            else:
                raise Exception(f"Error processing document: {error_msg}")
    
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
                context = "\n\n".join(results['documents'][0])
                print(f"Retrieved {len(context)} characters of context")
                return context
            return ""
        except Exception as e:
            print(f"Error retrieving context: {str(e)}")
            return ""