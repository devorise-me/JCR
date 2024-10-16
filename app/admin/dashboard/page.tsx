import AdminDashboard from "@/components/admin/Dashboard";

export default function DashboardPage() {
  const role = "ADMIN";
  return (
    <div>
      <AdminDashboard role={role} />
    </div>
  );
}
