from rest_framework import generics, status
from .serializers import UserRegisterSerializer, UserSerializer, UserListSerializer, UserUpdateSerializer, UserAddSerializer
from .models import User
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .permissions import IsProvider
from rest_framework.decorators import api_view, permission_classes
from utils.response import success_response, error_response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter



class UserRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response(
            data=serializer.data,
            message="Registration successful",
            status_code=status.HTTP_201_CREATED,
        )

class UserAddView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserAddSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return success_response(
            data=serializer.data,
            message="User added successfully",
            status_code=status.HTTP_201_CREATED,
        )

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return success_response(data=serializer.data)


class ProviderDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsProvider]
    def get(self, request):
        return success_response(message="Welcome Provider")

class UserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminUser]
    queryset = User.objects.all()
    serializer_class = UserListSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ["is_verified", "is_active"]
    search_fields = ["email", "first_name", "last_name"]
    ordering_fields = ["first_name", "last_name"]

    def get_queryset(self):
        queryset = super().get_queryset()
        role_in = self.request.query_params.get("role__in")
        role = self.request.query_params.get("role")

        if role_in:
            roles = [item.strip() for item in role_in.split(",") if item.strip()]
            if roles:
                queryset = queryset.filter(role__in=roles)
        elif role:
            queryset = queryset.filter(role=role)
        return queryset

@api_view(["PATCH", "PUT"])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_user(request, pk):
    try:
        user = User.objects.get(id=pk)
    except User.DoesNotExist:
        return error_response(message="User not found", status_code=status.HTTP_404_NOT_FOUND)  
    except Exception as e:
        return error_response(message=str(e), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    serializers = UserUpdateSerializer(user, data=request.data, partial=True)
    if serializers.is_valid():
        serializers.save()
        return success_response(data=serializers.data, message="User updated successfully", status_code=status.HTTP_200_OK)
    return error_response(message="User update failed", status_code=status.HTTP_400_BAD_REQUEST, errors=serializers.errors)
