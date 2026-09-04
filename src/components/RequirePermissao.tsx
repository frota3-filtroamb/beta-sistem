'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { podeAcessar, type Permissao } from '@/lib/roles'

export default function RequirePermissao({
  permissao,
  children,
}: {
  permissao: Permissao
  children: React.ReactNode
}) {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    if (!podeAcessar(user, permissao)) {
      router.replace('/portaria')
    }
  }, [isLoaded, user, permissao, router])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a1625] text-slate-400">
        Carregando...
      </div>
    )
  }

  if (!podeAcessar(user, permissao)) {
    return null
  }

  return <>{children}</>
}