from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApplicationViewSet, PublicApplicationTrackView, DocumentDownloadView

router = DefaultRouter()
router.register(r'applications', ApplicationViewSet, basename='application')

urlpatterns = [
    path('applications/download_doc/', DocumentDownloadView.as_view(), name='download-doc'),
    path('applications/download_doc', DocumentDownloadView.as_view()),
    path('applications/track/', PublicApplicationTrackView.as_view(), name='public-application-track'),
    path('applications/track', PublicApplicationTrackView.as_view()),
    path('applications/toggle_window/', ApplicationViewSet.as_view({'get': 'toggle_window', 'post': 'toggle_window'}), name='toggle-window'),
    path('applications/toggle_window', ApplicationViewSet.as_view({'get': 'toggle_window', 'post': 'toggle_window'})),
    path('', include(router.urls)),
]
