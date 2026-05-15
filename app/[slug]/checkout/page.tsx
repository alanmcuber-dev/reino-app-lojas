'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '../../../lib/supabase'

export default function CheckoutSlug() {
  const { slug } = useParams()
  const [etapa, setEtapa] = useState(1)
  const [loading, setLoading] = useState(false)
  const [pedidoCriado, setPedidoCriado] = useState<any>(null)
  const [loja, setLoja] = useState<any>(null)
  const [config, setConfig] = useState<any>(null)
  const [carrinho, setCarrinho] = useState<any[]>([])

  const [form, setForm] = useState({
    nome:'', telefone:'',
    logradouro:'', numero:'', complemento:'', bairro:'',
    tipo_entrega:'entrega', forma_pagamento:'pix', observacao:''
  })

  useEffect(() => {
    const c = localStorage.getItem(`carrinho-${slug}`)
    if (c) setCarrinho(JSON.parse(c))
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('lojas').select('*, configuracoes(*), integracoes(*)').eq('slug', slug).single()
      setLoja(data)
      setConfig(data?.configuracoes)
    }
    load()
  }, [slug])

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const total = carrinho.reduce((a, i) => a + (Number(i.preco_promocional || i.preco) * i.qty), 0)

  const corPrimaria = config?.cor_primaria ?? '#c9982a'
  const corSecundaria = config?.cor_secundaria ?? '#0d1b2e'
  const corTexto = config?.cor_texto ?? '#ffffff'
  const logoUrl = loja?.logo ? (loja.logo.startsWith('http') ? loja.logo : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/imagens/${loja.logo}`) : null

  async function finalizarPedido() {
    if (!form.nome || !form.telefone) { alert('Nome e telefone são obrigatórios!'); return }
    setLoading(true)
    const supabase = createClient()
    const { data: pedido, error } = await supabase.from('pedidos').insert({
      loja_id: loja.id,
      cliente_nome: form.nome,
      cliente_telefone: form.telefone.replace(/\D/g, ''),
      endereco: form.tipo_entrega === 'entrega' ? { logradouro:form.logradouro, numero:form.numero, complemento:form.complemento, bairro:form.bairro } : null,
      tipo_entrega: form.tipo_entrega,
      forma_pagamento: form.forma_pagamento,
      subtotal: total, taxa_entrega: 0, desconto: 0, total,
      observacao: form.observacao || null,
      status: 'pendente',
    }).select().single()

    if (error || !pedido) { alert('Erro: ' + error?.message); setLoading(false); return }

    for (const item of carrinho) {
      await supabase.from('itens_pedido').insert({
        pedido_id: pedido.id, produto_id: item.id,
        produto_nome: item.nome, quantidade: item.qty,
        preco_unitario: Number(item.preco_promocional || item.preco), adicionais: [],
      })
    }

    localStorage.removeItem(`carrinho-${slug}`)
    setPedidoCriado(pedido)
    setLoading(false)
    setEtapa(3)
  }

  function enviarWhatsApp() {
    const tel = loja?.integracoes?.whatsapp || loja?.whatsapp
    if (!tel) { alert('WhatsApp não configurado'); return }
    const itens = carrinho.map(i => `• ${i.qty}x ${i.nome} — ${fmt(Number(i.preco_promocional || i.preco) * i.qty)}`).join('\n')
    const entrega = form.tipo_entrega === 'entrega' ? `\n📍 ${form.logradouro}, ${form.numero} — ${form.bairro}` : '\n🏪 Retirada na loja'
    const msg = `*Novo pedido — ${loja.nome}*\n\n👤 ${form.nome}\n📱 ${form.telefone}\n\n${itens}\n\n*Total: ${fmt(total)}*${entrega}\n💳 ${form.forma_pagamento}`
    window.open(`https://wa.me/55${tel.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const inp = { width:'100%', border:'1px solid #ddd', borderRadius:'8px', padding:'10px 12px', fontSize:'14px', outline:'none', boxSizing:'border-box' as const, color:'#333', background:'#fff' }

  if (etapa === 3) return (
    <div style={{ maxWidth:'430px', margin:'0 auto', minHeight:'100vh', background:'#f5f5f5', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎉</div>
        <h2 style={{ color:'#0d1b2e', fontSize:'22px', fontWeight:700, margin:'0 0 8px' }}>Pedido realizado!</h2>
        <p style={{ color:'#666', fontSize:'14px', marginBottom:'4px' }}>Pedido #{pedidoCriado?.numero}</p>
        <p style={{ color:'#666', fontSize:'14px', marginBottom:'24px' }}>Total: <strong>{fmt(total)}</strong></p>
        <div style={{ background:'#fff', borderRadius:'14px', padding:'20px', marginBottom:'16px', border:'1px solid #e0e0e0' }}>
          <p style={{ color:'#333', fontSize:'13px', marginBottom:'12px' }}>Avise o lojista pelo WhatsApp!</p>
          <button onClick={enviarWhatsApp} style={{ width:'100%', background:'#25D366', color:'#fff', border:'none', borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:600, cursor:'pointer', marginBottom:'8px' }}>
            💬 Confirmar pelo WhatsApp
          </button>
          <p style={{ color:'#999', fontSize:'12px' }}>Pedido registrado no sistema ✅</p>
        </div>
        <a href={`/${slug}`} style={{ display:'block', background:corSecundaria, color:corTexto, borderRadius:'10px', padding:'12px', fontSize:'14px', fontWeight:600, textDecoration:'none', textAlign:'center' }}>
          ← Voltar à loja
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth:'430px', margin:'0 auto', minHeight:'100vh', background:'#f5f5f5', paddingBottom:'20px' }}>

      {/* Header */}
      <div style={{ background:corSecundaria, padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px' }}>
        <a href={`/${slug}`} style={{ color:corPrimaria, fontSize:'20px', textDecoration:'none' }}>←</a>
        {logoUrl ? <img src={logoUrl} style={{ width:'28px', height:'28px', borderRadius:'8px', objectFit:'cover' }} /> : <div style={{ width:'28px', height:'28px', background:corPrimaria, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>👑</div>}
        <div>
          <div style={{ color:corTexto, fontSize:'15px', fontWeight:600 }}>Checkout</div>
          <div style={{ color:corPrimaria, fontSize:'11px' }}>Etapa {etapa} de 2</div>
        </div>
      </div>

      {/* Progresso */}
      <div style={{ display:'flex', background:'#fff', padding:'12px 16px', gap:'8px', borderBottom:'1px solid #e0e0e0' }}>
        {['Seus dados','Confirmar'].map((label, i) => (
          <div key={i} style={{ flex:1, textAlign:'center' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:etapa>=i+1?corPrimaria:'#e0e0e0', color:etapa>=i+1?corSecundaria:'#999', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:700, margin:'0 auto 4px' }}>{i+1}</div>
            <div style={{ fontSize:'11px', color:etapa===i+1?'#0d1b2e':'#999' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding:'16px' }}>
        {etapa === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <div style={{ background:'#fff', borderRadius:'12px', padding:'16px', border:'1px solid #e0e0e0' }}>
              <h3 style={{ color:'#0d1b2e', fontSize:'14px', fontWeight:600, margin:'0 0 12px' }}>👤 Seus dados</h3>
              <div style={{ marginBottom:'10px' }}>
                <label style={{ display:'block', color:'#666', fontSize:'12px', marginBottom:'4px' }}>Nome *</label>
                <input value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})} placeholder="Seu nome completo" style={inp} />
              </div>
              <div>
                <label style={{ display:'block', color:'#666', fontSize:'12px', marginBottom:'4px' }}>Telefone *</label>
                <input value={form.telefone} onChange={e=>setForm({...form,telefone:e.target.value})} placeholder="(11) 99999-9999" type="tel" style={inp} />
              </div>
            </div>

            <div style={{ background:'#fff', borderRadius:'12px', padding:'16px', border:'1px solid #e0e0e0' }}>
              <h3 style={{ color:'#0d1b2e', fontSize:'14px', fontWeight:600, margin:'0 0 12px' }}>🚚 Como quer receber?</h3>
              <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
                {[['entrega','🛵 Entrega'],['retirada','🏪 Retirada']].map(([val,label]) => (
                  <button key={val} onClick={()=>setForm({...form,tipo_entrega:val})} style={{ flex:1, padding:'10px', border:`2px solid ${form.tipo_entrega===val?corPrimaria:'#ddd'}`, borderRadius:'8px', background:form.tipo_entrega===val?`${corPrimaria}15`:'#fff', color:form.tipo_entrega===val?corPrimaria:'#666', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>
                    {label}
                  </button>
                ))}
              </div>
              {form.tipo_entrega === 'entrega' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  <input value={form.logradouro} onChange={e=>setForm({...form,logradouro:e.target.value})} placeholder="Rua / Avenida" style={inp} />
                  <div style={{ display:'flex', gap:'8px' }}>
                    <input value={form.numero} onChange={e=>setForm({...form,numero:e.target.value})} placeholder="Número" style={{...inp, width:'80px'}} />
                    <input value={form.complemento} onChange={e=>setForm({...form,complemento:e.target.value})} placeholder="Complemento" style={{...inp, flex:1}} />
                  </div>
                  <input value={form.bairro} onChange={e=>setForm({...form,bairro:e.target.value})} placeholder="Bairro" style={inp} />
                </div>
              )}
            </div>

            <div style={{ background:'#fff', borderRadius:'12px', padding:'16px', border:'1px solid #e0e0e0' }}>
              <h3 style={{ color:'#0d1b2e', fontSize:'14px', fontWeight:600, margin:'0 0 12px' }}>💳 Pagamento</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                {[['pix','💠 Pix'],['dinheiro','💵 Dinheiro'],['cartao_credito','💳 Crédito'],['cartao_debito','💳 Débito']].map(([val,label]) => (
                  <button key={val} onClick={()=>setForm({...form,forma_pagamento:val})} style={{ padding:'10px', border:`2px solid ${form.forma_pagamento===val?corPrimaria:'#ddd'}`, borderRadius:'8px', background:form.forma_pagamento===val?`${corPrimaria}15`:'#fff', color:form.forma_pagamento===val?corPrimaria:'#666', fontSize:'12px', fontWeight:500, cursor:'pointer' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background:'#fff', borderRadius:'12px', padding:'16px', border:'1px solid #e0e0e0' }}>
              <h3 style={{ color:'#0d1b2e', fontSize:'14px', fontWeight:600, margin:'0 0 8px' }}>📝 Observação</h3>
              <textarea value={form.observacao} onChange={e=>setForm({...form,observacao:e.target.value})} rows={2} placeholder="Ex: sem cebola, entregar no portão..." style={{...inp, resize:'none'}} />
            </div>

            <button onClick={()=>setEtapa(2)} style={{ width:'100%', background:corSecundaria, color:corTexto, border:'none', borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:600, cursor:'pointer' }}>
              Continuar →
            </button>
          </div>
        )}

        {etapa === 2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <div style={{ background:'#fff', borderRadius:'12px', padding:'16px', border:'1px solid #e0e0e0' }}>
              <h3 style={{ color:'#0d1b2e', fontSize:'14px', fontWeight:600, margin:'0 0 12px' }}>📋 Resumo</h3>
              {carrinho.map((item,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #f0f0f0' }}>
                  <span style={{ color:'#333', fontSize:'13px' }}>{item.qty}× {item.nome}</span>
                  <span style={{ color:'#0d1b2e', fontSize:'13px', fontWeight:500 }}>{fmt(Number(item.preco_promocional||item.preco)*item.qty)}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0 0' }}>
                <span style={{ color:'#0d1b2e', fontSize:'15px', fontWeight:700 }}>Total</span>
                <span style={{ color:corPrimaria, fontSize:'18px', fontWeight:700 }}>{fmt(total)}</span>
              </div>
            </div>

            <div style={{ background:'#fff', borderRadius:'12px', padding:'16px', border:'1px solid #e0e0e0' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'#666', fontSize:'13px' }}>👤 Nome</span><span style={{ color:'#333', fontSize:'13px', fontWeight:500 }}>{form.nome}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'#666', fontSize:'13px' }}>📱 Telefone</span><span style={{ color:'#333', fontSize:'13px', fontWeight:500 }}>{form.telefone}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'#666', fontSize:'13px' }}>🚚 Entrega</span><span style={{ color:'#333', fontSize:'13px', fontWeight:500 }}>{form.tipo_entrega==='entrega'?'Entrega':'Retirada'}</span></div>
                <div style={{ display:'flex', justifyContent:'space-between' }}><span style={{ color:'#666', fontSize:'13px' }}>💳 Pagamento</span><span style={{ color:'#333', fontSize:'13px', fontWeight:500 }}>{form.forma_pagamento.replace('_',' ')}</span></div>
              </div>
            </div>

            <button onClick={finalizarPedido} disabled={loading} style={{ width:'100%', background:corPrimaria, color:corSecundaria, border:'none', borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:700, cursor:'pointer' }}>
              {loading?'Enviando...':'✅ Confirmar pedido'}
            </button>
            <button onClick={enviarWhatsApp} style={{ width:'100%', background:'#25D366', color:'#fff', border:'none', borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:600, cursor:'pointer' }}>
              💬 Pedir pelo WhatsApp
            </button>
            <button onClick={()=>setEtapa(1)} style={{ width:'100%', background:'transparent', border:'1px solid #ddd', borderRadius:'10px', padding:'12px', fontSize:'14px', color:'#666', cursor:'pointer' }}>
              ← Voltar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}