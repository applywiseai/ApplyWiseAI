export default function Loading() {
  return (
    <div className="space-y-7 animate-pulse">

      <div className="flex items-end justify-between">
        <div>
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="mt-3 h-9 w-48 rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-80 rounded bg-slate-100" />
        </div>

        <div className="h-11 w-40 rounded-xl bg-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((x) => (
          <div
            key={x}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="h-4 w-28 rounded bg-slate-100" />
            <div className="mt-3 h-8 w-12 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b p-6">
          <div className="h-5 w-48 rounded bg-slate-200" />
          <div className="mt-2 h-4 w-60 rounded bg-slate-100" />
        </div>

        {[1, 2, 3, 4, 5, 6].map((x) => (
          <div
            key={x}
            className="flex items-center gap-6 border-b p-6"
          >
            <div className="h-4 w-40 rounded bg-slate-100" />
            <div className="h-4 w-32 rounded bg-slate-100" />
            <div className="h-6 w-20 rounded-full bg-slate-100" />
            <div className="h-4 w-24 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
