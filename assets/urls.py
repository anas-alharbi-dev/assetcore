from rest_framework.routers import DefaultRouter
from .views import AssetViewSet, EmployeeViewSet, AssignmentViewSet

router = DefaultRouter()
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'assignments', AssignmentViewSet, basename='assignment')

urlpatterns = router.urls