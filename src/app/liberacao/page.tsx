'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/Sidebar'

type Veiculo = {
  NR_PLACA: string
  DS_MODELO: string | null
  DS_MARCA: string | null
  NR_ANO_MODELO: number | null
}

type Item = {
  id: number
  nome: string
}

export default function LiberacaoPage() {
  const supabase = createClient()

  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [origens, setOrigens] = useState<Item[]>([])
  const [destinos, setDestinos] = useState<Item[]>([])
  const [motoristas, setMotoristas] = useState<Item[]>([])

  // Placa
  const [buscaPlaca, setBuscaPlaca] = useState('')
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null)
  const [mostrarListaPlaca, setMostrarListaPlaca] = useState(false)

  // Motorista
  const [buscaMotorista, setBuscaMotorista] = useState('')
  const [motoristaSelecionado, setMotoristaSelecionado] = useState('')
  const [mostrarListaMotorista, setMostrarListaMotorista] = useState(false)
  const [novoMotorista, setNovoMotorista] = useState('')
  const [mostrarFormMotorista, setMostrarFormMotorista] = useState(false)

  // Origem
  const [buscaOrigem, setBuscaOrigem] = useState('Matriz Filtroamb')
  const [origemSelecionada, setOrigemSelecionada] = useState('Matriz Filtroamb')
  const [mostrarListaOrigem, setMostrarListaOrigem] = useState(false)
  const [novaOrigem, setNovaOrigem] = useState('')
  const [mostrarFormOrigem, setMostrarFormOrigem] = useState(false)

  // Destino
  const [buscaDestino, setBuscaDestino] = useState('')
  const [destinoSelecionado, setDestinoSelecionado] = useState('')
  const [mostrarListaDestino, setMostrarListaDestino] = useState(false)
  const [novoDestino, setNovoDestino] = useState('')
  const [mostrarFormDestino, setMostrarFormDestino] = useState(false)

  const [km, setKm] = useState('')
  const [dataHora, setDataHora] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mensagem, setMensagem] = useState('')

  async function carregarDados() {
    const [v, o, d, m] = await Promise.all([
      supabase.from('veiculos').select('NR_PLACA, DS_MODELO, DS_MARCA, NR_ANO_MODELO').order('NR_PLACA'),
      supabase.from('origens').select('id, nome').order('nome'),
      supabase.from('destinos').select('id, nome').order('nome'),
      supabase.from('motoristas').select('id, nome').order('nome'),
    ])
    if (v.data) setVeiculos(v.data)
    if (o.data) setOrigens(o.data)
    if (d.data) setDestinos(d.data)
    if (m.data) setMotoristas(m.data)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  async function cadastrarOrigem() {
    if (!novaOrigem.trim()) return
    const { error } = await supabase.from('origens').insert({ nome: novaOrigem.trim() })
    if (error) {
      setMensagem('Erro ao cadastrar origem: ' + error.message)
      return
    }
    setBuscaOrigem(novaOrigem.trim())
    setOrigemSelecionada(novaOrigem.trim())
    setNovaOrigem('')
    setMostrarFormOrigem(false)
    carregarDados()
  }

  async function cadastrarDestino() {
    if (!novoDestino.trim()) return
    const { error } = await supabase.from('destinos').insert({ nome: novoDestino.trim() })
    if (error) {
      setMensagem('Erro ao cadastrar destino: ' + error.message)
      return
    }
    setBuscaDestino(novoDestino.trim())
    setDestinoSelecionado(novoDestino.trim())
    setNovoDestino('')
    setMostrarFormDestino(false)
    carregarDados()
  }

  async function cadastrarMotorista() {
    if (!novoMotorista.trim()) return
    const { error } = await supabase.from('motoristas').insert({ nome: novoMotorista.trim() })
    if (error) {
      setMensagem('Erro ao cadastrar motorista: ' + error.message)
      return
    }
    setBuscaMotorista(novoMotorista.trim())
    setMotoristaSelecionado(novoMotorista.trim())
    setNovoMotorista('')
    setMostrarFormMotorista(false)
    carregarDados()
  }

  async function handleLiberar(e: React.FormEvent) {
    e.preventDefault()

    if (!veiculoSelecionado) {
      setMensagem('Selecione um veículo da lista')
      return
    }
    if (!motoristaSelecionado) {
      setMensagem('Selecione um motorista da lista')
      return
    }
    if (!destinoSelecionado) {
      setMensagem('Selecione um destino')
      return
    }

    setCarregando(true)
    setMensagem('')

    const { error } = await supabase.from('movimentacoes').insert({
      placa: veiculoSelecionado.NR_PLACA,
      km: km ? Number(km) : null,
      motorista: motoristaSelecionado,
      localizacao: origemSelecionada || buscaOrigem,
      destino: destinoSelecionado,
      status: 'aguardando_saida',
      liberado_por: 'Gestor',
      liberado_em: dataHora ? new Date(dataHora).toISOString() : new Date().toISOString(),
    })

    setCarregando(false)

    if (error) {
      setMensagem('Erro ao liberar: ' + error.message)
      return
    }

    setMensagem('Veículo liberado com sucesso! A Portaria já pode ver.')
    setVeiculoSelecionado(null)
    setBuscaPlaca('')
    setKm('')
    setMotoristaSelecionado('')
    setBuscaMotorista('')
    setDestinoSelecionado('')
    setBuscaDestino('')
    setDataHora('')
  }

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
              <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow">Liberação Portaria</h1>
              <p className="text-sm text-emerald-300 mt-1 drop-shadow">Autorize a saída de veículos</p>
            </div>
          </div>
        </div>

        <main className="p-8">
          <div className="max-w-3xl">
            <div className="bg-[#0f1c2e] rounded-2xl border border-emerald-500/15 overflow-hidden">
              <div className="px-6 py-4 border-b border-emerald-500/10 bg-[#132337]/50">
                <h2 className="text-sm font-semibold text-emerald-300 uppercase tracking-wider">Nova Liberação</h2>
                <p className="text-xs text-slate-500 mt-0.5">Preencha e envie para a portaria</p>
              </div>

              <form onSubmit={handleLiberar} className="p-6 space-y-5">

                {/* PLACA */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Veículo</label>
                  <input
                    type="text"
                    required
                    value={buscaPlaca}
                    onChange={(e) => {
                      setBuscaPlaca(e.target.value)
                      setVeiculoSelecionado(null)
                      setMostrarListaPlaca(true)
                    }}
                    onFocus={() => setMostrarListaPlaca(true)}
                    placeholder="Digite a placa..."
                    className="w-full px-4 py-3 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 uppercase transition"
                  />
                  {mostrarListaPlaca && buscaPlaca.length >= 1 && !veiculoSelecionado && (
                    <div className="absolute z-20 w-full mt-1.5 bg-[#132337] border border-emerald-500/25 rounded-xl shadow-2xl max-h-64 overflow-auto">
                      {Array.from(
                        new Map(
                          veiculos
                            .filter((v) => v.NR_PLACA?.toLowerCase().includes(buscaPlaca.toLowerCase()))
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
                            <div className="text-xs text-slate-400">
                              {v.DS_MODELO}
                              {v.DS_MARCA ? ` • ${v.DS_MARCA}` : ''}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                  {veiculoSelecionado && (
                    <div className="mt-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300">
                      ✓ {veiculoSelecionado.NR_PLACA} — {veiculoSelecionado.DS_MODELO}
                    </div>
                  )}
                </div>

                {/* KM + DATA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">KM Atual</label>
                    <input
                      type="number"
                      required
                      value={km}
                      onChange={(e) => setKm(e.target.value)}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Data e Hora</label>
                    <input
                      type="datetime-local"
                      required
                      value={dataHora}
                      onChange={(e) => setDataHora(e.target.value)}
                      className="w-full px-4 py-3 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                    />
                  </div>
                </div>

                {/* MOTORISTA */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Motorista</label>
                    <button
                      type="button"
                      onClick={() => setMostrarFormMotorista(!mostrarFormMotorista)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      + Cadastrar
                    </button>
                  </div>

                  {mostrarFormMotorista && (
                    <div className="mb-2 flex gap-2">
                      <input
                        type="text"
                        value={novoMotorista}
                        onChange={(e) => setNovoMotorista(e.target.value)}
                        placeholder="Nome do motorista..."
                        className="flex-1 px-3 py-2 bg-[#132337] border border-emerald-500/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                      />
                      <button
                        type="button"
                        onClick={cadastrarMotorista}
                        className="px-3 py-2 bg-emerald-500 text-[#0a1625] text-sm font-semibold rounded-lg"
                      >
                        Salvar
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    value={buscaMotorista}
                    onChange={(e) => {
                      setBuscaMotorista(e.target.value)
                      setMotoristaSelecionado('')
                      setMostrarListaMotorista(true)
                    }}
                    onFocus={() => setMostrarListaMotorista(true)}
                    placeholder="Buscar motorista..."
                    className="w-full px-4 py-3 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                  />

                  {motoristaSelecionado && (
                    <div className="mt-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300">
                      ✓ {motoristaSelecionado}
                    </div>
                  )}

                  {mostrarListaMotorista && !motoristaSelecionado && (
                    <div className="absolute z-20 w-full mt-1.5 bg-[#132337] border border-emerald-500/25 rounded-xl shadow-2xl max-h-48 overflow-auto">
                      {motoristas
                        .filter((m) => m.nome.toLowerCase().includes(buscaMotorista.toLowerCase()))
                        .map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setMotoristaSelecionado(m.nome)
                              setBuscaMotorista(m.nome)
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

                {/* ORIGEM */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Origem</label>
                    <button
                      type="button"
                      onClick={() => setMostrarFormOrigem(!mostrarFormOrigem)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      + Cadastrar
                    </button>
                  </div>

                  {mostrarFormOrigem && (
                    <div className="mb-2 flex gap-2">
                      <input
                        type="text"
                        value={novaOrigem}
                        onChange={(e) => setNovaOrigem(e.target.value)}
                        placeholder="Nova origem..."
                        className="flex-1 px-3 py-2 bg-[#132337] border border-emerald-500/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                      />
                      <button
                        type="button"
                        onClick={cadastrarOrigem}
                        className="px-3 py-2 bg-emerald-500 text-[#0a1625] text-sm font-semibold rounded-lg"
                      >
                        Salvar
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    value={buscaOrigem}
                    onChange={(e) => {
                      setBuscaOrigem(e.target.value)
                      setOrigemSelecionada('')
                      setMostrarListaOrigem(true)
                    }}
                    onFocus={() => setMostrarListaOrigem(true)}
                    placeholder="Buscar origem..."
                    className="w-full px-4 py-3 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                  />

                  {mostrarListaOrigem && (
                    <div className="absolute z-20 w-full mt-1.5 bg-[#132337] border border-emerald-500/25 rounded-xl shadow-2xl max-h-48 overflow-auto">
                      {origens
                        .filter((o) => o.nome.toLowerCase().includes(buscaOrigem.toLowerCase()))
                        .map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() => {
                              setOrigemSelecionada(o.nome)
                              setBuscaOrigem(o.nome)
                              setMostrarListaOrigem(false)
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/10 text-sm text-slate-200 border-b border-white/5 last:border-0"
                          >
                            {o.nome}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                {/* DESTINO */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destino / Oficina</label>
                    <button
                      type="button"
                      onClick={() => setMostrarFormDestino(!mostrarFormDestino)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      + Cadastrar
                    </button>
                  </div>

                  {mostrarFormDestino && (
                    <div className="mb-2 flex gap-2">
                      <input
                        type="text"
                        value={novoDestino}
                        onChange={(e) => setNovoDestino(e.target.value)}
                        placeholder="Novo destino/oficina..."
                        className="flex-1 px-3 py-2 bg-[#132337] border border-emerald-500/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                      />
                      <button
                        type="button"
                        onClick={cadastrarDestino}
                        className="px-3 py-2 bg-emerald-500 text-[#0a1625] text-sm font-semibold rounded-lg"
                      >
                        Salvar
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    value={buscaDestino}
                    onChange={(e) => {
                      setBuscaDestino(e.target.value)
                      setDestinoSelecionado('')
                      setMostrarListaDestino(true)
                    }}
                    onFocus={() => setMostrarListaDestino(true)}
                    placeholder="Buscar destino ou oficina..."
                    className="w-full px-4 py-3 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                  />

                  {mostrarListaDestino && !destinoSelecionado && (
                    <div className="absolute z-20 w-full mt-1.5 bg-[#132337] border border-emerald-500/25 rounded-xl shadow-2xl max-h-48 overflow-auto">
                      {destinos
                        .filter((d) => d.nome.toLowerCase().includes(buscaDestino.toLowerCase()))
                        .map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            onClick={() => {
                              setDestinoSelecionado(d.nome)
                              setBuscaDestino(d.nome)
                              setMostrarListaDestino(false)
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/10 text-sm text-slate-200 border-b border-white/5 last:border-0"
                          >
                            {d.nome}
                          </button>
                        ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 text-[#0a1625] font-semibold py-3.5 rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                >
                  {carregando ? 'Liberando...' : 'Liberar Veículo'}
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
        </main>
      </div>
    </div>
  )
}