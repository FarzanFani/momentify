from django.urls import path
from .views import UserRegisterView
from .views import ProviderDashboardView
from . import views

urlpatterns = [
    path("register/", UserRegisterView.as_view(), name="user-register"),
    path("provider/dashboard/", ProviderDashboardView.as_view()),
]
