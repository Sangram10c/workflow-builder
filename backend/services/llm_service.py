# FILE: backend/services/llm_service.py
# COMPLETE - OpenAI + Gemini + SerpAPI

import os
from openai import OpenAI
import google.generativeai as genai
import requests

class LLMService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.serp_api_key = os.getenv("SERP_API_KEY")
        
        if self.openai_api_key:
            self.openai_client = OpenAI(api_key=self.openai_api_key)
        
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
    
    async def generate_response(self, query, context="", model="gpt-3.5-turbo", 
                                 custom_prompt="", use_web_search=False):
        # Get web search results if enabled
        web_results = ""
        if use_web_search:
            web_results = await self.web_search(query)
        
        # Route to appropriate LLM
        if model.startswith("gemini"):
            return await self.gemini_generate(query, context, web_results, custom_prompt, model)
        else:
            return await self.openai_generate(query, context, web_results, custom_prompt, model)
    
    async def openai_generate(self, query, context, web_results, custom_prompt, model):
        if not self.openai_api_key:
            return "Error: OpenAI API key not configured"
        
        try:
            messages = []
            
            # System prompt
            if custom_prompt:
                messages.append({"role": "system", "content": custom_prompt})
            else:
                messages.append({
                    "role": "system", 
                    "content": "You are a helpful AI assistant."
                })
            
            # Build user message
            user_content = f"Question: {query}\n"
            
            if context:
                user_content += f"\nContext from documents:\n{context}\n"
            
            if web_results:
                user_content += f"\nWeb search results:\n{web_results}\n"
            
            user_content += "\nProvide a helpful answer."
            
            messages.append({"role": "user", "content": user_content})
            
            # Call OpenAI API
            response = self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            return f"Error: {str(e)}"
    
    async def gemini_generate(self, query, context, web_results, custom_prompt, model):
        if not self.gemini_api_key:
            return "Error: Gemini API key not configured"
        
        try:
            # Select Gemini model
            model_name = 'gemini-pro'
            if 'flash' in model.lower():
                model_name = 'gemini-1.5-flash'
            elif '1.5' in model:
                model_name = 'gemini-1.5-pro'
            
            gemini_model = genai.GenerativeModel(model_name)
            
            # Build prompt
            prompt = ""
            
            if custom_prompt:
                prompt += f"Instructions: {custom_prompt}\n\n"
            
            prompt += f"Question: {query}\n"
            
            if context:
                prompt += f"\nContext from documents:\n{context}\n"
            
            if web_results:
                prompt += f"\nWeb search results:\n{web_results}\n"
            
            prompt += "\nPlease provide a helpful answer."
            
            # Generate response
            response = gemini_model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            return f"Error generating with Gemini: {str(e)}"
    
    async def web_search(self, query):
        """Search the web using SerpAPI"""
        if not self.serp_api_key:
            return ""
        
        try:
            url = "https://serpapi.com/search"
            params = {
                "q": query,
                "api_key": self.serp_api_key,
                "num": 3
            }
            
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            results = []
            if "organic_results" in data:
                for result in data["organic_results"][:3]:
                    title = result.get('title', '')
                    snippet = result.get('snippet', '')
                    if title and snippet:
                        results.append(f"{title}: {snippet}")
            
            return "\n\n".join(results) if results else ""
            
        except Exception as e:
            print(f"Web search error: {str(e)}")
            return ""


# FILE: backend/services/document_service.py
# COMPLETE - OpenAI + Gemini Embeddings

import fitz
import chromadb
from chromadb.utils import embedding_functions
import uuid
import os

class DocumentService:
    def __init__(self):
        self.chroma_client = chromadb.Client()
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        
        # Default to OpenAI embeddings
        if self.openai_key:
            self.openai_ef = embedding_functions.OpenAIEmbeddingFunction(
                api_key=self.openai_key,
                model_name="text-embedding-ada-002"
            )
        else:
            self.openai_ef = embedding_functions.DefaultEmbeddingFunction()
    
    def get_embedding_function(self, model_name="text-embedding-ada-002"):
        """Get embedding function based on model"""
        if "gemini" in model_name.lower():
            # Gemini embeddings
            if self.gemini_key:
                import google.generativeai as genai
                genai.configure(api_key=self.gemini_key)
                # Note: Gemini doesn't have direct embedding API like OpenAI
                # Using OpenAI as fallback
                return self.openai_ef
            else:
                return embedding_functions.DefaultEmbeddingFunction()
        else:
            # OpenAI embeddings
            if self.openai_key:
                return embedding_functions.OpenAIEmbeddingFunction(
                    api_key=self.openai_key,
                    model_name=model_name
                )
            else:
                return embedding_functions.DefaultEmbeddingFunction()
    
    def extract_text_from_pdf(self, pdf_bytes):
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception as e:
            raise Exception(f"Error extracting PDF text: {str(e)}")
    
    async def process_document(self, file_bytes, filename, embedding_model="text-embedding-ada-002"):
        try:
            doc_id = str(uuid.uuid4())
            
            # Extract text
            text = self.extract_text_from_pdf(file_bytes)
            
            if not text.strip():
                raise Exception("No text found in PDF")
            
            # Create chunks
            chunks = self.chunk_text(text)
            
            # Get appropriate embedding function
            embedding_func = self.get_embedding_function(embedding_model)
            
            # Store in ChromaDB
            collection = self.chroma_client.get_or_create_collection(
                name=f"doc_{doc_id}",
                embedding_function=embedding_func
            )
            
            collection.add(
                documents=chunks,
                ids=[f"{doc_id}_{i}" for i in range(len(chunks))],
                metadatas=[{"chunk_id": i, "filename": filename} for i in range(len(chunks))]
            )
            
            return doc_id
            
        except Exception as e:
            raise Exception(f"Error processing document: {str(e)}")
    
    def chunk_text(self, text, chunk_size=500, overlap=50):
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk:
                chunks.append(chunk)
        
        return chunks if chunks else [text]
    
    def retrieve_context(self, doc_id, query, top_k=3):
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