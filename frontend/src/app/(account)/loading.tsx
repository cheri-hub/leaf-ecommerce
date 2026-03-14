export default function AccountLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-secondary/40 rounded" />
        <div className="bg-white rounded-lg border border-border p-6 space-y-4">
          <div className="h-4 w-full bg-secondary/40 rounded" />
          <div className="h-4 w-3/4 bg-secondary/40 rounded" />
          <div className="h-4 w-1/2 bg-secondary/40 rounded" />
        </div>
        <div className="bg-white rounded-lg border border-border p-6 space-y-4">
          <div className="h-4 w-full bg-secondary/40 rounded" />
          <div className="h-4 w-2/3 bg-secondary/40 rounded" />
        </div>
      </div>
    </div>
  );
}
