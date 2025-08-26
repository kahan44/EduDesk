from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('quiz-attempts/', views.get_quiz_attempts_analytics, name='quiz_attempts_analytics'),
    path('quiz/<uuid:quiz_id>/detailed/', views.get_detailed_quiz_analytics, name='detailed_quiz_analytics'),
    path('overall/', views.get_overall_analytics, name='overall_analytics'),
]
