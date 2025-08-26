from django.urls import path
from . import views

app_name = 'quizzes'

urlpatterns = [
    # Quiz management
    path('', views.quiz_list, name='quiz_list'),
    path('<uuid:quiz_id>/', views.quiz_detail, name='quiz_detail'),
    path('generate/', views.generate_quiz, name='generate_quiz'),
    path('<uuid:quiz_id>/delete/', views.delete_quiz, name='delete_quiz'),
    
    # Quiz sessions for persistent timer and state
    path('<uuid:quiz_id>/start-session/', views.start_quiz_session, name='start_quiz_session'),
    path('<uuid:quiz_id>/check-session/', views.check_active_session, name='check_active_session'),
    path('check-active-session/', views.check_any_active_session, name='check_any_active_session'),
    path('session/<uuid:session_id>/', views.get_quiz_session, name='get_quiz_session'),
    path('session/<uuid:session_id>/update/', views.update_quiz_session, name='update_quiz_session'),
    path('session/<uuid:session_id>/save-answer/', views.save_answer_immediately, name='save_answer_immediately'),
    path('session/<uuid:session_id>/complete/', views.complete_quiz_session, name='complete_quiz_session'),
    
    # Quiz taking and submission
    path('submit/', views.submit_quiz, name='submit_quiz'),
    
    # Quiz attempts and statistics
    path('attempts/', views.quiz_attempts, name='quiz_attempts'),
    path('stats/', views.quiz_stats, name='quiz_stats'),
]
