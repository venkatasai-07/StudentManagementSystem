from django.db import models

class Student(models.Model):
    student_id = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10)
    course = models.CharField(max_length=100)
    department = models.CharField(max_length=100)
    year = models.CharField(max_length=20)
    address = models.TextField()

    def __str__(self):
        return self.name
