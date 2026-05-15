'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '../../../lib/supabase'

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lojaId, setLojaId] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [previews, setPreviews] = useState<string[]>([])
  const [arquivos, setArquivos] = useState<File[]>([])
  const [variacoes, setVariacoes] = useState<{nome:string,preco:string,estoque:string}[]>([])
  const [adicionais, setAdicionais] = useState<{nome:string,preco:string}[]>([])
  const [form, setForm] = useState({
    nome: '', descricao: '', preco: '', preco_promocional: '',
    estoque: '', video_url: '', destaque: false, novo: false
  })

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    const { data: usuario } = await supabase.from('usuarios').select('loja_id').eq('id', user.id).single()
    if (!usuario?.loja_id) { setLoading(false); return }
    setLojaId(usuario.loja_id)
    const { data } = await supabase.from('produtos').select('*').eq('loja_id', usuario.loja_id).is('deletado_em', null).order('created_at', { ascending: false })
    setProdutos(data ?? [])
    setLoading(false)
  }

  function handleFotos(files: FileList | null) {
    if (!files) return
    const arr = Array.from(files)
    setArquivos(prev => [...prev, ...arr])
    arr.forEach(f => {
      const reader = new FileReader()
      reader.onload = e => setPreviews(prev => [...prev, e.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  async function salvarProduto() {
    if (!form.nome || !form.preco) { setMsg('Nome e preço são obrigatórios!'); return }
    setSalvando(true); setMsg('')
    const supabase = createClient()

    // Upload das imagens
    const imagens: string[] = []
    for (const file of arquivos) {
      const ext = file.name.split('.').pop()
      const path = `${lojaId}/produtos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage.from('imagens').upload(path, file)
      if (data) imagens.push(data.path)
    }

    const slug = form.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now()

    const { data: produto, error } = await supabase.from('produtos').insert({
      loja_id: lojaId, nome: form.nome, descricao: form.descricao || null,
      preco: Number(form.preco), preco_promocional: form.preco_promocional ? Number(form.preco_promocional) : null,
      estoque: Number(form.estoque) || 0, imagens, video_url: form.video_url || null,
      destaque: form.destaque, novo: form.novo, slug, ativo: true,
    }).select().single()

    if (error) { setMsg('Erro: ' + error.message); setSalvando(false); return }

    // Salva variações
    for (let i = 0; i < variacoes.length; i++) {
      const v = variacoes[i]
      if (v.nome) await supabase.from('variacoes').insert({ produto_id: produto.id, nome: v.nome, preco: Number(v.preco) || Number(form.preco), estoque: Number(v.estoque) || 0, ordem: i })
    }

    // Salva adicionais
    for (let i = 0; i < adicionais.length; i++) {
      const a = adicionais[i]
      if (a.nome) await supabase.from('adicionais').insert({ produto_id: produto.id, nome: a.nome, preco: Number(a.preco) || 0, ordem: i })
    }

    setMsg('✅ Produto salvo com sucesso!')
    setForm({ nome: '', descricao: '', preco: '', preco_promocional: '', estoque: '', video_url: '', destaque: false, novo: false })
    setArquivos([]); setPreviews([]); setVariacoes([]); setAdicionais([])
    setMostrarForm(false); carregarDados(); setSalvando(false)
  }

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const input = { width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }
  const label = { display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }

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
            { icon: '📦', label: 'Produtos', href: '/dashboard/produtos', ativo: true },
            { icon: '📋', label: 'Pedidos', href: '/dashboard/pedidos' },
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, margin: 0 }}>Produtos</h1>
            <p style={{ color: '#8ea3be', fontSize: '13px', margin: '4px 0 0' }}>{produtos.length} produto{produtos.length !== 1 ? 's' : ''} cadastrado{produtos.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setMostrarForm(!mostrarForm)} style={{ background: '#c9982a', color: '#0d1b2e', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            {mostrarForm ? '✕ Fechar' : '+ Novo Produto'}
          </button>
        </div>

        {msg && <div style={{ background: msg.includes('Erro') ? '#ef444420' : '#22c55e20', border: `1px solid ${msg.includes('Erro') ? '#ef4444' : '#22c55e'}`, borderRadius: '8px', padding: '10px 14px', color: msg.includes('Erro') ? '#ef4444' : '#22c55e', fontSize: '13px', marginBottom: '16px' }}>{msg}</div>}

        {/* Formulário */}
        {mostrarForm && (
          <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 500, margin: '0 0 16px' }}>Novo produto</h3>

            {/* Informações básicas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={label}>Nome *</label>
                <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Camiseta Premium" style={input} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={label}>Descrição</label>
                <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} rows={2} placeholder="Descreva o produto..." style={{...input, resize: 'none'}} />
              </div>
              <div>
                <label style={label}>Preço *</label>
                <input type="number" step="0.01" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} placeholder="0,00" style={input} />
              </div>
              <div>
                <label style={label}>Preço promocional</label>
                <input type="number" step="0.01" value={form.preco_promocional} onChange={e => setForm({...form, preco_promocional: e.target.value})} placeholder="0,00" style={input} />
              </div>
              <div>
                <label style={label}>Estoque</label>
                <input type="number" value={form.estoque} onChange={e => setForm({...form, estoque: e.target.value})} placeholder="0" style={input} />
              </div>
              <div>
                <label style={label}>Vídeo (YouTube)</label>
                <input value={form.video_url} onChange={e => setForm({...form, video_url: e.target.value})} placeholder="https://youtube.com/..." style={input} />
              </div>
            </div>

            {/* Selos */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#8ea3be', fontSize: '13px' }}>
                <input type="checkbox" checked={form.destaque} onChange={e => setForm({...form, destaque: e.target.checked})} /> ⭐ Destaque
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#8ea3be', fontSize: '13px' }}>
                <input type="checkbox" checked={form.novo} onChange={e => setForm({...form, novo: e.target.checked})} /> 🆕 Novo
              </label>
            </div>

            {/* Fotos */}
            <div style={{ marginBottom: '16px' }}>
              <label style={label}>Fotos do produto</label>
              <div onClick={() => fileRef.current?.click()} style={{ border: '2px dashed rgba(201,152,42,0.3)', borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer', color: '#8ea3be', fontSize: '13px', marginBottom: '10px' }}>
                📷 Clique para adicionar fotos
                <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => handleFotos(e.target.files)} />
              </div>
              {previews.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {previews.map((p, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={p} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                      <button onClick={() => { setPreviews(prev => prev.filter((_, idx) => idx !== i)); setArquivos(prev => prev.filter((_, idx) => idx !== i)) }} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', background: '#ef4444', border: 'none', borderRadius: '50%', color: '#fff', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variações */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={label}>Variações (ex: P, M, G)</label>
                <button onClick={() => setVariacoes(prev => [...prev, {nome:'',preco:'',estoque:''}])} style={{ background: 'rgba(201,152,42,0.15)', color: '#c9982a', border: '1px solid rgba(201,152,42,0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>+ Adicionar</button>
              </div>
              {variacoes.map((v, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 2 }}><input value={v.nome} onChange={e => setVariacoes(prev => prev.map((x,idx) => idx===i ? {...x,nome:e.target.value} : x))} placeholder="Nome (ex: Grande)" style={input} /></div>
                  <div style={{ flex: 1 }}><input type="number" value={v.preco} onChange={e => setVariacoes(prev => prev.map((x,idx) => idx===i ? {...x,preco:e.target.value} : x))} placeholder="Preço" style={input} /></div>
                  <div style={{ flex: 1 }}><input type="number" value={v.estoque} onChange={e => setVariacoes(prev => prev.map((x,idx) => idx===i ? {...x,estoque:e.target.value} : x))} placeholder="Estoque" style={input} /></div>
                  <button onClick={() => setVariacoes(prev => prev.filter((_,idx) => idx!==i))} style={{ background: '#ef444420', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '10px', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>

            {/* Adicionais */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={label}>Adicionais (ex: Bacon, Queijo)</label>
                <button onClick={() => adicionais.length < 10 && setAdicionais(prev => [...prev, {nome:'',preco:''}])} style={{ background: 'rgba(201,152,42,0.15)', color: '#c9982a', border: '1px solid rgba(201,152,42,0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>+ Adicionar</button>
              </div>
              {adicionais.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 2 }}><input value={a.nome} onChange={e => setAdicionais(prev => prev.map((x,idx) => idx===i ? {...x,nome:e.target.value} : x))} placeholder="Nome (ex: Bacon)" style={input} /></div>
                  <div style={{ flex: 1 }}><input type="number" value={a.preco} onChange={e => setAdicionais(prev => prev.map((x,idx) => idx===i ? {...x,preco:e.target.value} : x))} placeholder="+ Preço" style={input} /></div>
                  <button onClick={() => setAdicionais(prev => prev.filter((_,idx) => idx!==i))} style={{ background: '#ef444420', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '10px', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setMostrarForm(false)} style={{ flex: 1, background: 'transparent', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px', color: '#8ea3be', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={salvarProduto} disabled={salvando} style={{ flex: 2, background: '#c9982a', color: '#0d1b2e', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                {salvando ? 'Salvando...' : '💾 Salvar produto'}
              </button>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#8ea3be', padding: '40px' }}>Carregando...</div>
        ) : produtos.length === 0 ? (
          <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.1)', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
            <p style={{ color: '#fff', fontSize: '15px', fontWeight: 500 }}>Nenhum produto ainda</p>
            <p style={{ color: '#8ea3be', fontSize: '13px' }}>Clique em "Novo Produto" para começar!</p>
          </div>
        ) : (
          <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.1)', borderRadius: '14px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(201,152,42,0.1)' }}>
                  {['Produto','Preço','Estoque','Status','Ações'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#8ea3be', fontSize: '12px', fontWeight: 400 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(201,152,42,0.05)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {p.imagens?.[0] ? (
                          <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/imagens/${p.imagens[0]}`} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', background: '#0d1b2e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📦</div>
                        )}
                        <div>
                          <div style={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>{p.nome}</div>
                          <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                            {p.destaque && <span style={{ background: '#c9982a20', color: '#c9982a', fontSize: '10px', padding: '1px 5px', borderRadius: '4px' }}>⭐ Destaque</span>}
                            {p.novo && <span style={{ background: '#3b82f620', color: '#60a5fa', fontSize: '10px', padding: '1px 5px', borderRadius: '4px' }}>🆕 Novo</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: '#c9982a', fontSize: '13px', fontWeight: 500 }}>{fmt(Number(p.preco))}</div>
                      {p.preco_promocional && <div style={{ color: '#8ea3be', fontSize: '11px', textDecoration: 'line-through' }}>{fmt(Number(p.preco_promocional))}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: p.estoque === 0 ? '#ef444420' : p.estoque <= 3 ? '#f59e0b20' : '#22c55e20', color: p.estoque === 0 ? '#ef4444' : p.estoque <= 3 ? '#f59e0b' : '#22c55e', padding: '2px 8px', borderRadius: '20px', fontSize: '12px' }}>
                        {p.estoque} un.
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: p.ativo ? '#22c55e20' : '#ef444420', color: p.ativo ? '#22c55e' : '#ef4444', padding: '2px 8px', borderRadius: '20px', fontSize: '12px' }}>
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={async () => { if (!confirm(`Deletar "${p.nome}"?`)) return; const s = createClient(); await s.from('produtos').update({ deletado_em: new Date().toISOString() }).eq('id', p.id); carregarDados() }} style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440', borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>
                        🗑️
                      </button>
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