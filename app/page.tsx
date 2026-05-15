export default function LojaDemo() {
  return (
    <div style={{ maxWidth: '430px', margin: '0 auto', background: '#f5f5f5', minHeight: '100vh', paddingBottom: '70px' }}>

      {/* Header */}
      <div style={{ background: '#0d1b2e', padding: '12px 16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: '#c9982a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👑</div>
            <div>
              <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Reino Store Demo</div>
              <div style={{ color: '#c9982a', fontSize: '10px' }}>● Aberta agora</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', background: '#132236', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer' }}>🔔</div>
            <div style={{ width: '36px', height: '36px', background: '#132236', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer', position: 'relative' }}>
              🛒
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', background: '#c9982a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, color: '#0d1b2e' }}>2</div>
            </div>
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔍</span>
          <input placeholder="Buscar produtos..." style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#333' }} />
        </div>
      </div>

      {/* Banner */}
      <div style={{ margin: '12px 16px', background: 'linear-gradient(120deg, #0d1b2e, #1a3a60)', borderRadius: '14px', padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#fff', fontSize: '17px', fontWeight: 500, lineHeight: 1.3 }}>Compre online e<br /><span style={{ color: '#c9982a' }}>retire na loja</span></div>
          <div style={{ color: '#8ea3be', fontSize: '12px', margin: '6px 0 10px' }}>Pedidos rápidos e pagamento facilitado</div>
          <button style={{ background: '#c9982a', color: '#0d1b2e', border: 'none', borderRadius: '8px', padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Ver ofertas</button>
        </div>
        <div style={{ fontSize: '48px' }}>🛍️</div>
      </div>

      {/* Categorias */}
      <div style={{ padding: '0 16px 12px' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: '#222', marginBottom: '10px' }}>Categorias</div>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {[
            { icon: '👕', nome: 'Roupas' },
            { icon: '👟', nome: 'Calçados' },
            { icon: '🎁', nome: 'Presentes' },
            { icon: '🍳', nome: 'Utensílios' },
            { icon: '🏷️', nome: 'Promoções' },
            { icon: '⌚', nome: 'Relógios' },
          ].map(cat => (
            <div key={cat.nome} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '60px', cursor: 'pointer' }}>
              <div style={{ width: '52px', height: '52px', background: '#0d1b2e', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '1px solid rgba(201,152,42,0.2)' }}>{cat.icon}</div>
              <div style={{ fontSize: '11px', color: '#555', textAlign: 'center' }}>{cat.nome}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Produtos */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#222' }}>Destaques</div>
          <div style={{ color: '#c9982a', fontSize: '13px', cursor: 'pointer' }}>Ver todos ›</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {[
            { emoji: '👜', nome: 'Bolsa Feminina', preco: 'R$ 89,90', selo: 'Em estoque', corSelo: '#15803d', bgSelo: '#dcfce7' },
            { emoji: '👡', nome: 'Sandália Feminina', preco: 'R$ 59,90', precoOld: 'R$ 79,90', selo: 'Promoção', corSelo: '#92400e', bgSelo: '#fef3c7' },
            { emoji: '🍳', nome: 'Kit Cozinha', preco: 'R$ 129,90', selo: 'Em estoque', corSelo: '#15803d', bgSelo: '#dcfce7' },
            { emoji: '⌚', nome: 'Relógio Masculino', preco: 'R$ 149,90', selo: 'Novo', corSelo: '#1d4ed8', bgSelo: '#dbeafe' },
            { emoji: '🎁', nome: 'Kit Presente', preco: 'R$ 99,90', precoOld: 'R$ 139,90', selo: 'Promoção', corSelo: '#92400e', bgSelo: '#fef3c7' },
            { emoji: '👟', nome: 'Tênis Esportivo', preco: 'R$ 199,90', selo: 'Em estoque', corSelo: '#15803d', bgSelo: '#dcfce7' },
          ].map(prod => (
            <div key={prod.nome} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e8e8e8', cursor: 'pointer' }}>
              <div style={{ background: '#f0f0f0', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', position: 'relative' }}>
                {prod.emoji}
                <div style={{ position: 'absolute', top: '6px', left: '6px', background: prod.bgSelo, color: prod.corSelo, fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '6px' }}>{prod.selo}</div>
              </div>
              <div style={{ padding: '8px' }}>
                <div style={{ fontSize: '11px', color: '#333', fontWeight: 500, marginBottom: '2px', lineHeight: 1.3 }}>{prod.nome}</div>
                {prod.precoOld && <div style={{ fontSize: '10px', color: '#999', textDecoration: 'line-through' }}>{prod.precoOld}</div>}
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{prod.preco}</div>
                <button style={{ width: '100%', marginTop: '6px', background: '#0d1b2e', color: '#fff', border: 'none', borderRadius: '7px', padding: '6px', fontSize: '10px', cursor: 'pointer' }}>
                  🛒 Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '430px', background: '#fff', borderTop: '1px solid #e8e8e8', display: 'flex', zIndex: 50 }}>
        {[
          { icon: '🏠', label: 'Início', ativo: true },
          { icon: '📂', label: 'Categorias' },
          { icon: '📋', label: 'Pedidos' },
          { icon: '❤️', label: 'Favoritos' },
          { icon: '👤', label: 'Perfil' },
        ].map(item => (
          <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 4px', cursor: 'pointer', color: item.ativo ? '#0d1b2e' : '#999', fontSize: '10px', gap: '2px' }}>
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}