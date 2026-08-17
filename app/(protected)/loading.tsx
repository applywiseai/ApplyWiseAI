export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">

      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-10 w-72 rounded-lg bg-slate-200" />
          <div className="h-4 w-80 rounded bg-slate-200" />
        </div>

        <div className="h-11 w-40 rounded-xl bg-slate-200" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b p-6">
          <div className="h-5 w-48 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-64 rounded bg-slate-100" />
        </div>

        <div className="space-y-0">
          {[1, 2, 3, 4, 5].map((x) => (
            <div
              key={x}
              className="flex items-center gap-6 border-b p-5"
            >
              <div className="h-4 w-40 rounded bg-slate-100" />
              <div className="h-4 w-32 rounded bg-slate-100" />
              <div className="h-6 w-20 rounded-full bg-slate-100" />
              <div className="h-4 w-24 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex justify-between">
        <div>
          <div className="h-4 w-28 rounded bg-slate-100" />
          <div className="mt-4 h-9 w-16 rounded bg-slate-200" />
        </div>

        <div className="h-11 w-11 rounded-xl bg-slate-100" />
      </div>

      <div className="mt-6 h-4 w-24 rounded bg-slate-100" />
    </div>
  );
}
