'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase'

const STATUS_FLUXO: Record<string, string[]> = {
  pendente:             ['pago', 'preparando', 'cancelado'],
  pago:                 ['preparando', 'cancelado'],
  preparando:           ['saiu_para_entrega', 'pronto_para_retirada', 'cancelado'],
  saiu_para_entrega:    ['finalizado', 'cancelado'],
  pronto_para_retirada: ['finalizado', 'cancelado'],
  finalizado:           [],
  cancelado:            [],
}

const STATUS_COR: Record<string, string> = {
  pendente:             '#f59e0b',
  pago:                 '#22c55e',
  preparando:           '#3b82f6',
  saiu_para_entrega:    '#8b5cf6',
  pronto_para_retirada: '#06b6d4',
  finalizado:           '#6b7280',
  cancelado:            '#ef4444',
}

const STATUS_LABEL: Record<string, string> = {
  pendente:             'Pendente',
  pago:                 'Pago',
  preparando:           'Preparando',
  saiu_para_entrega:    'Saiu p/ entrega',
  pronto_para_retirada: 'Pronto p/ retirada',
  finalizado:           'Finalizado',
  cancelado:            'Cancelado',
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lojaId, setLojaId] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [expandido, setExpandido] = useState<string | null>(null)
  const [atualizando, setAtualizando] = useState<string | null>(null)

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const { data: usuario } = await supabase
      .from('usuarios').select('loja_id').eq('id', user.id).single()
    if (!usuario?.loja_id) { setLoading(false); return }
    setLojaId(usuario.loja_id)

    const { data } = await supabase
      .from('pedidos')
      .select('*, itens:itens_pedido(*)')
      .eq('loja_id', usuario.loja_id)
      .order('created_at', { ascending: false })
      .limit(50)

    setPedidos(data ?? [])
    setLoading(false)
  }

  async function mudarStatus(pedidoId: string, novoStatus: string) {
    setAtualizando(pedidoId)
    const supabase = createClient()
    await supabase.from('pedidos').update({ status: novoStatus }).eq('id', pedidoId)
    setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, status: novoStatus } : p))
    setAtualizando(null)
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const pedidosFiltrados = filtro === 'todos'
    ? pedidos
    : pedidos.filter(p => p.status === filtro)

  const contadores = {
    todos:     pedidos.length,
    pendente:  pedidos.filter(p => p.status === 'pendente').length,
    preparando:pedidos.filter(p => p.status === 'preparando').length,
    finalizado:pedidos.filter(p => p.status === 'finalizado').length,
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a1625' }}>

      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0d1b2e', borderRight: '1px solid rgba(201,152,42,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(201,152,42,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: '#c9982a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👑</div>
          <div><div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Reino App</div><div style={{ color: '#c9982a', fontSize: '10px' }}>Lojas</div></div>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {[
            { icon: '📊', label: 'Dashboard', href: '/dashboard' },
            { icon: '📦', label: 'Produtos', href: '/dashboard/produtos' },
            { icon: '📋', label: 'Pedidos', href: '/dashboard/pedidos', ativo: true },
            { icon: '👥', label: 'Clientes', href: '/dashboard/clientes' },
            { icon: '⚙️', label: 'Configurações', href: '/dashboard/configuracoes' },
          ].map(item => (
            <a key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', color: item.ativo ? '#c9982a' : '#8ea3be', background: item.ativo ? 'rgba(201,152,42,0.1)' : 'transparent', borderLeft: item.ativo ? '2px solid #c9982a' : '2px solid transparent', fontSize: '13px', textDecoration: 'none' }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      {/* Conteúdo */}
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, margin: 0 }}>Pedidos</h1>
            <p style={{ color: '#8ea3be', fontSize: '13px', margin: '4px 0 0' }}>{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} no total</p>
          </div>
          <button onClick={carregarDados} style={{ background: 'rgba(201,152,42,0.15)', color: '#c9982a', border: '1px solid rgba(201,152,42,0.3)', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer' }}>
            🔄 Atualizar
          </button>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            ['todos', 'Todos', contadores.todos],
            ['pendente', 'Pendentes', contadores.pendente],
            ['preparando', 'Preparando', contadores.preparando],
            ['finalizado', 'Finalizados', contadores.finalizado],
          ].map(([val, label, count]) => (
            <button
              key={val}
              onClick={() => setFiltro(val as string)}
              style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${filtro === val ? '#c9982a' : 'rgba(201,152,42,0.2)'}`, background: filtro === val ? '#c9982a' : 'transparent', color: filtro === val ? '#0d1b2e' : '#8ea3be', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
            >
              {label as string} {Number(count) > 0 && <span style={{ background: filtro === val ? 'rgba(0,0,0,0.2)' : 'rgba(201,152,42,0.2)', borderRadius: '10px', padding: '1px 6px', marginLeft: '4px', fontSize: '11px' }}>{count as number}</span>}
            </button>
          ))}
        </div>

        {/* Lista de pedidos */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#8ea3be', padding: '40px' }}>Carregando...</div>
        ) : pedidosFiltrados.length === 0 ? (
          <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.1)', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
            <p style={{ color: '#fff', fontSize: '15px' }}>Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pedidosFiltrados.map(pedido => {
              const aberto = expandido === pedido.id
              const proximos = STATUS_FLUXO[pedido.status] ?? []
              const cor = STATUS_COR[pedido.status] ?? '#8ea3be'

              return (
                <div key={pedido.id} style={{ background: '#132236', border: `1px solid ${aberto ? 'rgba(201,152,42,0.3)' : 'rgba(201,152,42,0.1)'}`, borderRadius: '14px', overflow: 'hidden' }}>

                  {/* Header do pedido */}
                  <div
                    onClick={() => setExpandido(aberto ? null : pedido.id)}
                    style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${cor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', border: `1px solid ${cor}40` }}>
                        {pedido.status === 'pendente' ? '⏳' : pedido.status === 'pago' ? '✅' : pedido.status === 'preparando' ? '👨‍🍳' : pedido.status === 'saiu_para_entrega' ? '🛵' : pedido.status === 'finalizado' ? '🎉' : pedido.status === 'cancelado' ? '❌' : '📦'}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>#{pedido.numero}</span>
                          <span style={{ background: `${cor}20`, color: cor, fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 500 }}>
                            {STATUS_LABEL[pedido.status]}
                          </span>
                        </div>
                        <div style={{ color: '#8ea3be', fontSize: '12px', marginTop: '2px' }}>{pedido.cliente_nome} · {pedido.tipo_entrega === 'entrega' ? '🛵 Entrega' : '🏪 Retirada'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#c9982a', fontWeight: 700, fontSize: '15px' }}>{fmt(Number(pedido.total))}</div>
                      <div style={{ color: '#8ea3be', fontSize: '11px' }}>{new Date(pedido.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>

                  {/* Detalhes expandidos */}
                  {aberto && (
                    <div style={{ borderTop: '1px solid rgba(201,152,42,0.1)', padding: '14px 16px' }}>

                      {/* Itens */}
                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Itens do pedido</p>
                        {(pedido.itens ?? []).map((item: any, i: number) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid rgba(201,152,42,0.05)' }}>
                            <span style={{ color: '#b8cde2', fontSize: '13px' }}>{item.quantidade}× {item.produto_nome}</span>
                            <span style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>{fmt(Number(item.preco_unitario) * item.quantidade)}</span>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 0', marginTop: '4px' }}>
                          <span style={{ color: '#fff', fontWeight: 600 }}>Total</span>
                          <span style={{ color: '#c9982a', fontWeight: 700, fontSize: '15px' }}>{fmt(Number(pedido.total))}</span>
                        </div>
                      </div>

                      {/* Info cliente */}
                      <div style={{ background: '#0d1b2e', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <div style={{ color: '#8ea3be', fontSize: '12px' }}>📱 {pedido.cliente_telefone}</div>
                        <div style={{ color: '#8ea3be', fontSize: '12px' }}>💳 {pedido.forma_pagamento?.replace('_', ' ')}</div>
                        {pedido.endereco?.bairro && <div style={{ color: '#8ea3be', fontSize: '12px', gridColumn: '1 / -1' }}>📍 {pedido.endereco.logradouro}, {pedido.endereco.numero} — {pedido.endereco.bairro}</div>}
                        {pedido.observacao && <div style={{ color: '#f59e0b', fontSize: '12px', gridColumn: '1 / -1' }}>📝 {pedido.observacao}</div>}
                      </div>

                      {/* Botões de ação */}
                      {proximos.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {proximos.map(status => (
                            <button
                              key={status}
                              disabled={atualizando === pedido.id}
                              onClick={() => mudarStatus(pedido.id, status)}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: `1px solid ${status === 'cancelado' ? '#ef444440' : 'rgba(201,152,42,0.3)'}`,
                                background: status === 'cancelado' ? '#ef444415' : 'rgba(201,152,42,0.15)',
                                color: status === 'cancelado' ? '#ef4444' : '#c9982a',
                                fontSize: '12px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                opacity: atualizando === pedido.id ? 0.5 : 1
                              }}
                            >
                              {atualizando === pedido.id ? '...' : STATUS_LABEL[status]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}