import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'

export default function Page() {
  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - banner */}
      <div className="hidden lg:flex w-1/2 relative">
        <img
          src="/images/banner-frota.jpg"
          alt="Filtroamb"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1625]/90 to-[#0a1625]/50" />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <div>
            <img
              src="/images/logo-filtroamb.png"
              alt="Filtroamb"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white leading-tight">
              Gestão de Frota
            </h1>
            <p className="text-emerald-300 mt-2 text-sm">
              Sistema interno Filtroamb
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Acesso restrito a colaboradores autorizados
          </p>
        </div>
      </div>

      {/* Lado direito - login */}
      <div className="flex-1 flex items-center justify-center bg-[#0a1625] p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center">
            <img
              src="/images/logo-filtroamb.png"
              alt="Filtroamb"
              className="h-10 w-auto object-contain"
            />
          </div>

       <SignIn
     path="/sign-in"
     signUpUrl="/sign-up"
      appearance={{
      elements: {
      rootBox: 'mx-auto',
      card: 'bg-[#0f1c2e] border border-emerald-500/15 shadow-2xl',
      headerTitle: 'text-white',
      headerSubtitle: 'text-slate-400',
      socialButtonsBlockButton:
        'bg-[#132337] border border-white/10 text-white hover:bg-[#1a2d45]',
      formFieldLabel: 'text-slate-300',
      formFieldInput:
        'bg-[#132337] border border-emerald-500/20 text-white',
      footerActionLink: 'text-emerald-400 hover:text-emerald-300',
      formButtonPrimary:
        'bg-emerald-500 hover:bg-emerald-400 text-[#0a1625]',
      identityPreviewText: 'text-white',
      identityPreviewEditButton: 'text-emerald-400',
           },
          }}
            />            

        </div>
      </div>
    </div>
  )
}