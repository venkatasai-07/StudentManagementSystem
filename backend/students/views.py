from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes
)

from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated

from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination

from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

from .models import Student
from .serializers import StudentSerializer


@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def student_list(request):

    # GET - View students with pagination
    if request.method == 'GET':

        students = Student.objects.all()

        paginator = PageNumberPagination()
        paginator.page_size = 5

        result_page = paginator.paginate_queryset(
            students,
            request
        )

        serializer = StudentSerializer(
            result_page,
            many=True
        )

        return paginator.get_paginated_response(
            serializer.data
        )

    # POST - Add student
    elif request.method == 'POST':

        serializer = StudentSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def student_detail(request, pk):

    try:
        student = Student.objects.get(pk=pk)

    except Student.DoesNotExist:

        return Response(
            {"error": "Student not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # GET - View one student
    if request.method == 'GET':

        serializer = StudentSerializer(
            student
        )

        return Response(
            serializer.data
        )

    # PUT/PATCH - Edit student
    elif request.method in ['PUT', 'PATCH']:

        serializer = StudentSerializer(
            student,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # DELETE - Delete student
    elif request.method == 'DELETE':

        student.delete()

        return Response(
            {"message": "Student deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )


@api_view(['POST'])
def login(request):

    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(
        username=username,
        password=password
    )

    if user is not None:

        token, created = Token.objects.get_or_create(
            user=user
        )

        return Response({
            "message": "Login successful",
            "token": token.key,
            "username": user.username
        })

    return Response(
        {"error": "Invalid username or password"},
        status=status.HTTP_401_UNAUTHORIZED
    )