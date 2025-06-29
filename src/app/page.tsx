import Link from 'next/link'

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
          {/* Badge */}
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full bg-primary-600/10 px-3 py-1 text-sm font-semibold leading-6 text-primary-600 ring-1 ring-inset ring-primary-600/10">
                What&apos;s new
              </span>
              <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-neutral-600 dark:text-neutral-400">
                <span>Just shipped v1.0</span>
              </span>
            </a>
          </div>
          
          {/* Hero Content */}
          <h1 className="mt-10 text-4xl font-display font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl">
            Your Digital
            <span className="text-primary-600"> Bullet Journal</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
            Experience the power of analog bullet journaling in a digital format. 
            Organize your thoughts, track your habits, and achieve mindful productivity 
            with our beautifully designed Progressive Web App.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-10 flex items-center gap-x-6">
            <Link
              href="/journal"
              className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
            >
              Get started
            </Link>
            <Link 
              href="/about" 
              className="text-sm font-semibold leading-6 text-neutral-900 dark:text-white hover:text-primary-600 transition-colors"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        
        {/* Hero Image/Graphic */}
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="relative">
              {/* Placeholder for hero image */}
              <div className="relative rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 p-1">
                <div className="relative aspect-[16/9] w-[76rem] rounded-lg bg-neutral-900/5 dark:bg-white/5 backdrop-blur-sm ring-1 ring-neutral-900/10 dark:ring-white/10 sm:w-[57rem]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto h-24 w-24 rounded-full bg-primary-600/20 flex items-center justify-center">
                        <svg className="h-12 w-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <p className="mt-4 text-lg font-medium text-neutral-600 dark:text-neutral-400">
                        Journal Preview Coming Soon
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative blur */}
              <div className="absolute -inset-x-20 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
                <div
                  className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-400 to-secondary-400 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                  style={{
                    clipPath:
                      'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            Everything you need
          </h2>
          <p className="mt-2 text-3xl font-display font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Bullet journaling, reimagined
          </p>
          <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
            All the flexibility of traditional bullet journaling with the power of digital organization.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-neutral-900 dark:text-white">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary-600">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                Rapid Logging
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600 dark:text-neutral-400">
                <p className="flex-auto">
                  Capture thoughts quickly with our intuitive rapid logging system. 
                  Tasks, events, and notes - all in one place.
                </p>
              </dd>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-neutral-900 dark:text-white">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary-600">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                Custom Collections
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600 dark:text-neutral-400">
                <p className="flex-auto">
                  Create custom collections for anything - habit tracking, gratitude logs, 
                  or project planning. Your journal, your rules.
                </p>
              </dd>
            </div>
            
            {/* Feature 3 */}
            <div className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-neutral-900 dark:text-white">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary-600">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                Works Offline
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600 dark:text-neutral-400">
                <p className="flex-auto">
                  As a Progressive Web App, your journal works offline. 
                  Write anywhere, sync when connected.
                </p>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="relative isolate mt-32 px-6 py-32 sm:mt-40 sm:py-40 lg:px-8">
        <div className="absolute inset-x-0 top-0 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-400 to-secondary-400 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-display font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
            Start your journaling journey today
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-neutral-600 dark:text-neutral-400">
            Join thousands who have transformed their productivity and mindfulness 
            with digital bullet journaling.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/journal"
              className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
            >
              Get started for free
            </Link>
            <Link 
              href="/features" 
              className="text-sm font-semibold leading-6 text-neutral-900 dark:text-white hover:text-primary-600 transition-colors"
            >
              View all features <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}