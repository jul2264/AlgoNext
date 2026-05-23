from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/dsa/', include('apps.curriculum.urls')),
    path('api/v1/problems/', include('apps.problems.urls')),
    path('api/v1/submissions/', include('apps.submissions.urls')),
    path('api/v1/progress/', include('apps.progress.urls')),
    path('api/v1/adaptive/', include('apps.adaptive.urls')),
    path('api/v1/faculty/', include('apps.faculty.urls')),
]

from django.conf import settings
if settings.DEBUG:
    import debug_toolbar
    urlpatterns = [
        path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns
