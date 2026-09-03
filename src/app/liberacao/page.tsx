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

  const [tipoVeiculo, setTipoVeiculo] = useState<'interno' | 'externo'>('interno')

  const [buscaPlaca, setBuscaPlaca] = useState('')
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<Veiculo | null>(null)
  const [mostrarListaPlaca, setMostrarListaPlaca] = useState(false)

  const [placaExterna, setPlacaExterna] = useState('')
  const [modeloExterno, setModeloExterno] = useState('')

  const [buscaMotorista, setBuscaMotorista] = useState('')
  const [motoristaSelecionado, setMotoristaSelecionado] = useState('')
  const [mostrarListaMotorista, setMostrarListaMotorista] = useState(false)
  const [novoMotorista, setNovoMotorista] = useState('')
  const [mostrarFormMotorista, setMostrarFormMotorista] = useState(false)

  const [buscaOrigem, setBuscaOrigem] = useState('Matriz Filtroamb')
  const [origemSelecionada, setOrigemSelecionada] = useState('Matriz Filtroamb')
  const [mostrarListaOrigem, setMostrarListaOrigem] = useState(false)
  const [novaOrigem, setNovaOrigem] = useState('')
  const [mostrarFormOrigem, setMostrarFormOrigem] = useState(false)

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

  async function cadastrarItem(
    tabela: 'origens' | 'destinos' | 'motoristas',
    valor: string,
    setBusca: (v: string) => void,
    setSelecionado: (v: string) => void,
    setForm: (v: boolean) => void,
    setNovo: (v: string) => void
  ) {
    if (!valor.trim()) return
    const { error } = await supabase.from(tabela).insert({ nome: valor.trim() })
    if (error) {
      setMensagem('Erro ao cadastrar: ' + error.message)
      return
    }
    setBusca(valor.trim())
    setSelecionado(valor.trim())
    setNovo('')
    setForm(false)
    carregarDados()
  }

  async function handleLiberar(e: React.FormEvent) {
    e.preventDefault()

    const placaFinal =
      tipoVeiculo === 'interno'
        ? veiculoSelecionado?.NR_PLACA
        : placaExterna.trim().toUpperCase()

    if (!placaFinal) {
      setMensagem(tipoVeiculo === 'interno' ? 'Selecione um veículo da lista' : 'Informe a placa do veículo externo')
      return
    }
    if (!motoristaSelecionado) {
      setMensagem('Selecione um motorista')
      return
    }
    if (!destinoSelecionado) {
      setMensagem('Selecione um destino')
      return
    }
    if (!km || !dataHora) {
      setMensagem('Preencha KM e data/hora')
      return
    }

    setCarregando(true)
    setMensagem('')

    const { error } = await supabase.from('movimentacoes').insert({
      placa: placaFinal,
      km: Number(km),
      motorista: motoristaSelecionado,
      localizacao: origemSelecionada || buscaOrigem,
      destino: destinoSelecionado,
      status: 'aguardando_saida',
      liberado_por: 'Gestor',
      liberado_em: new Date(dataHora).toISOString(),
      tipo_veiculo: tipoVeiculo,
    })

    setCarregando(false)

    if (error) {
      setMensagem('Erro ao liberar: ' + error.message)
      return
    }

    setMensagem('Veículo liberado com sucesso! A Portaria já pode ver.')
    setVeiculoSelecionado(null)
    setBuscaPlaca('')
    setPlacaExterna('')
    setModeloExterno('')
    setMotoristaSelecionado('')
    setBuscaMotorista('')
    setDestinoSelecionado('')
    setBuscaDestino('')
    setKm('')
    setDataHora('')
  }

  return (
    <div className="min-h-screen flex bg-[#0a1625]">
      <Sidebar />

      <div className="flex-1 ml-64">
        <div className="relative h-36 overflow-hidden">
          <img src="/images/banner-frota.jpg" alt="Filtroamb" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1625]/90 via-[#0a1625]/55 to-transparent" />
          <div className="absolute inset-0 flex items-end pb-4 px-8">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Liberação Portaria</h1>
              <p className="text-sm text-emerald-300 mt-0.5">Autorize a saída de veículos internos ou externos</p>
            </div>
          </div>
        </div>

        <main className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex gap-3 mb-5">
              <button
                type="button"
                onClick={() => setTipoVeiculo('interno')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                  tipoVeiculo === 'interno'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                    : 'bg-[#0f1c2e] border-white/10 text-slate-400 hover:border-emerald-500/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:-translate-y-0.5'
                }`}
              >
                Veículo da Empresa
              </button>
              <button
                type="button"
                onClick={() => setTipoVeiculo('externo')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                  tipoVeiculo === 'externo'
                    ? 'bg-orange-500/15 border-orange-500/40 text-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.25)]'
                    : 'bg-[#0f1c2e] border-white/10 text-slate-400 hover:border-orange-500/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:-translate-y-0.5'
                }`}
              >
                Veículo Externo
              </button>
            </div>

            <div className="bg-[#0f1c2e] rounded-2xl border border-emerald-500/15 overflow-hidden">
              <div className="px-6 py-3 border-b border-white/5 bg-[#132337]/60 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Nova Autorização de Saída</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {tipoVeiculo === 'interno' ? 'Frota própria Filtroamb' : 'Veículo de terceiro / visitante'}
                  </p>
                </div>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  tipoVeiculo === 'interno' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-orange-500/15 text-orange-300'
                }`}>
                  {tipoVeiculo === 'interno' ? 'Interno' : 'Externo'}
                </span>
              </div>

              <form onSubmit={handleLiberar} className="p-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {tipoVeiculo === 'interno' ? (
                      <div className="relative">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Veículo</label>
                        <input
                          type="text"
                          value={buscaPlaca}
                          onChange={(e) => {
                            setBuscaPlaca(e.target.value)
                            setVeiculoSelecionado(null)
                            setMostrarListaPlaca(true)
                          }}
                          onFocus={() => setMostrarListaPlaca(true)}
                          placeholder="Buscar por placa..."
                          className="w-full px-4 py-2.5 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 uppercase transition"
                        />
                        {veiculoSelecionado && (
                          <div className="mt-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300">
                            {veiculoSelecionado.NR_PLACA} — {veiculoSelecionado.DS_MODELO}
                          </div>
                        )}
                        {mostrarListaPlaca && !veiculoSelecionado && buscaPlaca.length >= 1 && (
                          <div className="absolute z-20 w-full mt-1.5 bg-[#132337] border border-emerald-500/25 rounded-xl shadow-2xl max-h-52 overflow-auto">
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
                                  className="w-full text-left px-4 py-2.5 hover:bg-emerald-500/10 border-b border-white/5 last:border-0"
                                >
                                  <div className="font-semibold text-emerald-300">{v.NR_PLACA}</div>
                                  <div className="text-xs text-slate-400">{v.DS_MODELO}{v.DS_MARCA ? ` • ${v.DS_MARCA}` : ''}</div>
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Placa externa</label>
                          <input
                            type="text"
                            value={placaExterna}
                            onChange={(e) => setPlacaExterna(e.target.value.toUpperCase())}
                            placeholder="ABC1D23"
                            className="w-full px-4 py-2.5 bg-[#132337] border border-orange-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400/40 uppercase transition"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Modelo</label>
                          <input
                            type="text"
                            value={modeloExterno}
                            onChange={(e) => setModeloExterno(e.target.value)}
                            placeholder="Ex: Strada"
                            className="w-full px-4 py-2.5 bg-[#132337] border border-orange-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-400/40 transition"
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">KM Atual</label>
                        <input
                          type="number"
                          value={km}
                          onChange={(e) => setKm(e.target.value)}
                          placeholder="0"
                          className="w-full px-4 py-2.5 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Data e Hora</label>
                        <input
                          type="datetime-local"
                          value={dataHora}
                          onChange={(e) => setDataHora(e.target.value)}
                          className="w-full px-4 py-2.5 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Motorista</label>
                        <button type="button" onClick={() => setMostrarFormMotorista(!mostrarFormMotorista)} className="text-xs text-emerald-400 hover:text-emerald-300">
                          + Cadastrar
                        </button>
                      </div>
                      {mostrarFormMotorista && (
                        <div className="mb-2 flex gap-2">
                          <input
                            type="text"
                            value={novoMotorista}
                            onChange={(e) => setNovoMotorista(e.target.value)}
                            placeholder="Nome..."
                            className="flex-1 px-3 py-2 bg-[#132337] border border-emerald-500/20 rounded-lg text-sm text-white"
                          />
                          <button
                            type="button"
                            onClick={() => cadastrarItem('motoristas', novoMotorista, setBuscaMotorista, setMotoristaSelecionado, setMostrarFormMotorista, setNovoMotorista)}
                            className="px-3 py-2 bg-emerald-500 text-[#0a1625] text-sm font-semibold rounded-lg"
                          >
                            Salvar
                          </button>
                        </div>
                      )}
                      <input
                        type="text"
                        value={buscaMotorista}
                        onChange={(e) => {
                          setBuscaMotorista(e.target.value)
                          setMotoristaSelecionado('')
                          setMostrarListaMotorista(true)
                        }}
                        onFocus={() => setMostrarListaMotorista(true)}
                        placeholder="Buscar motorista..."
                        className="w-full px-4 py-2.5 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                      />
                      {motoristaSelecionado && (
                        <div className="mt-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-300">
                          {motoristaSelecionado}
                        </div>
                      )}
                      {mostrarListaMotorista && !motoristaSelecionado && (
                        <div className="absolute z-20 w-full mt-1.5 bg-[#132337] border border-emerald-500/25 rounded-xl shadow-2xl max-h-40 overflow-auto">
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
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Origem</label>
                        <button type="button" onClick={() => setMostrarFormOrigem(!mostrarFormOrigem)} className="text-xs text-emerald-400">
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
                            className="flex-1 px-3 py-2 bg-[#132337] border border-emerald-500/20 rounded-lg text-sm text-white"
                          />
                          <button
                            type="button"
                            onClick={() => cadastrarItem('origens', novaOrigem, setBuscaOrigem, setOrigemSelecionada, setMostrarFormOrigem, setNovaOrigem)}
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
                        className="w-full px-4 py-2.5 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                      />
                      {mostrarListaOrigem && (
                        <div className="absolute z-20 w-full mt-1.5 bg-[#132337] border border-emerald-500/25 rounded-xl shadow-2xl max-h-40 overflow-auto">
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

                    <div className="relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Destino</label>
                        <button type="button" onClick={() => setMostrarFormDestino(!mostrarFormDestino)} className="text-xs text-emerald-400">
                          + Cadastrar
                        </button>
                      </div>
                      {mostrarFormDestino && (
                        <div className="mb-2 flex gap-2">
                          <input
                            type="text"
                            value={novoDestino}
                            onChange={(e) => setNovoDestino(e.target.value)}
                            placeholder="Novo destino..."
                            className="flex-1 px-3 py-2 bg-[#132337] border border-emerald-500/20 rounded-lg text-sm text-white"
                          />
                          <button
                            type="button"
                            onClick={() => cadastrarItem('destinos', novoDestino, setBuscaDestino, setDestinoSelecionado, setMostrarFormDestino, setNovoDestino)}
                            className="px-3 py-2 bg-emerald-500 text-[#0a1625] text-sm font-semibold rounded-lg"
                          >
                            Salvar
                          </button>
                        </div>
                      )}
                      <input
                        type="text"
                        value={buscaDestino}
                        onChange={(e) => {
                          setBuscaDestino(e.target.value)
                          setDestinoSelecionado('')
                          setMostrarListaDestino(true)
                        }}
                        onFocus={() => setMostrarListaDestino(true)}
                        placeholder="Buscar destino..."
                        className="w-full px-4 py-2.5 bg-[#132337] border border-emerald-500/20 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition"
                      />
                      {mostrarListaDestino && !destinoSelecionado && (
                        <div className="absolute z-20 w-full mt-1.5 bg-[#132337] border border-emerald-500/25 rounded-xl shadow-2xl max-h-40 overflow-auto">
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

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={carregando}
                        className={`w-full font-semibold py-3 rounded-xl transition ${
                          tipoVeiculo === 'interno'
                            ? 'bg-emerald-500 hover:bg-emerald-400 text-[#0a1625] shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                            : 'bg-orange-500 hover:bg-orange-400 text-[#0a1625] shadow-[0_0_20px_rgba(249,115,22,0.25)]'
                        } disabled:opacity-40`}
                      >
                        {carregando ? 'Liberando...' : tipoVeiculo === 'interno' ? 'Liberar Veículo da Empresa' : 'Liberar Veículo Externo'}
                      </button>
                    </div>

                    {mensagem && (
                      <div className={`p-3 rounded-xl text-sm ${
                        mensagem.includes('sucesso')
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-300 border border-red-500/20'
                      }`}>
                        {mensagem}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}