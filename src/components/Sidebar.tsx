'use client'

import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Sidebar() {
  const pathname = usePathname()
  const [portariaAberta, setPortariaAberta] = useState(
    pathname === '/portaria' || pathname === '/liberacao'
  )

  const ativo = (href: string) => pathname === href

  return (
    <aside className="w-64 bg-[#0b1f33] text-white flex flex-col fixed h-full z-20 border-r border-white/5">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src="/images/logo-filtroamb.png"
            alt="Filtroamb"
            className="h-9 w-auto object-contain"
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-2">Gestão de Frota</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Menu
        </p>

        {/* Veículos */}
        <a
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
            ativo('/')
              ? 'bg-emerald-500/15 text-emerald-300 font-medium'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          }`}
        >
          <span className="text-base">🚚</span>
          <span>Veículos</span>
        </a>

        {/* Portaria (expansível) */}
        <div>
          <button
            type="button"
            onClick={() => setPortariaAberta(!portariaAberta)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
              pathname === '/portaria' || pathname === '/liberacao'
                ? 'bg-emerald-500/10 text-emerald-300 font-medium'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-base">🚪</span>
              <span>Portaria</span>
            </span>
            <span className={`text-xs transition-transform ${portariaAberta ? 'rotate-90' : ''}`}>
              ▶
            </span>
          </button>

          {portariaAberta && (
            <div className="mt-1 ml-4 pl-3 border-l border-white/10 space-y-1">
              <a
                href="/portaria"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  ativo('/portaria')
                    ? 'bg-emerald-500/15 text-emerald-300 font-medium'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>Controle</span>
              </a>
              <a
                href="/liberacao"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  ativo('/liberacao')
                    ? 'bg-emerald-500/15 text-emerald-300 font-medium'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>Liberação</span>
              </a>
            </div>
          )}
        </div>
      </nav>

      {/* Rodapé */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-[11px] text-slate-500">Sistema Interno</p>
        <p className="text-[10px] text-slate-600 mt-0.5">v0.2</p>
      </div>
    </aside>
  )
}