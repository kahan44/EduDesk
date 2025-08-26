from rest_framework import serializers
from .models import Quiz, Question, QuestionOption, QuizAttempt
from apps.documents.serializers import DocumentListSerializer


class QuestionOptionSerializer(serializers.ModelSerializer):
    """Serializer for question options"""
    
    class Meta:
        model = QuestionOption
        fields = ['id', 'option_letter', 'option_text']


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for quiz questions"""
    options = QuestionOptionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_number', 'options', 'explanation']


class QuestionWithAnswerSerializer(QuestionSerializer):
    """Serializer for questions with correct answers (for results)"""
    
    class Meta(QuestionSerializer.Meta):
        fields = QuestionSerializer.Meta.fields + ['correct_answer']


class QuizSerializer(serializers.ModelSerializer):
    """Serializer for quiz model"""
    document_title = serializers.CharField(source='document.title', read_only=True)
    document_filename = serializers.CharField(source='document.original_filename', read_only=True)
    questions_count = serializers.IntegerField(source='questions.count', read_only=True)
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'difficulty', 'status', 'time_limit', 
            'total_questions', 'created_at', 'updated_at',
            'document_title', 'document_filename', 'questions_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuizDetailSerializer(QuizSerializer):
    """Detailed serializer for quiz with questions"""
    questions = QuestionSerializer(many=True, read_only=True)
    document = DocumentListSerializer(read_only=True)
    
    class Meta(QuizSerializer.Meta):
        fields = QuizSerializer.Meta.fields + ['questions', 'document']


class QuizGenerationRequestSerializer(serializers.Serializer):
    """Serializer for quiz generation request"""
    document_id = serializers.UUIDField()
    difficulty = serializers.ChoiceField(choices=Quiz.DIFFICULTY_CHOICES)
    title = serializers.CharField(max_length=255, required=False)
    
    def validate_title(self, value):
        if not value:
            # Generate default title based on document and difficulty
            return f"Quiz - {self.initial_data.get('difficulty', 'medium').title()}"
        return value


class QuizAttemptSerializer(serializers.ModelSerializer):
    """Serializer for quiz attempts"""
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    quiz_difficulty = serializers.CharField(source='quiz.difficulty', read_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'score', 'total_questions', 'attempted_questions', 'time_taken', 
            'completed_at', 'percentage_score', 'quiz_title', 'quiz_difficulty'
        ]
        read_only_fields = ['id', 'completed_at', 'percentage_score']


class QuizSubmissionSerializer(serializers.Serializer):
    """Serializer for quiz submission"""
    quiz_id = serializers.UUIDField()
    answers = serializers.DictField(
        child=serializers.CharField(max_length=1),
        help_text="Dictionary with question_id as key and selected option (A/B/C/D) as value"
    )
    time_taken = serializers.IntegerField(min_value=1)
