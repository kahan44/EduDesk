import google.generativeai as genai
import json
import re
from typing import Dict, List, Optional
from django.conf import settings

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyD6cvALd4wsjnVONsrtCQMOBHaI3NpCHCg"
genai.configure(api_key=GEMINI_API_KEY)


class GeminiQuizGenerator:
    """Service class for generating quizzes using Gemini AI"""
    
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-flash')
    
    def generate_quiz_from_text(self, text_content: str, difficulty: str = 'medium') -> Optional[Dict]:
        """
        Generate a quiz from text content using Gemini AI
        
        Args:
            text_content (str): The text content to generate quiz from
            difficulty (str): Difficulty level (easy, medium, hard)
            
        Returns:
            Dict: Generated quiz data with questions and options
        """
        
        # Define difficulty-specific prompts with strict content adherence
        difficulty_prompts = {
            'easy': 'Generate easy-level questions that test basic understanding and recall of key concepts DIRECTLY from the provided text. Focus ONLY on definitions, key facts, and simple information explicitly mentioned in the text.',
            'medium': 'Generate medium-level questions that test comprehension and application of concepts FOUND IN THE TEXT. Focus ONLY on relationships between ideas mentioned in the content.',
            'hard': 'Generate hard-level questions that test analysis, synthesis, and critical thinking about concepts PRESENT IN THE TEXT. Focus ONLY on deeper implications of what is actually written in the provided content.'
        }
        
        prompt = f"""
        You are an expert quiz generator. Based STRICTLY on the following text content, generate a quiz with exactly 10 multiple-choice questions.

        CRITICAL INSTRUCTIONS:
        - ALL questions MUST be based ONLY on information found in the provided text
        - Do NOT include any general knowledge questions  
        - Do NOT ask about topics not mentioned in the text
        - Do NOT use external knowledge beyond what's in the text
        - Reference specific details, concepts, and information from the text
        - Ensure questions can be answered using ONLY the provided content
        - Start questions with phrases like "According to the text...", "The document states...", "Based on the content..."

        DIFFICULTY LEVEL: {difficulty.upper()}
        {difficulty_prompts.get(difficulty, difficulty_prompts['medium'])}

        TEXT CONTENT TO BASE QUIZ ON:
        {text_content}

        REQUIREMENTS:
        1. Generate exactly 10 multiple-choice questions based ONLY on the above text
        2. Each question should have exactly 4 options (A, B, C, D)
        3. Only ONE option should be correct for each question
        4. Questions should directly reference specific information from the provided text
        5. All options should be plausible but only one correct based on the text
        6. Provide explanations that quote or reference the source text
        7. Format the response as valid JSON

        RESPONSE FORMAT (must be valid JSON):
        {{
            "questions": [
                {{
                    "question_number": 1,
                    "question_text": "According to the text, what is...",
                    "options": {{
                        "A": "Option A based on text content",
                        "B": "Option B based on text content", 
                        "C": "Option C based on text content",
                        "D": "Option D based on text content"
                    }},
                    "correct_answer": "A",
                    "explanation": "According to the text provided: '[quote from text]' - this clearly indicates that [explanation]..."
                }}
            ]
        }}

        Generate the quiz now based STRICTLY on the provided text content. Do not use any external knowledge.
        """
        
        try:
            response = self.model.generate_content(prompt)
            quiz_data = self._parse_response(response.text)
            
            if quiz_data and self._validate_quiz_data(quiz_data):
                return quiz_data
            else:
                print("AI response validation failed")
                return None
                
        except Exception as e:
            print(f"Error generating quiz with Gemini: {e}")
            return None
    
    def _parse_response(self, response_text: str) -> Optional[Dict]:
        """Parse the Gemini response and extract JSON"""
        try:
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                return json.loads(json_str)
            
            # If no JSON found, try to parse the entire response
            return json.loads(response_text)
            
        except json.JSONDecodeError:
            print("Failed to parse JSON response from Gemini")
            return None
    
    def _validate_quiz_data(self, quiz_data: Dict) -> bool:
        """Validate the generated quiz data structure"""
        try:
            questions = quiz_data.get('questions', [])
            
            if len(questions) != 10:
                print(f"Expected 10 questions, got {len(questions)}")
                return False
            
            for i, question in enumerate(questions, 1):
                # Check required fields
                required_fields = ['question_text', 'options', 'correct_answer']
                if not all(field in question for field in required_fields):
                    print(f"Question {i} missing required fields")
                    return False
                
                # Check options
                options = question['options']
                if not all(opt in options for opt in ['A', 'B', 'C', 'D']):
                    print(f"Question {i} missing option labels")
                    return False
                
                # Check correct answer
                if question['correct_answer'] not in ['A', 'B', 'C', 'D']:
                    print(f"Question {i} has invalid correct answer")
                    return False
            
            return True
            
        except Exception as e:
            print(f"Error validating quiz data: {e}")
            return False
    
    def _generate_fallback_quiz(self, text_content: str, difficulty: str) -> Dict:
        """Generate a fallback quiz if AI generation fails"""
        print("Generating fallback quiz...")
        
        # Simple fallback quiz based on content keywords
        words = text_content.split()[:100]  # Use first 100 words
        
        fallback_questions = []
        for i in range(1, 11):
            question = {
                "question_number": i,
                "question_text": f"Based on the document content, which of the following concepts is most relevant to the main topic discussed? (Question {i})",
                "options": {
                    "A": f"Concept related to {words[i*2] if i*2 < len(words) else 'general topic'}",
                    "B": f"Concept related to {words[i*3] if i*3 < len(words) else 'secondary topic'}",
                    "C": f"Concept related to {words[i*4] if i*4 < len(words) else 'tertiary topic'}",
                    "D": "None of the above"
                },
                "correct_answer": "A",
                "explanation": "This answer is based on the primary content analysis of the document."
            }
            fallback_questions.append(question)
        
        return {"questions": fallback_questions}
    
    def extract_text_from_document_content(self, file_path: str) -> str:
        """
        Extract text content from document file
        Note: This is a simple implementation. For production, use proper PDF parsing.
        """
        try:
            # For now, return a placeholder. In production, use PyPDF2 or similar
            # to extract actual PDF content
            return f"Document content from {file_path}. This is a placeholder for PDF text extraction."
        except Exception as e:
            print(f"Error extracting text from document: {e}")
            return "Unable to extract text from document."
