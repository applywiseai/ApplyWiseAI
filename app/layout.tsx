import { requireUser } from "@/lib/auth";
import Sidebar from "@/components/sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[#071426]">
      <Sidebar user={user} />

      <main className="min-h-screen md:ml-64">
        <div className="w-full p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
