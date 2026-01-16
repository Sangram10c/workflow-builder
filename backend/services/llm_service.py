import os
import openai
import google.generativeai as genai
import requests

class LLMService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.serp_api_key = os.getenv("SERP_API_KEY")
        
        if self.openai_api_key:
            openai.api_key = self.openai_api_key
        
        if self.gemini_api_key:
            genai.configure(api_key=self.gemini_api_key)
    
    async def generate_response(
        self, 
        query, 
        context="", 
        model="gpt-3.5-turbo", 
        custom_prompt="", 
        use_web_search=False
    ):
        """Generate response using specified LLM"""
        web_results = ""
        if use_web_search:
            web_results = await self.web_search(query)
        
        if model.startswith("gpt"):
            return await self.openai_generate(query, context, web_results, custom_prompt)
        elif model.startswith("gemini"):
            return await self.gemini_generate(query, context, web_results, custom_prompt)
        else:
            return await self.openai_generate(query, context, web_results, custom_prompt)
    
    async def openai_generate(self, query, context, web_results, custom_prompt):
        """Generate response using OpenAI"""
        if not self.openai_api_key:
            return "Error: OpenAI API key not configured"
        
        try:
            messages = []
            
            # Add system prompt if provided
            if custom_prompt:
                messages.append({"role": "system", "content": custom_prompt})
            else:
                messages.append({
                    "role": "system", 
                    "content": "You are a helpful AI assistant. Provide clear and concise answers."
                })
            
            # Build user message
            user_content = f"Query: {query}\n"
            
            if context:
                user_content += f"\nContext from documents:\n{context}\n"
            
            if web_results:
                user_content += f"\nWeb search results:\n{web_results}\n"
            
            user_content += "\nPlease provide a comprehensive answer based on the available information."
            
            messages.append({"role": "user", "content": user_content})
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    async def gemini_generate(self, query, context, web_results, custom_prompt):
        """Generate response using Google Gemini"""
        if not self.gemini_api_key:
            return "Error: Gemini API key not configured"
        
        try:
            model = genai.GenerativeModel('gemini-pro')
            
            # Build prompt
            prompt = ""
            
            if custom_prompt:
                prompt += f"Instructions: {custom_prompt}\n\n"
            
            prompt += f"Query: {query}\n"
            
            if context:
                prompt += f"\nContext from documents:\n{context}\n"
            
            if web_results:
                prompt += f"\nWeb search results:\n{web_results}\n"
            
            prompt += "\nPlease provide a comprehensive answer based on the available information."
            
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    async def web_search(self, query):
        """Perform web search using SerpAPI"""
        if not self.serp_api_key:
            return ""
        
        try:
            url = f"https://serpapi.com/search"
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
                    if title or snippet:
                        results.append(f"{title}: {snippet}")
            
            return "\n".join(results) if results else ""
        except Exception as e:
            print(f"Web search error: {str(e)}")
            return ""
