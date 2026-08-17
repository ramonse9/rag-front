export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <p className="mb-2 text-sm font-semibold tracking-wide text-blue-700 uppercase">
          Resume intelligence
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Ramon Guzman - AI Resume
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Ask questions about Ramon&apos;s professional experience, technologies, projects,
          and skills.
        </p>
      </div>
    </header>
  );
}
