export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 bg-secondary/40 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-border p-6">
            <div className="h-4 w-24 bg-secondary/40 rounded mb-3" />
            <div className="h-6 w-16 bg-secondary/40 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-border p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 bg-secondary/40 rounded" />
        ))}
      </div>
    </div>
  );
}
