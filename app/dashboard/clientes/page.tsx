'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    const { data: usuario } = await supabase.from('usuarios').select('loja_id').eq('id', user.id).single()
    if (!usuario?.loja_id) { setLoading(false); return }
    const { data } = await supabase.from('clientes').select('*').eq('loja_id', usuario.loja_id).order('total_gasto', { ascending: false })
    setClientes(data ?? [])
    setLoading(false)
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const filtrados = clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()) || c.telefone.includes(busca))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a1625' }}>
      <div style={{ width: '220px', background: '#0d1b2e', borderRight: '1px solid rgba(201,152,42,0.1)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(201,152,42,0.1)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: '#c9982a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👑</div>
          <div><div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Reino App</div><div style={{ color: '#c9982a', fontSize: '10px' }}>Lojas</div></div>
        </div>
        <nav style={{ flex: 1, padding: '8px 0' }}>
          {[
            { icon: '📊', label: 'Dashboard', href: '/dashboard' },
            { icon: '📦', label: 'Produtos', href: '/dashboard/produtos' },
            { icon: '📋', label: 'Pedidos', href: '/dashboard/pedidos' },
            { icon: '👥', label: 'Clientes', href: '/dashboard/clientes', ativo: true },
            { icon: '⚙️', label: 'Configurações', href: '/dashboard/configuracoes' },
          ].map(item => (
            <a key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', color: (item as any).ativo ? '#c9982a' : '#8ea3be', background: (item as any).ativo ? 'rgba(201,152,42,0.1)' : 'transparent', borderLeft: (item as any).ativo ? '2px solid #c9982a' : '2px solid transparent', fontSize: '13px', textDecoration: 'none' }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, margin: '0 0 4px' }}>Clientes</h1>
          <p style={{ color: '#8ea3be', fontSize: '13px', margin: 0 }}>{clientes.length} cliente{clientes.length !== 1 ? 's' : ''}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '20px' }}>
          {[
            { icon: '👥', label: 'Total', valor: String(clientes.length) },
            { icon: '🔄', label: 'Recorrentes', valor: String(clientes.filter(c => c.total_pedidos > 1).length) },
            { icon: '💰', label: 'Ticket médio', valor: clientes.length > 0 ? fmt(clientes.reduce((a, c) => a + Number(c.total_gasto), 0) / clientes.length) : 'R$ 0,00' },
          ].map(s => (
            <div key={s.label} style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.1)', borderRadius: '12px', padding: '14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '24px' }}>{s.icon}</span>
              <div>
                <div style={{ color: '#8ea3be', fontSize: '11px' }}>{s.label}</div>
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>{s.valor}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.1)', borderRadius: '10px', padding: '10px 14px', display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <span>🔍</span>
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por nome ou telefone..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px' }} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#8ea3be', padding: '40px' }}>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.1)', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
            <p style={{ color: '#fff', fontSize: '15px' }}>{busca ? 'Nenhum cliente encontrado' : 'Nenhum cliente ainda'}</p>
            <p style={{ color: '#8ea3be', fontSize: '13px' }}>{!busca && 'Clientes aparecem automaticamente quando finalizarem pedidos!'}</p>
          </div>
        ) : (
          <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.1)', borderRadius: '14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,152,42,0.1)' }}>
                  {['Cliente','Telefone','Pedidos','Total gasto','Ação'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#8ea3be', fontSize: '12px', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid rgba(201,152,42,0.05)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', background: '#0d1b2e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9982a', fontSize: '14px', fontWeight: 700 }}>
                          {c.nome[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>{c.nome}</div>
                          {c.total_pedidos > 1 && <span style={{ background: '#22c55e20', color: '#22c55e', fontSize: '10px', padding: '1px 6px', borderRadius: '10px' }}>⭐ Recorrente</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#8ea3be', fontSize: '13px' }}>{c.telefone}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: 'rgba(201,152,42,0.15)', color: '#c9982a', padding: '2px 8px', borderRadius: '20px', fontSize: '12px' }}>
                        {c.total_pedidos} pedido{c.total_pedidos !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#c9982a', fontSize: '13px', fontWeight: 600 }}>{fmt(Number(c.total_gasto))}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <a href={'https://wa.me/55' + c.telefone} target="_blank" style={{ background: '#25D366', color: '#fff', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', textDecoration: 'none' }}>
                        💬 WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}