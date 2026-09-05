from django.db.models import Q
from django.contrib.auth import authenticate

from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.pagination import PageNumberPagination

from .models import Student
from .serializers import StudentSerializer


# =========================================================
# LOGIN
# =========================================================

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
        {
            "error": "Invalid username or password"
        },
        status=status.HTTP_401_UNAUTHORIZED
    )


# =========================================================
# STUDENT LIST
# GET  -> View students
# POST -> Add student
# =========================================================

@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def student_list(request):

    # =====================================================
    # GET STUDENTS
    # =====================================================

    if request.method == 'GET':

        students = Student.objects.all()

        # -------------------------------------------------
        # SEARCH
        # -------------------------------------------------

        search = request.GET.get(
            'search',
            ''
        ).strip()

        # -------------------------------------------------
        # DEPARTMENT FILTER
        # -------------------------------------------------

        department = request.GET.get(
            'department',
            ''
        ).strip()

        # -------------------------------------------------
        # COURSE FILTER
        # -------------------------------------------------

        course = request.GET.get(
            'course',
            ''
        ).strip()

        # -------------------------------------------------
        # APPLY SEARCH
        # -------------------------------------------------

        if search:

            students = students.filter(
                Q(student_id__icontains=search) |
                Q(name__icontains=search) |
                Q(email__icontains=search) |
                Q(department__icontains=search)
            )

        # -------------------------------------------------
        # APPLY DEPARTMENT FILTER
        # -------------------------------------------------

        if department:

            students = students.filter(
                department__iexact=department
            )

        # -------------------------------------------------
        # APPLY COURSE FILTER
        # -------------------------------------------------

        if course:

            students = students.filter(
                course__iexact=course
            )

        # =================================================
        # PAGINATION
        # =================================================

        paginator = PageNumberPagination()

        # 5 students per page
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

    # =====================================================
    # POST - ADD STUDENT
    # =====================================================

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


# =========================================================
# STUDENT DETAIL
# GET    -> View one student
# PUT    -> Update student
# PATCH  -> Partial update
# DELETE -> Delete student
# =========================================================

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def student_detail(request, pk):

    # =====================================================
    # FIND STUDENT
    # =====================================================

    try:

        student = Student.objects.get(
            pk=pk
        )

    except Student.DoesNotExist:

        return Response(
            {
                "error": "Student not found"
            },
            status=status.HTTP_404_NOT_FOUND
        )

    # =====================================================
    # GET ONE STUDENT
    # =====================================================

    if request.method == 'GET':

        serializer = StudentSerializer(
            student
        )

        return Response(
            serializer.data
        )

    # =====================================================
    # PUT / PATCH - UPDATE STUDENT
    # =====================================================

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

    # =====================================================
    # DELETE STUDENT
    # =====================================================

    elif request.method == 'DELETE':

        student.delete()

        return Response(
            {
                "message": "Student deleted successfully"
            },
            status=status.HTTP_204_NO_CONTENT
        )