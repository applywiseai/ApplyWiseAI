import { requireUser } from "@/lib/auth";
import Sidebar from "@/components/sidebar";

export default async function Shell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[#071426]">
      <Sidebar user={user} />

      <main className="min-h-screen md:ml-64">
        <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
