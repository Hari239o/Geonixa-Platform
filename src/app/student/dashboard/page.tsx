import ProtectedLayout from '@/components/dashboard/ProtectedLayout';
import StudentDashboardComponent from '@/components/dashboard/StudentDashboard';

export default function StudentDashboardPage() {
  return (
    <ProtectedLayout requiredRole="any" title="Student Dashboard">
      <StudentDashboardComponent />
    </ProtectedLayout>
  );
}
