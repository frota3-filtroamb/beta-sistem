'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'

type Veiculo = {
  NR_PLACA: string
  DS_MODELO: string | null
  DS_MARCA: string | null
}

type Item = {
  id: number
  nome: string
}

type Transferencia = {
  id: number
  placa: string
  base_origem: string
  base_destino: string
  motorista: string | null
  observacao: string | null
  transferido_em: string | null
  transferido_por: string | null
}

export default function TransferenciaPage() {
  const supabase = createClient()

  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [bases, setBases] = useState<Item[]>([])
  const [motoristas, setMotoristas] = useState<Item[]>([])
  const [lista, setLista] = useState<Transferencia[]>([])

  const [buscaPlaca, setBuscaPlaca] = useState('')
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null)
  const [mostrarListaPlaca, setMostrarListaPlaca] = useState(false)

  const [baseOrigem, setBaseOrigem] = useState('')
  const [baseDestino, setBaseDestino] = useState('')
  const [mostrarListaOrigem, setMostrarListaOrigem] = useState(false)
  const [mostrarListaDestino, setMostrarListaDestino] = useState(false)

  const [motorista, setMotorista] = useState('')
  const [mostrarListaMotorista, setMostrarListaMotorista] = useState(false)

  const [observacao, setObservacao] = useState('')
  const [dataHora, setDataHora] = useState('')

  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [busca, setBusca] = useState('')

  async function carregarDados() {
    const [v, b, m, t] = await Promise.all([
      supabase.from('veiculos').select('NR_PLACA, DS_MODELO, DS_MARCA').order('NR_PLACA'),
      supabase.from('origens').select('id, nome').order('nome'),
      supabase.from('motoristas').select('id, nome').order('nome'),
      supabase
        .from('transferencias')
        .select('*')
        .order('transferido_em', { ascending: false })
        .limit(50),
    ])
    if (v.data) setVeiculos(v.data)
    if (b.data) setBases(b.data)
    if (m.data) setMotoristas(m.data)
    if (t.data) setLista(t.data)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setMostrarListaPlaca(false)
        setMostrarListaOrigem(false)
        setMostrarListaDestino(false)
        setMostrarListaMotorista(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleTransferir(e: React.FormEvent) {
    e.preventDefault()

    if (!veiculoSelecionado) {
      setMensagem('Selecione um veículo')
      return
    }
    if (!baseOrigem || !baseDestino) {
      setMensagem('Selecione origem e destino')
      return
    }
    if (baseOrigem === baseDestino) {
      setMensagem('Origem e destino não podem ser iguais')
      return
    }

    setCarregando(true)
    setMensagem('')

    const { error } = await supabase.from('transferencias').insert({
      placa: veiculoSelecionado.NR_PLACA,
      base_origem: baseOrigem,
      base_destino: baseDestino,
      motorista: motorista || null,
      observacao: observacao || null,
      status: 'concluida',
      transferido_por: 'Gestor',
      transferido_em: dataHora
        ? new Date(dataHora).toISOString()
        : new Date().toISOString(),
    })

    setCarregando(false)

    if (error) {
      setMensagem('Erro ao transferir: ' + error.message)
      return
    }

    setMensagem('Transferência registrada com sucesso!')
    setVeiculoSelecionado(null)
    setBuscaPlaca('')
    setBaseOrigem('')
    setBaseDestino('')
    setMotorista('')
    setObservacao('')
    setDataHora('')
    carregarDados()
  }

  function formatarData(data: string | null) {
    if (!data) return '—'
    return new Date(data).toLocaleString('pt-BR')
  }

  const listaFiltrada = lista.filter((t) => {
    const texto = busca.toLowerCase()
    return (
      t.placa?.toLowerCase().includes(texto) ||
      t.base_origem?.toLowerCase().includes(texto) ||
      t.base_destino?.toLowerCase().includes(texto) ||
      t.motorista?.toLowerCase().includes(texto)
    )
  })

  return (
    <div className="min-h-screen flex bg-[#0a1625]">
      <Sidebar />

      <div className="flex-1 ml-64">
        {/* Banner */}
        <div className="relative h-44 overflow-hidden">
          <img
            src="/images/banner-frota.jpg"
            alt="Filtroamb"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1625]/90 via-[#0a1625]/55 to-transparent" />
          <div data-banner className="absolute inset-0 flex items-end pb-5 px-8">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Transferência de Bases
              </h1>
              <p className="text-sm text-emerald-300 mt-1">
                Mudança definitiva de base (não fica em rota)
              </p>
            </div>
          </div>
        </div>

        <main className="p-8">
          <div className="max-w-3xl mb-8">
            <div className="bg-[#0f1c2e] rounded-2xl border border-emerald-500/15 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 bg-[#132337]/60">
                <h2 className="text-sm font-semibold text-white">Nova Transferência</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Use quando o veículo muda de base de trabalho
                </p>
              </div>

              <form onSubmit={handleTransferir} className="p-6 space-y-5">
                {/* Placa */}
                <div data-dropdown className="relative">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Veículo
                  </label>
                  <input
                    type="text"
                    value={buscaPlaca}
                    onChange={(e) => {
                      setBuscaPlaca(e.target.value)
                      setVeiculoSelecionado(null)
                      setMostrarListaPlaca(true)
                    }}
                    onFocus={() => setMostrarListaPlaca(true)}
                    placeholder="Buscar placa..."
                    className="w-full px-4 py-3 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 uppercase transition"
                  />
                  {veiculoSelecionado && (
                    <div className="mt-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300">
                      ✓ {veiculoSelecionado.NR_PLACA} — {veiculoSelecionado.DS_MODELO}
                    </div>
                  )}
                  {mostrarListaPlaca && !veiculoSelecionado && buscaPlaca.length >= 1 && (
                    <div className="absolute z-20 w-full mt-1.5 bg-[#132337] border border-emerald-500/25 rounded-xl shadow-2xl max-h-56 overflow-auto">
                      {Array.from(
                        new Map(
                          veiculos
                            .filter((v) =>
                              v.NR_PLACA?.toLowerCase().includes(buscaPlaca.toLowerCase())
                            )
                            .map((v) => [v.NR_PLACA, v])
                        ).values()
                      )
                        .slice(0, 8)
                        .map((v, i) => (
                          <button
                            key={`${v.NR_PLACA}-${i}`}
                            type="button"
                            onClick={() => {
                              setVeiculoSelecionado(v)
                              setBuscaPlaca(v.NR_PLACA)
                              setMostrarListaPlaca(false)
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-emerald-500/10 border-b border-white/5 last:border-0"
                          >
                            <div className="font-semibold text-emerald-300">{v.NR_PLACA}</div>
                            <div className="text-xs text-slate-400">{v.DS_MODELO}</div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* Bases com busca */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Origem */}
                  <div data-dropdown className="relative">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Base origem
                    </label>
                    <input
                      type="text"
                      value={baseOrigem}
                      onChange={(e) => {
                        setBaseOrigem(e.target.value)
                        setMostrarListaOrigem(true)
                      }}
                      onFocus={() => setMostrarListaOrigem(true)}
                      placeholder="Buscar base origem..."
                      className="w-full px-4 py-3 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                    />
                    {mostrarListaOrigem && (
                      <div className="absolute z-20 w-full mt-1.5 bg-[#132337] border border-emerald-500/25 rounded-xl shadow-2xl max-h-40 overflow-auto">
                        {bases
                          .filter((b) =>
                            b.nome.toLowerCase().includes(baseOrigem.toLowerCase())
                          )
                          .map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                setBaseOrigem(b.nome)
                                setMostrarListaOrigem(false)
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/10 text-sm text-slate-200 border-b border-white/5 last:border-0"
                            >
                              {b.nome}
                            </button>
                          ))}
                        {bases.filter((b) =>
                          b.nome.toLowerCase().includes(baseOrigem.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-3 text-sm text-slate-500">
                            Nenhuma base encontrada
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Destino */}
                  <div data-dropdown className="relative">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Base destino
                    </label>
                    <input
                      type="text"
                      value={baseDestino}
                      onChange={(e) => {
                        setBaseDestino(e.target.value)
                        setMostrarListaDestino(true)
                      }}
                      onFocus={() => setMostrarListaDestino(true)}
                      placeholder="Buscar base destino..."
                      className="w-full px-4 py-3 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                    />
                    {mostrarListaDestino && (
                      <div className="absolute z-20 w-full mt-1.5 bg-[#132337] border border-emerald-500/25 rounded-xl shadow-2xl max-h-40 overflow-auto">
                        {bases
                          .filter((b) =>
                            b.nome.toLowerCase().includes(baseDestino.toLowerCase())
                          )
                          .map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                setBaseDestino(b.nome)
                                setMostrarListaDestino(false)
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/10 text-sm text-slate-200 border-b border-white/5 last:border-0"
                            >
                              {b.nome}
                            </button>
                          ))}
                        {bases.filter((b) =>
                          b.nome.toLowerCase().includes(baseDestino.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-3 text-sm text-slate-500">
                            Nenhuma base encontrada
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Motorista + Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div data-dropdown className="relative">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Motorista (opcional)
                    </label>
                    <input
                      type="text"
                      value={motorista}
                      onChange={(e) => {
                        setMotorista(e.target.value)
                        setMostrarListaMotorista(true)
                      }}
                      onFocus={() => setMostrarListaMotorista(true)}
                      placeholder="Buscar motorista..."
                      className="w-full px-4 py-3 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                    />
                    {mostrarListaMotorista && (
                      <div className="absolute z-20 w-full mt-1.5 bg-[#132337] border border-emerald-500/25 rounded-xl shadow-2xl max-h-40 overflow-auto">
                        {motoristas
                          .filter((m) =>
                            m.nome.toLowerCase().includes(motorista.toLowerCase())
                          )
                          .map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setMotorista(m.nome)
                                setMostrarListaMotorista(false)
                              }}
                              className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/10 text-sm text-slate-200 border-b border-white/5 last:border-0"
                            >
                              {m.nome}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Data e hora
                    </label>
                    <input
                      type="datetime-local"
                      value={dataHora}
                      onChange={(e) => setDataHora(e.target.value)}
                      className="w-full px-4 py-3 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                    />
                  </div>
                </div>

                {/* Observação */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Observação
                  </label>
                  <textarea
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                    rows={2}
                    placeholder="Ex: Veículo realocado para operar em Canoas"
                    className="w-full px-4 py-3 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-[#0a1625] font-semibold py-3.5 rounded-xl transition"
                >
                  {carregando ? 'Salvando...' : 'Registrar Transferência'}
                </button>

                {mensagem && (
                  <div
                    className={`p-4 rounded-xl text-sm ${
                      mensagem.includes('sucesso')
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-300 border border-red-500/20'
                    }`}
                  >
                    {mensagem}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Histórico */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Histórico de Transferências
            </h3>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Filtrar..."
              className="w-56 px-3 py-2 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
            />
          </div>

          <div className="bg-[#0f1c2e] rounded-2xl border border-emerald-500/15 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-[#132337] border-b border-emerald-500/15">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Placa</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">De</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Para</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Motorista</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-emerald-400/90 uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {listaFiltrada.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                        Nenhuma transferência registrada.
                      </td>
                    </tr>
                  ) : (
                    listaFiltrada.map((t) => (
                      <tr key={t.id} className="hover:bg-emerald-500/5 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-emerald-300">{t.placa}</td>
                        <td className="px-5 py-3.5 text-slate-300">{t.base_origem}</td>
                        <td className="px-5 py-3.5 text-slate-300">{t.base_destino}</td>
                        <td className="px-5 py-3.5 text-slate-400">{t.motorista || '—'}</td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">
                          {formatarData(t.transferido_em)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}