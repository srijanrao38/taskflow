from django.db import models

# Create your models here.

class Task(models.Model):
    PRIORITY_CHOICES=[
        ('low','Low'),
        ('medium','Medium'),
        ('high','High'),
    ]
    STATUS_CHOICES=[
        ('pending','Pending'),
        ('in_progress','In Progress'),
        ('completed','Completed'),
    ]
    title=models.CharField(max_length=100)
    description=models.TextField()
    due_date=models.DateField()
    priority=models.CharField(max_length=10,choices=PRIORITY_CHOICES)
    status=models.CharField(max_length=20,choices=STATUS_CHOICES,default='pending')
    created_at=models.DateTimeField(auto_now_add=True)

    def __str___(self):
        return self.title