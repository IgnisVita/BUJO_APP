// ABOUTME: Dynamic date routing for journal entries - supports /journal/2025-01-15 format
// Redirects to main journal page with the specified date selected

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { isValid, parse } from 'date-fns';

interface DatePageProps {
  params: {
    date: string;
  };
}

export default function DatePage({ params }: DatePageProps) {
  const router = useRouter();
  
  useEffect(() => {
    // Parse the date parameter
    const dateStr = params.date;
    
    // Try to parse the date in YYYY-MM-DD format
    const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
    
    if (isValid(parsedDate)) {
      // Redirect to main journal page with date in URL hash/query
      // For now, we'll redirect to the main journal page
      // In a full implementation, you'd pass the date as a query parameter
      router.replace(`/journal?date=${dateStr}`);
    } else {
      // Invalid date format, redirect to today's journal
      router.replace('/journal');
    }
  }, [params.date, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-neutral-600 dark:text-neutral-400">
          Loading journal for {params.date}...
        </p>
      </motion.div>
    </div>
  );
}