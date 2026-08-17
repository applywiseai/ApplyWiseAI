import { requireUser } from "@/lib/auth";
import Sidebar from "@/components/sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[#07111f] text-slate-100">
      <Sidebar user={user} />

      <main className="min-h-screen lg:pl-64">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:py-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
