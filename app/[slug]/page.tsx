'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '../../lib/supabase'

export default function LojaPublica() {
  const { slug } = useParams()
  const [loja, setLoja] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)
  const [produtos, setProdutos] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])
  const [busca, setBusca] = useState('')
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => { if (slug) carregarLoja() }, [slug])

  async function carregarLoja() {
    const supabase = createClient()
    const { data: lojaData } = await supabase
      .from('lojas').select('*, configuracoes(*), integracoes(*)')
      .eq('slug', slug).eq('status', 'ativa').single()

    if (!lojaData) { setNotFound(true); setLoading(false); return }
    setLoja(lojaData)
    setConfig(lojaData.configuracoes)

    const [{ data: produtosData }, { data: categoriasData }] = await Promise.all([
      supabase.from('produtos').select('*').eq('loja_id', lojaData.id).eq('ativo', true).is('deletado_em', null).order('created_at', { ascending: false }),
      supabase.from('categorias').select('*').eq('loja_id', lojaData.id).eq('ativo', true).order('ordem')
    ])
    setProdutos(produtosData ?? [])
    setCategorias(categoriasData ?? [])
    setLoading(false)
  }

  function adicionarCarrinho(produto: any) {
    setCarrinho(prev => {
      const existe = prev.find(i => i.id === produto.id)
      if (existe) return prev.map(i => i.id === produto.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...produto, qty: 1 }]
    })
  }

  function removerCarrinho(id: string) {
    setCarrinho(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0))
  }

  function irParaCheckout() {
    localStorage.setItem(`carrinho-${slug}`, JSON.stringify(carrinho))
    localStorage.setItem('loja-slug', slug as string)
    window.location.href = `/${slug}/checkout`
  }

  const total = carrinho.reduce((a, i) => a + (Number(i.preco_promocional || i.preco) * i.qty), 0)
  const qtd = carrinho.reduce((a, i) => a + i.qty, 0)
  const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const imgUrl = (p: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/imagens/${p}`

  // Cores da loja
  const corPrimaria = config?.cor_primaria ?? '#c9982a'
  const corSecundaria = config?.cor_secundaria ?? '#0d1b2e'
  const corTexto = config?.cor_texto ?? '#ffffff'
  const logoUrl = loja?.logo ? (loja.logo.startsWith('http') ? loja.logo : imgUrl(loja.logo)) : null

  // Grid de produtos
  const gridCols = config?.layout_produtos === 'grade2' ? '1fr 1fr' : config?.layout_produtos === 'lista' ? '1fr' : '1fr 1fr 1fr'

  if (loading) return (
    <div style={{ minHeight:'100vh', background:corSecundaria, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px' }}>
      <div style={{ fontSize:'32px' }}>👑</div>
      <p style={{ color:corPrimaria, fontSize:'14px' }}>Carregando loja...</p>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight:'100vh', background:'#0d1b2e', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'12px', textAlign:'center', padding:'20px' }}>
      <div style={{ fontSize:'48px' }}>🏪</div>
      <h1 style={{ color:'#fff', fontSize:'22px', fontWeight:700 }}>Loja não encontrada</h1>
      <p style={{ color:'#8ea3be', fontSize:'14px' }}>A loja <strong style={{ color:'#c9982a' }}>/{slug}</strong> não existe ou está inativa.</p>
    </div>
  )

  return (
    <div style={{ maxWidth:'430px', margin:'0 auto', background:'#f5f5f5', minHeight:'100vh', paddingBottom:'140px' }}>

      {/* Header */}
      <div style={{ background:corSecundaria, padding:'12px 16px', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            {logoUrl ? (
              <img src={logoUrl} style={{ width:'36px', height:'36px', borderRadius:'10px', objectFit:'cover' }} />
            ) : (
              <div style={{ width:'36px', height:'36px', background:corPrimaria, borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>👑</div>
            )}
            <div>
              <div style={{ color:corTexto, fontSize:'14px', fontWeight:600 }}>{loja?.nome}</div>
              <div style={{ color:corPrimaria, fontSize:'10px' }}>● Aberta agora</div>
            </div>
          </div>
          <div onClick={qtd > 0 ? irParaCheckout : undefined} style={{ position:'relative', width:'36px', height:'36px', background:`${corPrimaria}20`, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', cursor:qtd > 0 ? 'pointer':'default' }}>
            🛒
            {qtd > 0 && <div style={{ position:'absolute', top:'-4px', right:'-4px', width:'16px', height:'16px', background:corPrimaria, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:700, color:corSecundaria }}>{qtd}</div>}
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:'10px', padding:'8px 12px', display:'flex', alignItems:'center', gap:'8px' }}>
          <span>🔍</span>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar produtos..." style={{ flex:1, border:'none', outline:'none', fontSize:'14px', color:corTexto, background:'transparent' }} />
        </div>
      </div>

      {/* Banner */}
      <div style={{ margin:'12px 16px', background:`linear-gradient(120deg, ${corSecundaria} 0%, ${corPrimaria}40 100%)`, borderRadius:'14px', padding:'20px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', border:`1px solid ${corPrimaria}30` }}>
        <div>
          <div style={{ color:'#fff', fontSize:'17px', fontWeight:500, lineHeight:1.3 }}>Bem-vindo à<br /><span style={{ color:corPrimaria }}>{loja?.nome}</span></div>
          <div style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px', margin:'6px 0 10px' }}>Faça seu pedido com facilidade</div>
          <button onClick={irParaCheckout} style={{ background:corPrimaria, color:corSecundaria, border:'none', borderRadius:'8px', padding:'7px 14px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>
            Ver produtos
          </button>
        </div>
        <div style={{ fontSize:'48px' }}>🛍️</div>
      </div>

      {/* Categorias */}
      {categorias.length > 0 && (
        <div style={{ padding:'0 16px 12px' }}>
          <div style={{ fontSize:'15px', fontWeight:600, color:'#222', marginBottom:'10px' }}>Categorias</div>
          <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px' }}>
            {categorias.map(cat => (
              <div key={cat.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', minWidth:'60px', cursor:'pointer' }}>
                <div style={{ width:'50px', height:'50px', background:corSecundaria, borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', border:`1px solid ${corPrimaria}30` }}>
                  {cat.icone ?? '📦'}
                </div>
                <div style={{ fontSize:'10px', color:'#555', textAlign:'center' }}>{cat.nome}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Produtos */}
      <div style={{ padding:'0 16px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
          <div style={{ fontSize:'15px', fontWeight:600, color:'#222' }}>{busca ? `"${busca}"` : 'Produtos'}</div>
          <div style={{ color:'#999', fontSize:'12px' }}>{produtosFiltrados.length} itens</div>
        </div>

        {produtosFiltrados.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>
            <div style={{ fontSize:'40px', marginBottom:'8px' }}>🔍</div>
            <p>Nenhum produto encontrado</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:gridCols, gap:'10px' }}>
            {produtosFiltrados.map(prod => {
              const noCarrinho = carrinho.find(i => i.id === prod.id)
              const isLista = config?.layout_produtos === 'lista'
              return (
                <div key={prod.id} style={{ background:'#fff', borderRadius:'12px', overflow:'hidden', border:'1px solid #e8e8e8', display:isLista?'flex':'block' }}>
                  <div style={{ background:'#f0f0f0', aspectRatio:isLista?undefined:'1', width:isLista?'80px':undefined, minHeight:isLista?'80px':undefined, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', position:'relative', overflow:'hidden', flexShrink:0 }}>
                    {prod.imagens?.[0] ? <img src={imgUrl(prod.imagens[0])} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : '📦'}
                    {prod.estoque === 0 && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'11px', fontWeight:600 }}>Esgotado</div>}
                    {prod.novo && <div style={{ position:'absolute', top:'4px', left:'4px', background:'#3b82f6', color:'#fff', fontSize:'8px', fontWeight:600, padding:'2px 5px', borderRadius:'4px' }}>NOVO</div>}
                    {prod.preco_promocional && <div style={{ position:'absolute', top:'4px', right:'4px', background:'#ef4444', color:'#fff', fontSize:'8px', fontWeight:600, padding:'2px 5px', borderRadius:'4px' }}>PROMO</div>}
                  </div>
                  <div style={{ padding:'8px', flex:isLista?1:undefined, display:isLista?'flex':undefined, justifyContent:isLista?'space-between':undefined, alignItems:isLista?'center':undefined }}>
                    <div>
                      <div style={{ fontSize:'11px', color:'#333', fontWeight:500, lineHeight:1.3, marginBottom:'4px' }}>{prod.nome}</div>
                      {prod.preco_promocional && <div style={{ fontSize:'10px', color:'#999', textDecoration:'line-through' }}>{fmt(Number(prod.preco))}</div>}
                      <div style={{ fontSize:'13px', fontWeight:700, color:'#1a1a1a' }}>{fmt(Number(prod.preco_promocional || prod.preco))}</div>
                    </div>
                    {noCarrinho ? (
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:isLista?'0':'6px', gap:'8px' }}>
                        <button onClick={()=>removerCarrinho(prod.id)} style={{ background:'#ef444420', color:'#ef4444', border:'none', borderRadius:'6px', padding:'4px 8px', fontSize:'14px', cursor:'pointer' }}>−</button>
                        <span style={{ fontSize:'13px', fontWeight:600 }}>{noCarrinho.qty}</span>
                        <button onClick={()=>adicionarCarrinho(prod)} style={{ background:corSecundaria, color:corTexto, border:'none', borderRadius:'6px', padding:'4px 8px', fontSize:'14px', cursor:'pointer' }}>+</button>
                      </div>
                    ) : (
                      <button disabled={prod.estoque === 0} onClick={()=>adicionarCarrinho(prod)} style={{ width:isLista?'auto':'100%', marginTop:isLista?'0':'6px', background:prod.estoque===0?'#e0e0e0':corSecundaria, color:prod.estoque===0?'#999':corTexto, border:'none', borderRadius:'7px', padding:'6px 10px', fontSize:'10px', cursor:prod.estoque===0?'not-allowed':'pointer', whiteSpace:'nowrap' }}>
                        {prod.estoque===0?'Esgotado':'🛒 Adicionar'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Carrinho flutuante */}
      {carrinho.length > 0 && (
        <div style={{ position:'fixed', bottom:'70px', left:'50%', transform:'translateX(-50%)', width:'398px', background:corSecundaria, borderRadius:'14px', padding:'14px 16px', border:`1px solid ${corPrimaria}50`, zIndex:60 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
            <span style={{ color:corTexto, fontSize:'13px', fontWeight:500 }}>🛒 {qtd} iten{qtd!==1?'s':''}</span>
            <span style={{ color:corPrimaria, fontSize:'15px', fontWeight:700 }}>{fmt(total)}</span>
          </div>
          <button onClick={irParaCheckout} style={{ width:'100%', background:corPrimaria, color:corSecundaria, border:'none', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
            Finalizar pedido →
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'430px', background:'#fff', borderTop:'1px solid #e8e8e8', display:'flex', zIndex:50 }}>
        {['🏠 Início','📂 Categorias','📋 Pedidos','❤️ Favoritos','👤 Perfil'].map((item,i) => (
          <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 4px', cursor:'pointer', color:i===0?corSecundaria:'#999', fontSize:'10px', gap:'2px' }}>
            <span style={{ fontSize:'20px' }}>{item.split(' ')[0]}</span>
            <span>{item.split(' ')[1]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}