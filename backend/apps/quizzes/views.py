from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
import pdfplumber
import os
import re
from django.conf import settings

from .models import Quiz, Question, QuestionOption, QuizAttempt, QuizSession
from .serializers import (
    QuizSerializer, QuizDetailSerializer, QuizGenerationRequestSerializer,
    QuizAttemptSerializer, QuizSubmissionSerializer, QuestionWithAnswerSerializer
)
from .services import GeminiQuizGenerator
from apps.documents.models import Document


def extract_text_from_pdf(pdf_path):
    """Extract text content from PDF file using pdfplumber for better accuracy"""
    try:
        print(f"Starting PDF extraction from: {pdf_path}")
        
        if not os.path.exists(pdf_path):
            print(f"PDF file does not exist: {pdf_path}")
            return None
            
        text = ""
        page_count = 0
        
        with pdfplumber.open(pdf_path) as pdf:
            print(f"PDF opened successfully. Total pages: {len(pdf.pages)}")
            
            for page_num, page in enumerate(pdf.pages, 1):
                try:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
                        page_count += 1
                        print(f"Extracted text from page {page_num}: {len(page_text)} characters")
                    else:
                        print(f"No text found on page {page_num}")
                except Exception as page_error:
                    print(f"Error extracting text from page {page_num}: {page_error}")
                    continue
        
        if not text.strip():
            print("No text extracted from any pages")
            return None
        
        # Clean the extracted text
        text = text.strip()
        
        # Remove excessive whitespace and normalize
        text = re.sub(r'\n\s*\n', '\n\n', text)  # Normalize paragraph breaks
        text = re.sub(r' +', ' ', text)  # Remove multiple spaces
        text = re.sub(r'\t+', ' ', text)  # Replace tabs with spaces
        
        # Remove common PDF artifacts
        text = re.sub(r'^\s*\d+\s*$', '', text, flags=re.MULTILINE)  # Remove page numbers
        text = re.sub(r'\f', '', text)  # Remove form feeds
        
        # Validate extracted text
        if len(text) < 100:  # If extracted text is too short
            print(f"Extracted text too short: {len(text)} characters")
            print(f"Text preview: {text[:200]}")
            return None
        
        print(f"Successfully extracted {len(text)} characters from {page_count} pages")
        print(f"Text preview (first 300 chars): {text[:300]}...")
        
        # Limit text length to prevent API quota issues while keeping sufficient context
        if len(text) > 20000:  # Increased limit for better content
            # Try to cut at sentence boundary
            truncated = text[:20000]
            last_period = truncated.rfind('.')
            if last_period > 15000:  # If we find a reasonable sentence boundary
                text = truncated[:last_period + 1]
                print(f"Text truncated at sentence boundary: {len(text)} characters")
            else:
                text = truncated + "..."
                print(f"Text truncated: {len(text)} characters")
        
        return text
        
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return None


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def quiz_list(request):
    """Get list of user's quizzes"""
    quizzes = Quiz.objects.filter(user=request.user)
    serializer = QuizSerializer(quizzes, many=True)
    
    return Response({
        'success': True,
        'message': 'Quizzes retrieved successfully',
        'data': serializer.data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def quiz_detail(request, quiz_id):
    """Get detailed quiz information with questions"""
    quiz = get_object_or_404(Quiz, id=quiz_id, user=request.user)
    serializer = QuizDetailSerializer(quiz)
    
    return Response({
        'success': True,
        'message': 'Quiz details retrieved successfully',
        'data': serializer.data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_quiz(request):
    """Generate a new quiz using AI based on document content"""
    serializer = QuizGenerationRequestSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'success': False,
            'message': 'Invalid request data',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get the document
        document = get_object_or_404(
            Document, 
            id=serializer.validated_data['document_id'],
            user=request.user
        )
        
        # Initialize AI quiz generator
        quiz_generator = GeminiQuizGenerator()
        
        # Extract text from PDF document
        document_text = None
        if document.file:
            pdf_path = document.file.path
            if os.path.exists(pdf_path):
                document_text = extract_text_from_pdf(pdf_path)
                if document_text:
                    print(f"Successfully extracted {len(document_text)} characters")
                    print(f"Text sample: {document_text[:500]}...")
                else:
                    print("Failed to extract text from PDF")
            else:
                print(f"PDF file not found at path: {pdf_path}")
        else:
            print("No file attached to document")
        
        # Require successful text extraction - no fallback
        if not document_text:
            return Response({
                'success': False,
                'message': 'Unable to extract text content from the PDF file. Please ensure the PDF contains readable text and try again.',
                'details': 'Quiz generation requires extractable text content from the PDF document.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"Sending {len(document_text)} characters to AI for quiz generation")
        
        # Generate quiz using AI
        quiz_data = quiz_generator.generate_quiz_from_text(
            document_text, 
            serializer.validated_data['difficulty']
        )
        
        if not quiz_data:
            return Response({
                'success': False,
                'message': 'Failed to generate quiz content'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Create quiz and questions in database
        with transaction.atomic():
            # Create quiz
            quiz = Quiz.objects.create(
                user=request.user,
                document=document,
                title=serializer.validated_data.get('title', f"Quiz - {document.title}"),
                difficulty=serializer.validated_data['difficulty'],
                status='published'
            )
            
            # Create questions and options
            for question_data in quiz_data['questions']:
                question = Question.objects.create(
                    quiz=quiz,
                    question_text=question_data['question_text'],
                    question_number=question_data.get('question_number', 1),
                    correct_answer=question_data['correct_answer'],
                    explanation=question_data.get('explanation', '')
                )
                
                # Create options
                for option_letter, option_text in question_data['options'].items():
                    QuestionOption.objects.create(
                        question=question,
                        option_letter=option_letter,
                        option_text=option_text
                    )
        
        # Return created quiz
        quiz_serializer = QuizDetailSerializer(quiz)
        return Response({
            'success': True,
            'message': 'Quiz generated successfully',
            'data': quiz_serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error generating quiz: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_quiz(request):
    """Submit quiz answers and calculate score"""
    serializer = QuizSubmissionSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'success': False,
            'message': 'Invalid submission data',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        quiz = get_object_or_404(Quiz, id=serializer.validated_data['quiz_id'])
        answers = serializer.validated_data['answers']
        time_taken = serializer.validated_data['time_taken']
        
        # Calculate score
        score = 0
        total_questions = quiz.questions.count()
        question_results = []
        
        for question in quiz.questions.all():
            user_answer = answers.get(str(question.id))
            is_correct = user_answer == question.correct_answer
            
            if is_correct:
                score += 1
            
            question_results.append({
                'question_id': str(question.id),
                'question_text': question.question_text,
                'user_answer': user_answer,
                'correct_answer': question.correct_answer,
                'is_correct': is_correct,
                'explanation': question.explanation
            })
        
        # Save quiz attempt
        quiz_attempt = QuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=score,
            total_questions=total_questions,
            time_taken=time_taken,
            answers=answers
        )
        
        return Response({
            'success': True,
            'message': 'Quiz submitted successfully',
            'data': {
                'attempt_id': quiz_attempt.id,
                'score': score,
                'total_questions': total_questions,
                'percentage_score': quiz_attempt.percentage_score,
                'time_taken': time_taken,
                'question_results': question_results
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error submitting quiz: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def quiz_attempts(request):
    """Get user's quiz attempts history"""
    attempts = QuizAttempt.objects.filter(user=request.user)
    serializer = QuizAttemptSerializer(attempts, many=True)
    
    return Response({
        'success': True,
        'message': 'Quiz attempts retrieved successfully',
        'data': serializer.data
    })


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_quiz(request, quiz_id):
    """Delete a quiz"""
    quiz = get_object_or_404(Quiz, id=quiz_id, user=request.user)
    quiz.delete()
    
    return Response({
        'success': True,
        'message': 'Quiz deleted successfully'
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def quiz_stats(request):
    """Get quiz statistics for the user"""
    user_quizzes = Quiz.objects.filter(user=request.user)
    user_attempts = QuizAttempt.objects.filter(user=request.user)
    
    stats = {
        'total_quizzes': user_quizzes.count(),
        'total_attempts': user_attempts.count(),
        'average_score': 0,
        'quiz_by_difficulty': {
            'easy': user_quizzes.filter(difficulty='easy').count(),
            'medium': user_quizzes.filter(difficulty='medium').count(),
            'hard': user_quizzes.filter(difficulty='hard').count(),
        }
    }
    
    if user_attempts.exists():
        total_percentage = sum(attempt.percentage_score for attempt in user_attempts)
        stats['average_score'] = round(total_percentage / user_attempts.count(), 2)
    
    return Response({
        'success': True,
        'message': 'Quiz statistics retrieved successfully',
        'data': stats
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_quiz_session(request, quiz_id):
    """Start a new quiz session or resume existing one"""
    try:
        quiz = get_object_or_404(Quiz, id=quiz_id)
        
        # Use transaction to prevent race conditions
        with transaction.atomic():
            # Check if user already has an active session for this quiz
            existing_session = QuizSession.objects.filter(
                user=request.user,
                quiz=quiz,
                status__in=['active', 'paused']
            ).first()
            
            if existing_session:
                # Update elapsed time and check if expired
                existing_session.update_elapsed_time()
                if existing_session.is_expired:
                    # Mark as expired and create new session
                    existing_session.status = 'expired'
                    existing_session.save()
                else:
                    # Return existing active session
                    return Response({
                        'success': True,
                        'message': 'Resuming existing quiz session',
                        'session_id': existing_session.id,
                        'time_elapsed': existing_session.time_elapsed,
                        'time_remaining': existing_session.time_remaining,
                        'current_answers': existing_session.current_answers,
                        'current_question': existing_session.current_question,
                        'started_at': existing_session.started_at.isoformat()
                    })
            
            # Create new session (only if no active session exists)
            session = QuizSession.objects.create(
                user=request.user,
                quiz=quiz
            )
            
            return Response({
                'success': True,
                'message': 'Quiz session started successfully',
                'session_id': session.id,
                'time_elapsed': 0,
                'time_remaining': quiz.time_limit,
                'current_answers': {},
                'current_question': 0,
                'started_at': session.started_at.isoformat()
            })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error starting quiz session: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_quiz_session(request, session_id):
    """Update quiz session with progress and answers"""
    try:
        session = get_object_or_404(QuizSession, id=session_id, user=request.user, status__in=['active', 'paused'])
        
        # Update session data
        current_answers = request.data.get('current_answers', session.current_answers)
        current_question = request.data.get('current_question', session.current_question)
        
        session.current_answers = current_answers
        session.current_question = current_question
        session.update_elapsed_time()  # This also checks for expiration
        
        if session.is_expired:
            return Response({
                'success': False,
                'message': 'Quiz session has expired',
                'expired': True,
                'time_remaining': 0
            }, status=status.HTTP_410_GONE)
        
        return Response({
            'success': True,
            'message': 'Quiz session updated successfully',
            'time_elapsed': session.time_elapsed,
            'time_remaining': session.time_remaining,
            'is_expired': session.is_expired
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error updating quiz session: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_answer_immediately(request, session_id):
    """Save a single answer immediately when user selects an option"""
    try:
        session = get_object_or_404(QuizSession, id=session_id, user=request.user, status__in=['active', 'paused'])
        
        question_id = request.data.get('question_id')
        selected_option = request.data.get('selected_option')
        
        if not question_id or not selected_option:
            return Response({
                'success': False,
                'message': 'question_id and selected_option are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the specific answer in current_answers
        if not session.current_answers:
            session.current_answers = {}
        
        session.current_answers[str(question_id)] = selected_option
        session.update_elapsed_time()  # Also update elapsed time
        
        if session.is_expired:
            return Response({
                'success': False,
                'message': 'Quiz session has expired',
                'expired': True,
                'time_remaining': 0
            }, status=status.HTTP_410_GONE)
        
        return Response({
            'success': True,
            'message': 'Answer saved successfully',
            'question_id': question_id,
            'selected_option': selected_option,
            'time_elapsed': session.time_elapsed,
            'time_remaining': session.time_remaining
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error saving answer: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def complete_quiz_session(request, session_id):
    """Complete a quiz session and create final attempt"""
    try:
        session = get_object_or_404(QuizSession, id=session_id, user=request.user)
        
        # Update final elapsed time
        session.update_elapsed_time()
        
        # Mark session as completed
        session.status = 'completed'
        session.save()
        
        # Get final answers
        final_answers = request.data.get('answers', session.current_answers)
        
        # Create quiz attempt
        with transaction.atomic():
            quiz_attempt = QuizAttempt.objects.create(
                user=request.user,
                quiz=session.quiz,
                time_taken=session.time_elapsed,
                total_questions=session.quiz.questions.count(),
                attempted_questions=0,  # Will be calculated below
                answers=final_answers
            )
            
            # Calculate score and attempted questions
            total_score = 0
            total_questions = 0
            attempted_questions = 0
            
            for question in session.quiz.questions.all():
                total_questions += 1
                question_id = str(question.id)
                
                # Check if this question was answered
                if question_id in final_answers and final_answers[question_id]:
                    attempted_questions += 1
                    selected_option = final_answers[question_id]
                    correct_option = question.correct_answer  # This is A, B, C, or D
                    
                    # Award 1 point if the answer is correct
                    if selected_option == correct_option:
                        total_score += 1
            
            quiz_attempt.score = total_score
            quiz_attempt.total_questions = total_questions
            quiz_attempt.attempted_questions = attempted_questions
            quiz_attempt.save()
            
            response_data = {
                'success': True,
                'message': 'Quiz completed successfully',
                'attempt_id': quiz_attempt.id,
                'score': total_score,
                'total_questions': total_questions,
                'attempted_questions': attempted_questions,
                'percentage': quiz_attempt.percentage_score,
                'time_taken': session.time_elapsed,
                'answers': final_answers
            }
            return Response(response_data)
            
    except Exception as e:
        print(f"ERROR in complete_quiz_session: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            'success': False,
            'message': f'Error completing quiz: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_quiz_session(request, session_id):
    """Get current quiz session status"""
    try:
        session = get_object_or_404(QuizSession, id=session_id, user=request.user)
        session.update_elapsed_time()
        
        return Response({
            'success': True,
            'session_id': session.id,
            'quiz_id': session.quiz.id,
            'quiz_title': session.quiz.title,
            'time_elapsed': session.time_elapsed,
            'time_remaining': session.time_remaining,
            'current_answers': session.current_answers,
            'current_question': session.current_question,
            'status': session.status,
            'is_expired': session.is_expired,
            'started_at': session.started_at.isoformat()
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error retrieving quiz session: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_active_session(request, quiz_id):
    """Check if user has an active session for a quiz"""
    try:
        quiz = get_object_or_404(Quiz, id=quiz_id)
        
        active_session = QuizSession.objects.filter(
            user=request.user,
            quiz=quiz,
            status__in=['active', 'paused']
        ).first()
        
        if active_session:
            active_session.update_elapsed_time()
            if active_session.is_expired:
                return Response({
                    'has_active_session': False,
                    'expired': True
                })
            
            return Response({
                'has_active_session': True,
                'session_id': active_session.id,
                'time_elapsed': active_session.time_elapsed,
                'time_remaining': active_session.time_remaining,
                'current_question': active_session.current_question
            })
        
        return Response({
            'has_active_session': False
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error checking active session: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_any_active_session(request):
    """Check if user has any active quiz session"""
    try:
        active_sessions = QuizSession.objects.filter(
            user=request.user,
            status__in=['active', 'paused']
        )
        
        # Check each session for expiration
        non_expired_sessions = []
        for session in active_sessions:
            session.update_elapsed_time()
            if not session.is_expired:
                non_expired_sessions.append({
                    'session_id': session.id,
                    'quiz_id': session.quiz.id,
                    'quiz_title': session.quiz.title,
                    'time_elapsed': session.time_elapsed,
                    'time_remaining': session.time_remaining,
                    'current_question': session.current_question
                })
        
        return Response({
            'has_active_sessions': len(non_expired_sessions) > 0,
            'active_sessions': non_expired_sessions
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error checking active sessions: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

