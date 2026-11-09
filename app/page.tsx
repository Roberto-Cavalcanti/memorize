'use client'

import { AuthProvider } from '@/context/auth-context'
import { AppRouter } from '@/components/app-router'

export default function Page() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
