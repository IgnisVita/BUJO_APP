export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20">
          <svg
            className="h-12 w-12 text-primary-600 dark:text-primary-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          </svg>
        </div>
        
        <h1 className="mt-6 text-3xl font-display font-bold tracking-tight text-neutral-900 dark:text-white">
          You&apos;re Offline
        </h1>
        
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
          It looks like you&apos;ve lost your internet connection. Some features may be unavailable until you&apos;re back online.
        </p>
        
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="rounded-md bg-white dark:bg-neutral-800 px-4 py-2.5 text-sm font-semibold text-neutral-900 dark:text-white shadow-sm ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            Go Back
          </button>
        </div>
        
        <div className="mt-12 text-sm text-neutral-500 dark:text-neutral-400">
          <p>Your journal data is safely stored locally.</p>
          <p className="mt-1">You can continue working offline with limited functionality.</p>
        </div>
      </div>
    </div>
  )
}