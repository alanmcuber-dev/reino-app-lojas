'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase'

const MENU = [
  { icon: '📊', label: 'Dashboard',     href: '/dashboard' },
  { icon: '📦', label: 'Produtos',      href: '/dashboard/produtos' },
  { icon: '🗂️', label: 'Estoque',       href: '/dashboard/estoque' },
  { icon: '📋', label: 'Pedidos',       href: '/dashboard/pedidos' },
  { icon: '👥', label: 'Clientes',      href: '/dashboard/clientes' },
  { icon: '🖼️', label: 'Banners',       href: '/dashboard/banners' },
  { icon: '📈', label: 'Relatórios',    href: '/dashboard/relatorios' },
  { icon: '💰', label: 'Financeiro',    href: '/dashboard/financeiro' },
  { icon: '🔌', label: 'Integrações',   href: '/dashboard/integracoes' },
  { icon: '⚙️', label: 'Configurações', href: '/dashboard/configuracoes' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState({ vendas_hoje: 0, pedidos: 0, lucro: 0, estoque_baixo: 0 })
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loja, setLoja] = useState<any>(null)
  const paginaAtual = typeof window !== 'undefined' ? window.location.pathname : '/dashboard'

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    const { data: usuario } = await supabase.from('usuarios').select('*, lojas(*)').eq('id', user.id).single()
    if (usuario?.lojas) setLoja(usuario.lojas)
    const lojaId = usuario?.loja_id
    if (!lojaId) { setLoading(false); return }
    const { data: pedidosData } = await supabase.from('pedidos').select('*').eq('loja_id', lojaId).order('created_at', { ascending: false }).limit(5)
    if (pedidosData) setPedidos(pedidosData)
    const { data: pedidosHoje } = await supabase.from('pedidos').select('total').eq('loja_id', lojaId).eq('status', 'finalizado').gte('created_at', new Date().toISOString().split('T')[0])
    const { data: estoqueBaixo } = await supabase.from('produtos').select('id').eq('loja_id', lojaId).lt('estoque', 5).is('deletado_em', null)
    const totalHoje = pedidosHoje?.reduce((a, p) => a + Number(p.total), 0) ?? 0
    setStats({ vendas_hoje: totalHoje, pedidos: pedidosData?.length ?? 0, lucro: totalHoje * 0.35, estoque_baixo: estoqueBaixo?.length ?? 0 })
    setLoading(false)
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const STATUS_COR: Record<string, string> = { pendente: '#f59e0b', pago: '#22c55e', preparando: '#3b82f6', finalizado: '#8b5cf6', cancelado: '#ef4444' }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a1625' }}>
      <div style={{ width: '220px', background: '#0d1b2e', borderRight: '1px solid rgba(201,152,42,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(201,152,42,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: '#c9982a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👑</div>
          <div>
            <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Reino App</div>
            <div style={{ color: '#c9982a', fontSize: '10px' }}>Lojas</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {MENU.map(item => {
            const ativo = paginaAtual === item.href
            return (
              <div key={item.label} onClick={() => window.location.href = item.href}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', color: ativo ? '#c9982a' : '#8ea3be', background: ativo ? 'rgba(201,152,42,0.1)' : 'transparent', borderLeft: ativo ? '2px solid #c9982a' : '2px solid transparent', cursor: 'pointer', fontSize: '13px' }}>
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            )
          })}
        </nav>
        <div style={{ padding: '12px' }}>
          <button onClick={async () => { const s = createClient(); await s.auth.signOut(); window.location.href = '/login' }}
            style={{ width: '100%', background: 'transparent', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '8px', color: '#8ea3be', fontSize: '12px', cursor: 'pointer' }}>
            🚪 Sair
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '56px', background: '#0d1b2e', borderBottom: '1px solid rgba(201,152,42,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
          <div>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>{loja?.nome ?? 'Reino Store Demo'}</div>
            <div style={{ color: '#c9982a', fontSize: '11px' }}>Painel da Loja</div>
          </div>
          <button onClick={() => window.location.href = '/dashboard/produtos'}
            style={{ background: '#c9982a', color: '#0d1b2e', border: 'none', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            + Novo Produto
          </button>
        </div>
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#8ea3be', padding: '40px' }}>Carregando dados...</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
                {[
                  { icon: '🛒', label: 'Vendas hoje', valor: fmt(stats.vendas_hoje), cor: '#c9982a' },
                  { icon: '📋', label: 'Pedidos', valor: String(stats.pedidos), cor: '#3b82f6' },
                  { icon: '📈', label: 'Lucro estimado', valor: fmt(stats.lucro), cor: '#22c55e' },
                  { icon: '📦', label: 'Estoque baixo', valor: `${stats.estoque_baixo} itens`, cor: '#f59e0b' },
                ].map(card => (
                  <div key={card.label} style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.1)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${card.cor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{card.icon}</div>
                    <div>
                      <div style={{ color: '#8ea3be', fontSize: '11px' }}>{card.label}</div>
                      <div style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>{card.valor}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.1)', borderRadius: '12px', padding: '16px' }}>
                <h3 style={{ color: '#fff', fontSize: '14px', fontWeight: 500, margin: '0 0 14px' }}>Pedidos recentes</h3>
                {pedidos.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>{['Pedido', 'Cliente', 'Status', 'Total'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: '#8ea3be', fontSize: '11px', fontWeight: 400, borderBottom: '1px solid rgba(201,152,42,0.1)' }}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {pedidos.map(p => (
                        <tr key={p.id}>
                          <td style={{ padding: '8px', color: '#c9982a', fontSize: '12px', fontWeight: 500 }}>#{p.numero}</td>
                          <td style={{ padding: '8px', color: '#b8cde2', fontSize: '12px' }}>{p.cliente_nome}</td>
                          <td style={{ padding: '8px' }}>
                            <span style={{ background: `${STATUS_COR[p.status] ?? '#8ea3be'}20`, color: STATUS_COR[p.status] ?? '#8ea3be', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 500 }}>{p.status}</span>
                          </td>
                          <td style={{ padding: '8px', color: '#fff', fontSize: '12px', fontWeight: 500 }}>{fmt(Number(p.total))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#8ea3be' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
                    <p style={{ fontSize: '13px' }}>Quando chegarem pedidos, aparecerão aqui!</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}