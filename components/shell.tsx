import { requireUser } from "@/lib/auth";
import Sidebar from "@/components/sidebar";

export default async function Shell({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div>
      <Sidebar user={user} />

      <main className="md:ml-64 min-h-screen p-5 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
