'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is just a redirector from the root of the app group to the dashboard.
export default function AppPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return null; // Or a loading spinner
}
