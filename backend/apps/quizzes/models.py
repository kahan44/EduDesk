from django.db import models
from django.contrib.auth import get_user_model
from apps.documents.models import Document
import uuid

User = get_user_model()

class Quiz(models.Model):
    """Model for storing quiz information"""
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('completed', 'Completed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quizzes')
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    time_limit = models.PositiveIntegerField(default=1800, help_text="Time limit in seconds (default: 30 minutes)")
    total_questions = models.PositiveIntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'
    
    def __str__(self):
        return f"{self.title} - {self.difficulty} ({self.user.username})"


class Question(models.Model):
    """Model for storing quiz questions"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_number = models.PositiveIntegerField()
    correct_answer = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    explanation = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['question_number']
        unique_together = ['quiz', 'question_number']
    
    def __str__(self):
        return f"Q{self.question_number}: {self.question_text[:50]}..."


class QuestionOption(models.Model):
    """Model for storing question options"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_letter = models.CharField(max_length=1, choices=[('A', 'A'), ('B', 'B'), ('C', 'C'), ('D', 'D')])
    option_text = models.TextField()
    
    class Meta:
        unique_together = ['question', 'option_letter']
        ordering = ['option_letter']
    
    def __str__(self):
        return f"{self.option_letter}: {self.option_text[:30]}..."


class QuizSession(models.Model):
    """Model for tracking ongoing quiz sessions with persistent state"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_sessions')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='sessions')
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    time_elapsed = models.PositiveIntegerField(default=0, help_text="Time elapsed in seconds")
    current_answers = models.JSONField(default=dict, help_text="Current answers in progress")
    current_question = models.PositiveIntegerField(default=0, help_text="Current question index")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    class Meta:
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', 'quiz', 'status']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'quiz'],
                condition=models.Q(status__in=['active', 'paused']),
                name='unique_active_session_per_user_quiz'
            )
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} ({self.status})"
    
    @property
    def time_remaining(self):
        """Calculate remaining time in seconds"""
        total_time = self.quiz.time_limit * 60
        return max(0, total_time - self.time_elapsed)
    
    @property
    def is_expired(self):
        """Check if quiz session has expired"""
        return self.time_remaining <= 0
    
    def update_elapsed_time(self):
        """Update elapsed time based on start time"""
        from django.utils import timezone
        if self.started_at:
            elapsed = timezone.now() - self.started_at
            self.time_elapsed = int(elapsed.total_seconds())
            if self.is_expired and self.status == 'active':
                self.status = 'expired'
            self.save()
        return self.time_elapsed


class QuizAttempt(models.Model):
    """Model for storing quiz attempts and results"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField()
    attempted_questions = models.PositiveIntegerField(default=0, help_text="Number of questions actually attempted by the student")
    time_taken = models.PositiveIntegerField(help_text="Time taken in seconds")
    completed_at = models.DateTimeField(auto_now_add=True)
    answers = models.JSONField(default=dict, help_text="Store user answers in JSON format")
    
    class Meta:
        ordering = ['-completed_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} ({self.score}/{self.total_questions})"
    
    @property
    def percentage_score(self):
        """Calculate percentage score"""
        if self.total_questions > 0:
            return round((self.score / self.total_questions) * 100, 2)
        return 0
