import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // If on the login page or auth callbacks, render directly
  if (pathname === "/admin/login" || pathname.startsWith("/admin/auth/")) {
    return <>{children}</>;
  }

  // Fetch verified admin session
  const user = await getAdminSession();

  // If not authenticated, redirect to login
  if (!user) {
    redirect(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
  }

  return (
    <div className="min-h-screen flex bg-[var(--light-ash)]">
      {/* Sidebar (Fixed 240px width) */}
      <AdminSidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 pl-60 flex flex-col min-h-screen">
        {/* Top Bar */}
        <AdminTopBar userEmail={user.email} />

        {/* Content Body */}
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
