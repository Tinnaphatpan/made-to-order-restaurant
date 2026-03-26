import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-x-hidden pb-16 md:pb-0">
        {children}
      </div>
    </div>
  );
}
