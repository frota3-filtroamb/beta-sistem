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
  tipo_veiculo?: string | null
}

type Pedestre = {
  id: number
  nome: string
  cpf: string | null
  telefone: string | null
  empresa: string | null
  destino: string | null
  status: string
  liberado_em: string | null
  entrada_em: string | null
  saida_em: string | null
}

export default function PortariaPage() {
  const supabase = createClient()
  
  const [abaAtual, setAbaAtual] = useState<'veiculos' | 'pedestres'>('veiculos')

  // Veículos
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [historico, setHistorico] = useState<Movimentacao[]>([])
  
  // Pedestres
  const [pedestres, setPedestres] = useState<Pedestre[]>([])
  const [historicoPedestres, setHistoricoPedestres] = useState<Pedestre[]>([])

  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState('')
  const [busca, setBusca] = useState('')

  async function carregar() {
    setCarregando(true)

    try {
      const [vAtivos, vFinais, pAtivos, pFinais] = await Promise.all([
        supabase.from('movimentacoes').select('*').in('status', ['aguardando_saida', 'em_rota']).order('liberado_em', { ascending: false }),
        supabase.from('movimentacoes').select('*').eq('status', 'finalizado').order('entrada_em', { ascending: false }).limit(30),
        supabase.from('movimentacoes_pedestres').select('*').in('status', ['aguardando_entrada', 'em_visita']).order('liberado_em', { ascending: false }),
        supabase.from('movimentacoes_pedestres').select('*').eq('status', 'finalizado').order('saida_em', { ascending: false }).limit(30)
      ])

      setMovimentacoes(vAtivos.data || [])
      setHistorico(vFinais.data || [])
      setPedestres(pAtivos.data || [])
      setHistoricoPedestres(pFinais.data || [])
    } catch (e) {
      setMensagem('Erro ao carregar dados. Verifique a tabela no banco.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  // Ações Veículos
  async function registrarSaidaVeiculo(id: number) {
    const { error } = await supabase.from('movimentacoes').update({ status: 'em_rota', saida_em: new Date().toISOString() }).eq('id', id)
    if (error) setMensagem('Erro: ' + error.message)
    else { setMensagem('Saída do veículo registrada!'); carregar() }
  }

  async function registrarEntradaVeiculo(id: number) {
    const { error } = await supabase.from('movimentacoes').update({ status: 'finalizado', entrada_em: new Date().toISOString() }).eq('id', id)
    if (error) setMensagem('Erro: ' + error.message)
    else { setMensagem('Entrada do veículo registrada!'); carregar() }
  }

  // Ações Pedestres
  async function registrarEntradaPedestre(id: number) {
    const { error } = await supabase.from('movimentacoes_pedestres').update({ status: 'em_visita', entrada_em: new Date().toISOString() }).eq('id', id)
    if (error) setMensagem('Erro: ' + error.message)
    else { setMensagem('Entrada de pedestre registrada!'); carregar() }
  }

  async function registrarSaidaPedestre(id: number) {
    const { error } = await supabase.from('movimentacoes_pedestres').update({ status: 'finalizado', saida_em: new Date().toISOString() }).eq('id', id)
    if (error) setMensagem('Erro: ' + error.message)
    else { setMensagem('Saída de pedestre registrada!'); carregar() }
  }

  function formatarData(data: string | null) {
    if (!data) return '—'
    return new Date(data).toLocaleString('pt-BR')
  }

  // Contadores Veículos
  const vAguardando = movimentacoes.filter((m) => m.status === 'aguardando_saida').length
  const vEmRota = movimentacoes.filter((m) => m.status === 'em_rota').length
  const vRetornosHoje = historico.filter((m) => m.entrada_em && new Date(m.entrada_em).toDateString() === new Date().toDateString()).length

  // Contadores Pedestres
  const pAguardando = pedestres.filter((p) => p.status === 'aguardando_entrada').length
  const pEmVisita = pedestres.filter((p) => p.status === 'em_visita').length
  const pSaidasHoje = historicoPedestres.filter((p) => p.saida_em && new Date(p.saida_em).toDateString() === new Date().toDateString()).length

  // Filtros
  const textoFiltro = busca.toLowerCase()
  
  const mFiltradas = movimentacoes.filter((m) => 
    m.placa?.toLowerCase().includes(textoFiltro) || m.motorista?.toLowerCase().includes(textoFiltro) || m.destino?.toLowerCase().includes(textoFiltro)
  )
  const mHistFiltrado = historico.filter((m) => 
    m.placa?.toLowerCase().includes(textoFiltro) || m.motorista?.toLowerCase().includes(textoFiltro) || m.destino?.toLowerCase().includes(textoFiltro)
  )

  const pFiltrados = pedestres.filter((p) => 
    p.nome?.toLowerCase().includes(textoFiltro) || p.cpf?.includes(textoFiltro) || p.empresa?.toLowerCase().includes(textoFiltro)
  )
  const pHistFiltrado = historicoPedestres.filter((p) => 
    p.nome?.toLowerCase().includes(textoFiltro) || p.empresa?.toLowerCase().includes(textoFiltro)
  )

  return (
    <div className="min-h-screen flex bg-[#0a1625]">
      <Sidebar />

      <div className="flex-1 ml-64">
        {/* Banner */}
        <div className="relative h-52 md:h-60 overflow-hidden">
          <img src="/images/banner-frota.jpg" alt="Filtroamb" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1625]/85 via-[#0a1625]/50 to-[#0a1625]/20" />
          <div data-banner className="absolute inset-0 flex items-end pb-6 px-8">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow">
                Portaria
              </h1>
              <p className="text-sm text-emerald-300 mt-1 drop-shadow">
                Controle operacional de entrada e saída
              </p>
            </div>
          </div>
        </div>

        {/* Toggle Abas (Veículos vs Pedestres) */}
        <div className="px-8 mt-6">
          <div className="flex bg-[#132337] border border-emerald-500/20 rounded-xl p-1.5 w-fit">
            <button
              onClick={() => setAbaAtual('veiculos')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
                abaAtual === 'veiculos' ? 'bg-emerald-500 text-[#0a1625] shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🚗 Veículos
            </button>
            <button
              onClick={() => setAbaAtual('pedestres')}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition ${
                abaAtual === 'pedestres' ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              🚶 Pedestres / Visitantes
            </button>
          </div>
        </div>

        {/* Cards */}
        {abaAtual === 'veiculos' ? (
          <div className="px-8 pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f1c2e] border border-orange-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(249,115,22,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Aguardando Saída</p>
                  <p className="text-3xl font-bold text-orange-300 mt-1">{vAguardando}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center text-xl">⏳</div>
              </div>
            </div>
            <div className="bg-[#0f1c2e] border border-blue-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(59,130,246,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Em Rota</p>
                  <p className="text-3xl font-bold text-blue-300 mt-1">{vEmRota}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center text-xl">🚚</div>
              </div>
            </div>
            <div className="bg-[#0f1c2e] border border-emerald-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Retornos Hoje</p>
                  <p className="text-3xl font-bold text-emerald-300 mt-1">{vRetornosHoje}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center text-xl">✅</div>
              </div>
            </div>
            <div className="bg-[#0f1c2e] border border-emerald-500/15 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Total em Aberto</p>
                  <p className="text-3xl font-bold text-white mt-1">{vAguardando + vEmRota}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-xl">📊</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-8 pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0f1c2e] border border-orange-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(249,115,22,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Aguardando Entrada</p>
                  <p className="text-3xl font-bold text-orange-300 mt-1">{pAguardando}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center text-xl">⏳</div>
              </div>
            </div>
            <div className="bg-[#0f1c2e] border border-purple-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(168,85,247,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Em Visita</p>
                  <p className="text-3xl font-bold text-purple-300 mt-1">{pEmVisita}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-purple-500/15 flex items-center justify-center text-xl">🚶</div>
              </div>
            </div>
            <div className="bg-[#0f1c2e] border border-emerald-500/20 rounded-2xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.06)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Saídas Hoje</p>
                  <p className="text-3xl font-bold text-emerald-300 mt-1">{pSaidasHoje}</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center text-xl">✅</div>
              </div>
            </div>
          </div>
        )}

        <header className="bg-[#0b1f33] border-b border-emerald-500/20 sticky top-0 z-10 mt-6">
          <div className="px-8 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">Controle de {abaAtual === 'veiculos' ? 'Veículos' : 'Pedestres'}</h2>
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
            <div className={`mb-4 p-4 rounded-xl text-sm border ${mensagem.includes('Erro') ? 'bg-red-500/10 text-red-300 border-red-500/20' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'}`}>
              {mensagem}
            </div>
          )}

          {/* Filtro */}
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={abaAtual === 'veiculos' ? "Filtrar placa, motorista, destino..." : "Filtrar nome, cpf, empresa..."}
                className="w-full pl-10 pr-4 py-2.5 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
              />
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400/70 text-sm">🔍</span>
            </div>
          </div>

          {carregando ? (
            <div className="text-center py-12 text-slate-500">Carregando...</div>
          ) : abaAtual === 'veiculos' ? (
            <>
              {/* Tabela de ativos - VEICULOS */}
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
                      {mFiltradas.length === 0 ? (
                        <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500">Nenhum veículo em andamento.</td></tr>
                      ) : (
                        mFiltradas.map((m) => (
                          <tr key={m.id} className="hover:bg-emerald-500/5 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-emerald-300">{m.placa}</span>
                                {m.tipo_veiculo === 'externo' && (
                                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-orange-500/15 text-orange-300 border border-orange-500/25">Externo</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-300">{m.motorista || '—'}</td>
                            <td className="px-5 py-3.5 text-slate-300">{m.destino || '—'}</td>
                            <td className="px-5 py-3.5 text-slate-400">{m.km ? m.km.toLocaleString('pt-BR') : '—'}</td>
                            <td className="px-5 py-3.5 text-slate-500 text-xs">{formatarData(m.liberado_em)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${m.status === 'aguardando_saida' ? 'bg-orange-500/15 text-orange-300 border border-orange-500/20' : 'bg-blue-500/15 text-blue-300 border border-blue-500/20'}`}>
                                {m.status === 'aguardando_saida' ? 'Aguardando Saída' : 'Em Rota'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              {m.status === 'aguardando_saida' ? (
                                <button onClick={() => registrarSaidaVeiculo(m.id)} className="bg-orange-500 hover:bg-orange-400 text-[#0a1625] text-xs font-semibold px-3 py-1.5 rounded-lg transition">Registrar Saída</button>
                              ) : (
                                <button onClick={() => registrarEntradaVeiculo(m.id)} className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1625] text-xs font-semibold px-3 py-1.5 rounded-lg transition">Registrar Entrada</button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Histórico - VEÍCULOS */}
              <h3 className="text-lg font-semibold text-white mb-3 tracking-tight">Histórico de Entradas e Saídas (Veículos)</h3>
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
                      {mHistFiltrado.length === 0 ? (
                        <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">Nenhum registro.</td></tr>
                      ) : (
                        mHistFiltrado.map((m) => (
                          <tr key={m.id} className="hover:bg-emerald-500/5 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-emerald-300">{m.placa}</span>
                                {m.tipo_veiculo === 'externo' && (
                                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-orange-500/15 text-orange-300 border border-orange-500/25">Externo</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-300">{m.motorista || '—'}</td>
                            <td className="px-5 py-3.5 text-slate-300">{m.destino || '—'}</td>
                            <td className="px-5 py-3.5 text-slate-500 text-xs">{formatarData(m.saida_em)}</td>
                            <td className="px-5 py-3.5 text-slate-500 text-xs">{formatarData(m.entrada_em)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Tabela de ativos - PEDESTRES */}
              <div className="bg-[#0f1c2e] rounded-2xl border border-purple-500/15 shadow-[0_0_30px_rgba(168,85,247,0.05)] overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-[#132337] border-b border-purple-500/15">
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-purple-400/90 uppercase tracking-wider">Nome / Empresa</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-purple-400/90 uppercase tracking-wider">CPF / Tel</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-purple-400/90 uppercase tracking-wider">Destino</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-purple-400/90 uppercase tracking-wider">Liberado em</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-purple-400/90 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-purple-400/90 uppercase tracking-wider">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pFiltrados.length === 0 ? (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">Nenhum pedestre em andamento.</td></tr>
                      ) : (
                        pFiltrados.map((p) => (
                          <tr key={p.id} className="hover:bg-purple-500/5 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="font-medium text-purple-300">{p.nome}</div>
                              <div className="text-xs text-slate-500">{p.empresa || 'Sem empresa'}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="text-slate-300">{p.cpf || '—'}</div>
                              <div className="text-xs text-slate-500">{p.telefone || '—'}</div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-300">{p.destino || '—'}</td>
                            <td className="px-5 py-3.5 text-slate-500 text-xs">{formatarData(p.liberado_em)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${p.status === 'aguardando_entrada' ? 'bg-orange-500/15 text-orange-300 border border-orange-500/20' : 'bg-purple-500/15 text-purple-300 border border-purple-500/20'}`}>
                                {p.status === 'aguardando_entrada' ? 'Aguardando Entrada' : 'Em Visita'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              {p.status === 'aguardando_entrada' ? (
                                <button onClick={() => registrarEntradaPedestre(p.id)} className="bg-emerald-500 hover:bg-emerald-400 text-[#0a1625] text-xs font-semibold px-3 py-1.5 rounded-lg transition">Entrou</button>
                              ) : (
                                <button onClick={() => registrarSaidaPedestre(p.id)} className="bg-orange-500 hover:bg-orange-400 text-[#0a1625] text-xs font-semibold px-3 py-1.5 rounded-lg transition">Saiu</button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Histórico - PEDESTRES */}
              <h3 className="text-lg font-semibold text-white mb-3 tracking-tight">Histórico de Visitas (Pedestres)</h3>
              <div className="bg-[#0f1c2e] rounded-2xl border border-purple-500/15 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-[#132337] border-b border-purple-500/15">
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-purple-400/90 uppercase tracking-wider">Nome / Empresa</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-purple-400/90 uppercase tracking-wider">Destino</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-purple-400/90 uppercase tracking-wider">Entrada</th>
                        <th className="px-5 py-3.5 text-left text-xs font-semibold text-purple-400/90 uppercase tracking-wider">Saída</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pHistFiltrado.length === 0 ? (
                        <tr><td colSpan={4} className="px-5 py-10 text-center text-slate-500">Nenhum registro.</td></tr>
                      ) : (
                        pHistFiltrado.map((p) => (
                          <tr key={p.id} className="hover:bg-purple-500/5 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="font-medium text-purple-300">{p.nome}</div>
                              <div className="text-xs text-slate-500">{p.empresa || 'Sem empresa'}</div>
                            </td>
                            <td className="px-5 py-3.5 text-slate-300">{p.destino || '—'}</td>
                            <td className="px-5 py-3.5 text-slate-500 text-xs">{formatarData(p.entrada_em)}</td>
                            <td className="px-5 py-3.5 text-slate-500 text-xs">{formatarData(p.saida_em)}</td>
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