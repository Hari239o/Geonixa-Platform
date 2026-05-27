import ProtectedLayout from '@/components/dashboard/ProtectedLayout';
import AdminDashboardComponent from '@/components/dashboard/AdminDashboard';

export default function AdminPage() {
  return (
    <ProtectedLayout requiredRole="admin" title="Admin Dashboard">
      <AdminDashboardComponent />
    </ProtectedLayout>
  );
}