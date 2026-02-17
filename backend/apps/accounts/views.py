from rest_framework import generics, status
from .serializers import UserRegisterSerializer
from .models import User
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .permissions import IsProvider
from rest_framework.decorators import api_view, permission_classes
from utils.response import success_response


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


class ProviderDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsProvider]

    def get(self, request):
        return success_response(message="Welcome Provider")