from django.contrib import admin
from .models import Quiz, Question, QuestionOption, QuizAttempt,QuizSession


class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 4  # Show 4 empty option forms by default
    max_num = 4  # Maximum 4 options per question


class QuestionInline(admin.StackedInline):
    model = Question
    extra = 0
    show_change_link = True


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'difficulty', 'status', 'created_at', 'question_count')
    list_filter = ('difficulty', 'status', 'created_at')
    search_fields = ('title', 'user__username', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'user', 'document', 'difficulty', 'status')
        }),
        ('Timing', {
            'fields': ('time_limit', 'total_questions')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    inlines = [QuestionInline]
    
    def question_count(self, obj):
        return obj.questions.count()
    question_count.short_description = 'Questions'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text_short', 'quiz', 'question_number', 'correct_answer')
    list_filter = ('quiz__difficulty', 'correct_answer')
    search_fields = ('question_text', 'quiz__title')
    ordering = ('quiz', 'question_number')
    
    fieldsets = (
        ('Question Details', {
            'fields': ('quiz', 'question_number', 'question_text', 'correct_answer', 'explanation')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    inlines = [QuestionOptionInline]
    
    def question_text_short(self, obj):
        return obj.question_text[:50] + "..." if len(obj.question_text) > 50 else obj.question_text
    question_text_short.short_description = 'Question'


@admin.register(QuestionOption)
class QuestionOptionAdmin(admin.ModelAdmin):
    list_display = ('question', 'option_letter', 'option_text_short')
    list_filter = ('option_letter', 'question__quiz__difficulty')
    search_fields = ('option_text', 'question__question_text')
    
    def option_text_short(self, obj):
        return obj.option_text[:30] + "..." if len(obj.option_text) > 30 else obj.option_text
    option_text_short.short_description = 'Option Text'


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'score', 'total_questions', 'percentage_score', 'time_taken', 'completed_at')
    list_filter = ('quiz__difficulty', 'completed_at', 'score')
    search_fields = ('user__username', 'user__email', 'quiz__title')
    readonly_fields = ('id', 'percentage_score', 'completed_at')
    
    fieldsets = (
        ('Attempt Information', {
            'fields': ('user', 'quiz', 'score', 'total_questions', 'percentage_score')
        }),
        ('Timing', {
            'fields': ('time_taken',)
        }),
        ('Answers', {
            'fields': ('answers',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('id', 'completed_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'quiz')


admin.site.register(QuizSession)