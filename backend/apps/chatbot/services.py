import google.generativeai as genai
import json
import re
from typing import Dict, List, Optional

# Configure Gemini API (using the same key from quizzes)
GEMINI_API_KEY = "AIzaSyD6cvALd4wsjnVONsrtCQMOBHaI3NpCHCg"
genai.configure(api_key=GEMINI_API_KEY)


class GeminiChatbot:
    """Service class for educational chatbot using Gemini AI"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.system_prompt = """
        You are EduAI, an intelligent educational assistant designed to help students with their learning journey. You are knowledgeable, patient, and encouraging.

        Your capabilities include:
        - Answering questions on various academic subjects
        - Explaining complex concepts in simple terms
        - Providing study tips and learning strategies
        - Helping with homework and assignments (guiding, not doing the work)
        - Offering career guidance and educational pathways
        - Creating study plans and schedules
        - Recommending learning resources

        Guidelines for responses:
        - Keep responses educational and helpful
        - Encourage critical thinking rather than just providing answers
        - Use examples and analogies to explain concepts
        - Be patient and supportive
        - If you don't know something, admit it and suggest alternative resources
        - Keep responses concise but comprehensive
        - Use a friendly, encouraging tone
        - Focus on helping students learn and understand

        Remember: Your goal is to facilitate learning, not replace it. Guide students to discover answers and understand concepts.
        """
    
    def generate_response(self, user_message: str, chat_history: List[Dict] = None) -> Optional[str]:
        """
        Generate a response to user message using Gemini AI
        
        Args:
            user_message (str): The user's message
            chat_history (List[Dict]): Previous chat messages for context
            
        Returns:
            str: AI generated response
        """
        
        # Prepare conversation context
        conversation_context = self.system_prompt + "\n\n"
        
        # Add chat history for context (last 10 messages)
        if chat_history:
            recent_history = chat_history[-10:]  # Keep last 10 messages for context
            conversation_context += "Previous conversation:\n"
            for msg in recent_history:
                if msg['message_type'] == 'user':
                    conversation_context += f"Student: {msg['content']}\n"
                else:
                    conversation_context += f"EduAI: {msg['content']}\n"
            conversation_context += "\n"
        
        # Add current user message
        conversation_context += f"Student: {user_message}\n"
        conversation_context += "EduAI: "
        
        try:
            response = self.model.generate_content(conversation_context)
            return response.text.strip()
                
        except Exception as e:
            print(f"Error generating response with Gemini: {e}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again in a moment."
    
    def generate_conversation_title(self, first_message: str) -> str:
        """
        Generate a title for the conversation based on the first message
        
        Args:
            first_message (str): The first user message
            
        Returns:
            str: Generated title
        """
        
        prompt = f"""
        Generate a short, descriptive title (max 6 words) for a chat conversation that starts with this message:
        "{first_message}"
        
        The title should be educational and capture the main topic. Examples:
        - "Math Help Session"
        - "Science Question Discussion"
        - "Study Tips Request"
        - "Homework Assistance"
        
        Just return the title, nothing else.
        """
        
        try:
            response = self.model.generate_content(prompt)
            title = response.text.strip()
            
            # Clean up the title and ensure it's not too long
            title = title.replace('"', '').replace("'", "")
            if len(title) > 50:
                title = title[:47] + "..."
                
            return title
                
        except Exception as e:
            print(f"Error generating title: {e}")
            # Fallback to simple keyword extraction
            words = first_message.split()[:3]
            return " ".join(words).title() + " Chat"
