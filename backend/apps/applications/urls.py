from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet

router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('applications/toggle_window/', ApplicationViewSet.as_view({'get': 'toggle_window', 'post': 'toggle_window'}), name='toggle-window'),
    path('applications/toggle_window', ApplicationViewSet.as_view({'get': 'toggle_window', 'post': 'toggle_window'})),
    path('', include(router.urls)),
]
