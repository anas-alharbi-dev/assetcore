from rest_framework.routers import DefaultRouter
from .views import AssetViewSet, EmployeeViewSet, AssignmentViewSet

router = DefaultRouter()
router.register(r'assets', AssetViewSet)
router.register(r'employees', EmployeeViewSet)
router.register(r'assignments', AssignmentViewSet)

urlpatterns = router.urls