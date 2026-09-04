from django.urls import path
from .views import student_list, student_detail, login

urlpatterns = [
    path('students/', student_list),
    path('students/<int:pk>/', student_detail),
    path('login/', login),
]