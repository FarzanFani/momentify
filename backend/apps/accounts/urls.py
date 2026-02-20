from django.urls import path
from .views import UserRegisterView, MeView, ProviderDashboardView, UserListView, update_user, UserAddView

urlpatterns = [
    path("register/", UserRegisterView.as_view(), name="user-register"),
    path("add/", UserAddView.as_view(), name="user-add"),
    path("me/", MeView.as_view(), name="user-me"),
    path("provider/dashboard/", ProviderDashboardView.as_view()),
    path("users/", UserListView.as_view(), name="user-list"),
    path("users/<uuid:pk>/", update_user, name="user-update"),
    # path("users/<uuid:pk>/", UserUpdateView.as_view(), name="user-update"),
    # path("users/<uuid:pk>/", UserDeleteView.as_view(), name="user-delete"),
]
