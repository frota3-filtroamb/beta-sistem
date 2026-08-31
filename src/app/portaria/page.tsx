'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'

type Movimentacao = {
  id: number
  placa: string
  km: number | null
  motorista: string | null
  localizacao: string | null
  destino: string | null
  status: string
  liberado_em: string | null
  saida_em: string | null
  entrada_em: string | null
}

export default function PortariaPage() {
  const supabase = createClient()
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState('')
  const [historico, setHistorico] = useState<Movimentacao[]>([])

async function carregar() {
  setCarregando(true)

  // Veículos aguardando saída ou em rota
  const { data: ativos, error: erroAtivos } = await supabase
    .from('movimentacoes')
    .select('*')
    .in('status', ['aguardando_saida', 'em_rota'])
    .order('liberado_em', { ascending: false })

  // Histórico (já finalizaram)
  const { data: finalizados, error: erroFinalizados } = await supabase
    .from('movimentacoes')
    .select('*')
    .eq('status', 'finalizado')
    .order('entrada_em', { ascending: false })
    .limit(30)

  if (erroAtivos || erroFinalizados) {
    setMensagem('Erro ao carregar dados')
  } else {
    setMovimentacoes(ativos || [])
    setHistorico(finalizados || [])
  }

  setCarregando(false)
}

  useEffect(() => {
    carregar()
  }, [])

  async function registrarSaida(id: number) {
    const { error } = await supabase
      .from('movimentacoes')
      .update({
        status: 'em_rota',
        saida_em: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setMensagem('Erro ao registrar saída: ' + error.message)
      return
    }

    setMensagem('Saída registrada com sucesso!')
    carregar()
  }

  async function registrarEntrada(id: number) {
    const { error } = await supabase
      .from('movimentacoes')
      .update({
        status: 'finalizado',
        entrada_em: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      setMensagem('Erro ao registrar entrada: ' + error.message)
      return
    }

    setMensagem('Entrada registrada com sucesso!')
    carregar()
  }

  function formatarData(data: string | null) {
    if (!data) return '—'
    return new Date(data).toLocaleString('pt-BR')
  }

const aguardandoSaida = movimentacoes.filter((m) => m.status === 'aguardando_saida').length
const emRota = movimentacoes.filter((m) => m.status === 'em_rota').length
const finalizadosHoje = historico.filter((m) => {
  if (!m.entrada_em) return false
  const hoje = new Date().toDateString()
  return new Date(m.entrada_em).toDateString() === hoje
}).length

return (
  <div className="min-h-screen flex bg-[#0a1625]">
    <Sidebar />

    <div className="flex-1 ml-64">

  
{/* Banner */}
<div className="relative h-52 md:h-60 overflow-hidden">
  <img
    src="/images/banner-frota.jpg"
    alt="Filtroamb"
    className="w-full h-full object-cover object-center"
  />
  <div className="absolute inset-0 bg-gradient-to-r from-[#0a1625]/85 via-[#0a1625]/50 to-[#0a1625]/20" />
  <div className="absolute inset-0 flex items-end pb-6 px-8">
    <div>
      <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow">
        Portaria
      </h1>
      <p className="text-sm text-emerald-300 mt-1 drop-shadow">
        Controle de entrada e saída
      </p>
    </div>
  </div>
</div>
{/* Banner */}

{/* Cards */}
<div className="px-8 pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Aguardando Saída */}
  <div className="bg-[#0f1c2e] border border-orange-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(249,115,22,0.06)]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">Aguardando Saída</p>
        <p className="text-3xl font-bold text-orange-300 mt-1">{aguardandoSaida}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center text-xl">
        ⏳
      </div>
    </div>
  </div>

  {/* Em Rota */}
  <div className="bg-[#0f1c2e] border border-blue-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(59,130,246,0.06)]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">Em Rota</p>
        <p className="text-3xl font-bold text-blue-300 mt-1">{emRota}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center text-xl">
        🚚
      </div>
    </div>
  </div>

  {/* Finalizados hoje */}
  <div className="bg-[#0f1c2e] border border-emerald-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.06)]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">Retornos Hoje</p>
        <p className="text-3xl font-bold text-emerald-300 mt-1">{finalizadosHoje}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center text-xl">
        ✅
      </div>
    </div>
  </div>

  {/* Total ativos */}
  <div className="bg-[#0f1c2e] border border-emerald-500/15 rounded-2xl p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wider">Total em Aberto</p>
        <p className="text-3xl font-bold text-white mt-1">{aguardandoSaida + emRota}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-xl">
        📊
      </div>
    </div>
  </div>
</div>

      <header className="bg-[#0b1f33] border-b border-emerald-500/20 sticky top-0 z-10">
        <div className="px-8 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">Liberar Saida</h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Controle de entrada e saída de veículos
            </p>
          </div>
          <button
            onClick={carregar}
            className="text-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-4 py-2 rounded-xl transition"
          >
            Atualizar
          </button>
        </div>
      </header>

      <main className="p-8 pt-4">
        {mensagem && (
          <div className="mb-4 p-4 rounded-xl text-sm bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            {mensagem}
          </div>
        )}

        {carregando ? (
          <div className="text-center py-12 text-slate-500">Carregando...</div>
        ) : (
          <>
            {/* Tabela de ativos */}
            <div className="bg-[#0f1c2e] rounded-2xl border border-emerald-500/15 shadow-[0_0_30px_rgba(16,185,129,0.05)] overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-[#132337] border-b border-emerald-500/15">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Placa</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Motorista</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Destino</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">KM</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Liberado em</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {movimentacoes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                          Nenhum veículo aguardando saída ou em rota.
                        </td>
                      </tr>
                    ) : (
                      movimentacoes.map((m) => (
                        <tr key={m.id} className="hover:bg-emerald-500/5 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-emerald-300">{m.placa}</td>
                          <td className="px-5 py-3.5 text-slate-300">{m.motorista || '—'}</td>
                          <td className="px-5 py-3.5 text-slate-300">{m.destino || '—'}</td>
                          <td className="px-5 py-3.5 text-slate-400">
                            {m.km ? m.km.toLocaleString('pt-BR') : '—'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">
                            {formatarData(m.liberado_em)}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                m.status === 'aguardando_saida'
                                  ? 'bg-orange-500/15 text-orange-300 border border-orange-500/20'
                                  : 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                              }`}
                            >
                              {m.status === 'aguardando_saida' ? 'Aguardando Saída' : 'Em Rota'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {m.status === 'aguardando_saida' ? (
                              <button
                                onClick={() => registrarSaida(m.id)}
                                className="bg-orange-500 hover:bg-orange-400 text-[#0a1625] text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                              >
                                Registrar Saída
                              </button>
                            ) : (
                              <button
                                onClick={() => registrarEntrada(m.id)}
                                className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1625] text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                              >
                                Registrar Entrada
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Histórico */}
            <h3 className="text-lg font-semibold text-white mb-3 tracking-tight">
              Histórico de Entradas e Saídas
            </h3>

            <div className="bg-[#0f1c2e] rounded-2xl border border-emerald-500/15 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-[#132337] border-b border-emerald-500/15">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Placa</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Motorista</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Destino</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Saída</th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Entrada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {historico.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                          Nenhum registro finalizado ainda.
                        </td>
                      </tr>
                    ) : (
                      historico.map((m) => (
                        <tr key={m.id} className="hover:bg-emerald-500/5 transition-colors">
                          <td className="px-5 py-3.5 font-medium text-emerald-300">{m.placa}</td>
                          <td className="px-5 py-3.5 text-slate-300">{m.motorista || '—'}</td>
                          <td className="px-5 py-3.5 text-slate-300">{m.destino || '—'}</td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">
                            {formatarData(m.saida_em)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 text-xs">
                            {formatarData(m.entrada_em)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  </div>
)

}