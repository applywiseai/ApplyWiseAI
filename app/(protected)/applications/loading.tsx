export default function Loading() {
  return (
    <div className="space-y-8 pb-12 animate-pulse">
      {/* Header */}
      <div className="flex items-end justify-between gap-5">
        <div className="space-y-3">
          <div className="h-3 w-32 rounded-full bg-slate-200" />
          <div className="h-10 w-64 rounded-xl bg-slate-200" />
          <div className="h-4 w-80 rounded-full bg-slate-100" />
        </div>

        <div className="h-11 w-40 rounded-xl bg-slate-200" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((x) => (
          <div
            key={x}
            className="h-32 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="h-3 w-24 rounded-full bg-slate-200" />
            <div className="mt-5 h-8 w-12 rounded-lg bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-6">
          <div className="h-5 w-44 rounded bg-slate-200" />
          <div className="mt-2 h-3 w-56 rounded bg-slate-100" />
        </div>

        <div className="space-y-0">
          {[1, 2, 3, 4, 5].map((x) => (
            <div
              key={x}
              className="flex items-center gap-5 border-b border-slate-100 px-7 py-5"
            >
              <div className="h-10 w-10 rounded-xl bg-slate-100" />
              <div className="flex-1">
                <div className="h-4 w-44 rounded bg-slate-200" />
                <div className="mt-2 h-2.5 w-20 rounded bg-slate-100" />
              </div>
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-6 w-20 rounded-full bg-slate-100" />
              <div className="h-4 w-24 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
