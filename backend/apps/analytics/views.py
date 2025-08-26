from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Avg, Count, Max
from apps.quizzes.models import Quiz, QuizAttempt, Question, QuestionOption
from apps.quizzes.serializers import QuizAttemptSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_quiz_attempts_analytics(request):
    """Get all quiz attempts grouped by quiz for analytics"""
    try:
        # Get all quiz attempts for the user, grouped by quiz
        attempts = QuizAttempt.objects.filter(user=request.user).select_related('quiz').order_by('-completed_at')
        
        # Group attempts by quiz
        quiz_groups = {}
        for attempt in attempts:
            quiz_id = str(attempt.quiz.id)
            if quiz_id not in quiz_groups:
                quiz_groups[quiz_id] = {
                    'quiz': {
                        'id': quiz_id,
                        'title': attempt.quiz.title,
                        'difficulty': attempt.quiz.difficulty,
                        'total_questions': attempt.quiz.total_questions,
                        'created_at': attempt.quiz.created_at.isoformat(),
                    },
                    'attempts': [],
                    'stats': {
                        'total_attempts': 0,
                        'best_score': 0,
                        'average_score': 0,
                        'latest_attempt': None
                    }
                }
            
            # Add attempt to group
            quiz_groups[quiz_id]['attempts'].append({
                'id': str(attempt.id),
                'score': attempt.score,
                'total_questions': attempt.total_questions,
                'attempted_questions': attempt.attempted_questions,
                'percentage_score': attempt.percentage_score,
                'time_taken': attempt.time_taken,
                'completed_at': attempt.completed_at.isoformat()
            })
        
        # Calculate stats for each quiz group
        for quiz_id, group in quiz_groups.items():
            attempts_list = group['attempts']
            scores = [attempt['percentage_score'] for attempt in attempts_list]
            
            group['stats']['total_attempts'] = len(attempts_list)
            group['stats']['best_score'] = max(scores) if scores else 0
            group['stats']['average_score'] = round(sum(scores) / len(scores), 2) if scores else 0
            group['stats']['latest_attempt'] = attempts_list[0] if attempts_list else None
        
        # Convert to list and sort by latest attempt
        result = list(quiz_groups.values())
        result.sort(key=lambda x: x['stats']['latest_attempt']['completed_at'] if x['stats']['latest_attempt'] else '', reverse=True)
        
        return Response({
            'success': True,
            'data': result
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error fetching analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_detailed_quiz_analytics(request, quiz_id):
    """Get detailed analytics for a specific quiz with questions and answers"""
    try:
        quiz = get_object_or_404(Quiz, id=quiz_id)
        
        # Check if user has access to this quiz (user created it or has attempts)
        has_access = (quiz.user == request.user or 
                     QuizAttempt.objects.filter(user=request.user, quiz=quiz).exists())
        
        if not has_access:
            return Response({
                'success': False,
                'message': 'You do not have access to this quiz analytics'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get all user's attempts for this quiz
        attempts = QuizAttempt.objects.filter(
            user=request.user, 
            quiz=quiz
        ).order_by('-completed_at')
        
        if not attempts.exists():
            return Response({
                'success': False,
                'message': 'No attempts found for this quiz'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get quiz questions with options and correct answers
        questions = Question.objects.filter(quiz=quiz).prefetch_related('options').order_by('question_number')
        
        # Build questions data
        questions_data = []
        for question in questions:
            options_data = []
            for option in question.options.all():
                options_data.append({
                    'letter': option.option_letter,
                    'text': option.option_text,
                    'is_correct': option.option_letter == question.correct_answer
                })
            
            questions_data.append({
                'id': str(question.id),
                'question_number': question.question_number,
                'question_text': question.question_text,
                'correct_answer': question.correct_answer,
                'explanation': question.explanation,
                'options': options_data
            })
        
        # Build attempts data
        attempts_data = []
        for attempt in attempts:
            attempts_data.append({
                'id': str(attempt.id),
                'score': attempt.score,
                'total_questions': attempt.total_questions,
                'attempted_questions': attempt.attempted_questions,
                'percentage_score': attempt.percentage_score,
                'time_taken': attempt.time_taken,
                'completed_at': attempt.completed_at.isoformat(),
                'answers': attempt.answers
            })
        
        # Calculate overall stats
        scores = [attempt.percentage_score for attempt in attempts]
        stats = {
            'total_attempts': len(attempts_data),
            'best_score': max(scores) if scores else 0,
            'average_score': round(sum(scores) / len(scores), 2) if scores else 0,
            'worst_score': min(scores) if scores else 0,
            'improvement': round(scores[0] - scores[-1], 2) if len(scores) > 1 else 0
        }
        
        return Response({
            'success': True,
            'data': {
                'quiz': {
                    'id': str(quiz.id),
                    'title': quiz.title,
                    'difficulty': quiz.difficulty,
                    'total_questions': quiz.total_questions,
                    'time_limit': quiz.time_limit,
                    'created_at': quiz.created_at.isoformat()
                },
                'questions': questions_data,
                'attempts': attempts_data,
                'stats': stats
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error fetching detailed analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_overall_analytics(request):
    """Get overall analytics summary for the user"""
    try:
        # Get all user's quiz attempts
        attempts = QuizAttempt.objects.filter(user=request.user)
        
        if not attempts.exists():
            return Response({
                'success': True,
                'data': {
                    'total_quizzes_taken': 0,
                    'total_attempts': 0,
                    'average_score': 0,
                    'best_score': 0,
                    'total_time_spent': 0,
                    'improvement_trend': 0
                }
            })
        
        # Calculate overall stats
        scores = [attempt.percentage_score for attempt in attempts]
        total_time = sum(attempt.time_taken for attempt in attempts)
        unique_quizzes = attempts.values('quiz').distinct().count()
        
        # Calculate improvement trend (last 5 vs first 5 attempts)
        recent_attempts = attempts.order_by('-completed_at')[:5]
        old_attempts = attempts.order_by('completed_at')[:5]
        
        recent_avg = sum(attempt.percentage_score for attempt in recent_attempts) / len(recent_attempts)
        old_avg = sum(attempt.percentage_score for attempt in old_attempts) / len(old_attempts)
        improvement_trend = round(recent_avg - old_avg, 2)
        
        stats = {
            'total_quizzes_taken': unique_quizzes,
            'total_attempts': len(attempts),
            'average_score': round(sum(scores) / len(scores), 2),
            'best_score': max(scores),
            'total_time_spent': total_time,
            'improvement_trend': improvement_trend
        }
        
        return Response({
            'success': True,
            'data': stats
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error fetching overall analytics: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
