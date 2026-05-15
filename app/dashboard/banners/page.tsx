'use client'
import { createClient } from '../../../lib/supabase'

export default function BannersPage() {
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
          {[
            { icon: '📊', label: 'Dashboard', href: '/dashboard' },
            { icon: '📦', label: 'Produtos', href: '/dashboard/produtos' },
            { icon: '🗂️', label: 'Estoque', href: '/dashboard/estoque' },
            { icon: '📋', label: 'Pedidos', href: '/dashboard/pedidos' },
            { icon: '👥', label: 'Clientes', href: '/dashboard/clientes' },
            { icon: '🖼️', label: 'Banners', href: '/dashboard/banners' },
            { icon: '📈', label: 'Relatórios', href: '/dashboard/relatorios' },
            { icon: '💰', label: 'Financeiro', href: '/dashboard/financeiro' },
            { icon: '🔌', label: 'Integrações', href: '/dashboard/integracoes' },
            { icon: '⚙️', label: 'Configurações', href: '/dashboard/configuracoes' },
          ].map(item => (
            <div key={item.label} onClick={() => window.location.href = item.href}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 16px', color: item.href === '/dashboard/banners' ? '#c9982a' : '#8ea3be', background: item.href === '/dashboard/banners' ? 'rgba(201,152,42,0.1)' : 'transparent', borderLeft: item.href === '/dashboard/banners' ? '2px solid #c9982a' : '2px solid transparent', cursor: 'pointer', fontSize: '13px' }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: '12px' }}>
          <button onClick={async () => { const s = createClient(); await s.auth.signOut(); window.location.href = '/login' }}
            style={{ width: '100%', background: 'transparent', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '8px', color: '#8ea3be', fontSize: '12px', cursor: 'pointer' }}>
            🚪 Sair
          </button>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '56px', background: '#0d1b2e', borderBottom: '1px solid rgba(201,152,42,0.1)', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600 }}>🖼️ Banners</div>
        </div>
        <div style={{ flex: 1, padding: '20px' }}>
          <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.1)', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#8ea3be' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
            <h2 style={{ color: '#fff', marginBottom: '8px' }}>Banners</h2>
            <p>Em breve você poderá adicionar banners promocionais para sua loja.</p>
          </div>
        </div>
      </div>
    </div>
  )
}