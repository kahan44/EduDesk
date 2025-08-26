from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Simplified User model for EduDesk with only basic fields
    """
    email = models.EmailField(unique=True)
    
    # Use email as the primary authentication field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
