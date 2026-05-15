'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase'

const CORES_PRONTAS = [
  { nome: 'Reino Dourado', primaria: '#c9982a', secundaria: '#0d1b2e', texto: '#ffffff' },
  { nome: 'Verde Natural', primaria: '#22c55e', secundaria: '#052e16', texto: '#ffffff' },
  { nome: 'Azul Royal', primaria: '#3b82f6', secundaria: '#0f172a', texto: '#ffffff' },
  { nome: 'Vermelho', primaria: '#ef4444', secundaria: '#1a0000', texto: '#ffffff' },
  { nome: 'Roxo', primaria: '#8b5cf6', secundaria: '#1a0030', texto: '#ffffff' },
  { nome: 'Rosa', primaria: '#ec4899', secundaria: '#1a0010', texto: '#ffffff' },
  { nome: 'Laranja', primaria: '#f97316', secundaria: '#1a0a00', texto: '#ffffff' },
  { nome: 'Turquesa', primaria: '#06b6d4', secundaria: '#001a1f', texto: '#ffffff' },
  { nome: 'Café', primaria: '#92400e', secundaria: '#1a0a00', texto: '#ffffff' },
  { nome: 'Cinza', primaria: '#6b7280', secundaria: '#111827', texto: '#ffffff' },
  { nome: 'Branco', primaria: '#1a1a1a', secundaria: '#ffffff', texto: '#1a1a1a' },
  { nome: 'Preto Luxo', primaria: '#d4af37', secundaria: '#000000', texto: '#ffffff' },
]

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [uploadando, setUploadando] = useState(false)
  const [msg, setMsg] = useState('')
  const [aba, setAba] = useState('loja')
  const [lojaId, setLojaId] = useState('')

  const [loja, setLoja] = useState({ nome:'', telefone:'', whatsapp:'', endereco:'', cidade:'', estado:'', logo:'' })
  const [config, setConfig] = useState({
    tema:'claro', layout_produtos:'grade3',
    notificacoes_whatsapp:true, notificacoes_painel:true,
    permite_agendamento:false, aceita_retirada:true,
    pedido_minimo:0, mensagem_whatsapp:'',
    taxa_entrega_tipo:'fixa', taxa_entrega_valor:0, taxa_gratis_acima:0,
    cor_primaria:'#c9982a', cor_secundaria:'#0d1b2e', cor_texto:'#ffffff',
  })
  const [integ, setInteg] = useState({
    whatsapp:'', instagram:'', facebook:'', chave_pix:'', qr_code_pix:'', google_maps:'',
    mercadopago_token:'', pagseguro_token:'', infinitypay_token:'',
    mercadopago_ativo:false, pagseguro_ativo:false, infinitypay_ativo:false,
  })
  const [horarios, setHorarios] = useState<any>({
    segunda:{ aberto:true, abertura:'08:00', fechamento:'18:00' },
    terca:  { aberto:true, abertura:'08:00', fechamento:'18:00' },
    quarta: { aberto:true, abertura:'08:00', fechamento:'18:00' },
    quinta: { aberto:true, abertura:'08:00', fechamento:'18:00' },
    sexta:  { aberto:true, abertura:'08:00', fechamento:'18:00' },
    sabado: { aberto:true, abertura:'08:00', fechamento:'14:00' },
    domingo:{ aberto:false,abertura:'08:00', fechamento:'12:00' },
  })

  useEffect(() => { carregarDados() }, [])

  async function carregarDados() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    const { data: usuario } = await supabase.from('usuarios').select('loja_id').eq('id', user.id).single()
    if (!usuario?.loja_id) { setLoading(false); return }
    setLojaId(usuario.loja_id)
    const { data: l } = await supabase.from('lojas').select('*').eq('id', usuario.loja_id).single()
    if (l) setLoja({ nome:l.nome??'', telefone:l.telefone??'', whatsapp:l.whatsapp??'', endereco:l.endereco??'', cidade:l.cidade??'', estado:l.estado??'', logo:l.logo??'' })
    const { data: c } = await supabase.from('configuracoes').select('*').eq('loja_id', usuario.loja_id).single()
    if (c) {
      setConfig({
        tema:c.tema??'claro', layout_produtos:c.layout_produtos??'grade3',
        notificacoes_whatsapp:c.notificacoes_whatsapp??true, notificacoes_painel:c.notificacoes_painel??true,
        permite_agendamento:c.permite_agendamento??false, aceita_retirada:c.aceita_retirada??true,
        pedido_minimo:c.pedido_minimo??0, mensagem_whatsapp:c.mensagem_whatsapp??'',
        taxa_entrega_tipo:c.taxa_entrega?.tipo??'fixa', taxa_entrega_valor:c.taxa_entrega?.valor_fixo??0,
        taxa_gratis_acima:c.taxa_entrega?.gratis_acima??0,
        cor_primaria:c.cor_primaria??'#c9982a', cor_secundaria:c.cor_secundaria??'#0d1b2e', cor_texto:c.cor_texto??'#ffffff',
      })
      if (c.horarios) setHorarios(c.horarios)
    }
    const { data: i } = await supabase.from('integracoes').select('*').eq('loja_id', usuario.loja_id).single()
    if (i) setInteg({
      whatsapp:i.whatsapp??'', instagram:i.instagram??'', facebook:i.facebook??'',
      chave_pix:i.chave_pix??'', qr_code_pix:i.qr_code_pix??'', google_maps:i.google_maps??'',
      mercadopago_token:(i as any).mercadopago_token??'', pagseguro_token:(i as any).pagseguro_token??'',
      infinitypay_token:(i as any).infinitypay_token??'',
      mercadopago_ativo:(i as any).mercadopago_ativo??false, pagseguro_ativo:(i as any).pagseguro_ativo??false,
      infinitypay_ativo:(i as any).infinitypay_ativo??false,
    })
    setLoading(false)
  }

  async function uploadLogo(file: File) {
    if (file.size > 5242880) { alert('Máximo 5MB!'); return }
    setUploadando(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${lojaId}/logo/logo-${Date.now()}.${ext}`
    const { data, error } = await supabase.storage.from('imagens').upload(path, file, { upsert: true })
    if (error) { alert('Erro: ' + error.message); setUploadando(false); return }
    setLoja({...loja, logo: data.path})
    setUploadando(false)
  }

  async function salvar() {
    setSalvando(true); setMsg('')
    const supabase = createClient()
    await supabase.from('lojas').update({ nome:loja.nome, telefone:loja.telefone, whatsapp:loja.whatsapp, endereco:loja.endereco, cidade:loja.cidade, estado:loja.estado, logo:loja.logo }).eq('id', lojaId)
    await supabase.from('configuracoes').update({
      tema:config.tema, layout_produtos:config.layout_produtos,
      notificacoes_whatsapp:config.notificacoes_whatsapp, notificacoes_painel:config.notificacoes_painel,
      permite_agendamento:config.permite_agendamento, aceita_retirada:config.aceita_retirada,
      pedido_minimo:config.pedido_minimo, mensagem_whatsapp:config.mensagem_whatsapp,
      taxa_entrega:{ tipo:config.taxa_entrega_tipo, valor_fixo:config.taxa_entrega_valor, gratis_acima:config.taxa_gratis_acima },
      horarios,
    }).eq('loja_id', lojaId)
    await supabase.from('integracoes').update({
      whatsapp:integ.whatsapp, instagram:integ.instagram, facebook:integ.facebook,
      chave_pix:integ.chave_pix, qr_code_pix:integ.qr_code_pix, google_maps:integ.google_maps,
    }).eq('loja_id', lojaId)
    setMsg('✅ Configurações salvas!')
    setSalvando(false)
  }

  const logoUrl = loja.logo ? (loja.logo.startsWith('http') ? loja.logo : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/imagens/${loja.logo}`) : ''
  const dias = ['segunda','terca','quarta','quinta','sexta','sabado','domingo']
  const diasLabel: Record<string,string> = { segunda:'Segunda',terca:'Terça',quarta:'Quarta',quinta:'Quinta',sexta:'Sexta',sabado:'Sábado',domingo:'Domingo' }
  const inp = { width:'100%', background:'#0d1b2e', border:'1px solid rgba(201,152,42,0.2)', borderRadius:'8px', padding:'10px 12px', color:'#fff', fontSize:'14px', outline:'none', boxSizing:'border-box' as const }
  const lbl = { display:'block', color:'#8ea3be', fontSize:'12px', marginBottom:'6px' }
  const abas = [
    {id:'loja',icon:'🏪',label:'Loja'},{id:'aparencia',icon:'🎨',label:'Aparência'},
    {id:'entrega',icon:'🚚',label:'Entrega'},{id:'horarios',icon:'⏰',label:'Horários'},
    {id:'pagamentos',icon:'💳',label:'Pagamentos'},{id:'integracoes',icon:'🔌',label:'Integrações'},
    {id:'notificacoes',icon:'🔔',label:'Notificações'},
  ]

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0a1625' }}>
      <div style={{ width:'220px', background:'#0d1b2e', borderRight:'1px solid rgba(201,152,42,0.1)', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'16px', borderBottom:'1px solid rgba(201,152,42,0.1)', display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'36px', height:'36px', background:'#c9982a', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>👑</div>
          <div><div style={{ color:'#fff', fontSize:'13px', fontWeight:600 }}>Reino App</div><div style={{ color:'#c9982a', fontSize:'10px' }}>Lojas</div></div>
        </div>
        <nav style={{ flex:1, padding:'8px 0' }}>
          {[
            {icon:'📊',label:'Dashboard',href:'/dashboard'},
            {icon:'📦',label:'Produtos',href:'/dashboard/produtos'},
            {icon:'📋',label:'Pedidos',href:'/dashboard/pedidos'},
            {icon:'👥',label:'Clientes',href:'/dashboard/clientes'},
            {icon:'⚙️',label:'Configurações',href:'/dashboard/configuracoes',ativo:true},
          ].map(item => (
            <a key={item.label} href={item.href} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 16px', color:(item as any).ativo?'#c9982a':'#8ea3be', background:(item as any).ativo?'rgba(201,152,42,0.1)':'transparent', borderLeft:(item as any).ativo?'2px solid #c9982a':'2px solid transparent', fontSize:'13px', textDecoration:'none' }}>
              <span>{item.icon}</span><span>{item.label}</span>
            </a>
          ))}
        </nav>
      </div>

      <div style={{ flex:1, padding:'24px', overflowY:'auto' }}>
        <div style={{ marginBottom:'20px' }}>
          <h1 style={{ color:'#fff', fontSize:'20px', fontWeight:600, margin:'0 0 4px' }}>Configurações</h1>
          <p style={{ color:'#8ea3be', fontSize:'13px', margin:0 }}>Personalize sua loja</p>
        </div>

        {msg && <div style={{ background:'#22c55e20', border:'1px solid #22c55e', borderRadius:'8px', padding:'10px 14px', color:'#22c55e', fontSize:'13px', marginBottom:'16px' }}>{msg}</div>}

        <div style={{ display:'flex', gap:'6px', marginBottom:'20px', flexWrap:'wrap' }}>
          {abas.map(a => (
            <button key={a.id} onClick={()=>setAba(a.id)} style={{ padding:'7px 14px', borderRadius:'20px', border:`1px solid ${aba===a.id?'#c9982a':'rgba(201,152,42,0.2)'}`, background:aba===a.id?'#c9982a':'transparent', color:aba===a.id?'#0d1b2e':'#8ea3be', fontSize:'13px', cursor:'pointer' }}>
              {a.icon} {a.label}
            </button>
          ))}
        </div>

        {loading ? <div style={{ textAlign:'center', color:'#8ea3be', padding:'40px' }}>Carregando...</div> : (
          <div style={{ background:'#132236', border:'1px solid rgba(201,152,42,0.1)', borderRadius:'14px', padding:'20px' }}>

            {/* LOJA */}
            {aba==='loja' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <h3 style={{ color:'#fff', fontSize:'15px', fontWeight:500, margin:'0 0 4px' }}>🏪 Dados da loja</h3>

                {/* Upload de logo */}
                <div>
                  <label style={lbl}>Logo da loja</label>
                  <div style={{ display:'flex', gap:'14px', alignItems:'flex-start' }}>
                    <div style={{ position:'relative', flexShrink:0 }}>
                      {logoUrl ? (
                        <>
                          <img src={logoUrl} style={{ width:'80px', height:'80px', borderRadius:'12px', objectFit:'cover', border:'2px solid rgba(201,152,42,0.3)' }} />
                          <button onClick={()=>setLoja({...loja,logo:''})} style={{ position:'absolute', top:'-6px', right:'-6px', width:'20px', height:'20px', background:'#ef4444', border:'none', borderRadius:'50%', color:'#fff', fontSize:'11px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                        </>
                      ) : (
                        <div style={{ width:'80px', height:'80px', background:'#0d1b2e', borderRadius:'12px', border:'2px dashed rgba(201,152,42,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px' }}>👑</div>
                      )}
                    </div>
                    <div>
                      <input type="file" accept="image/*" id="upload-logo" style={{ display:'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f) }} />
                      <label htmlFor="upload-logo" style={{ display:'inline-block', background:'rgba(201,152,42,0.15)', color:'#c9982a', border:'1px solid rgba(201,152,42,0.3)', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', cursor:'pointer', marginBottom:'6px' }}>
                        {uploadando ? '⏳ Enviando...' : '📷 Escolher foto'}
                      </label>
                      <p style={{ color:'#8ea3be', fontSize:'11px', margin:'0 0 2px' }}>JPEG, PNG ou WebP — máx. 5MB</p>
                      <p style={{ color:'#8ea3be', fontSize:'11px', margin:0 }}>Recomendado: 200×200px</p>
                    </div>
                  </div>
                </div>

                <div><label style={lbl}>Nome da loja</label><input value={loja.nome} onChange={e=>setLoja({...loja,nome:e.target.value})} style={inp} /></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                  <div><label style={lbl}>Telefone</label><input value={loja.telefone} onChange={e=>setLoja({...loja,telefone:e.target.value})} style={inp} /></div>
                  <div><label style={lbl}>WhatsApp</label><input value={loja.whatsapp} onChange={e=>setLoja({...loja,whatsapp:e.target.value})} style={inp} /></div>
                </div>
                <div><label style={lbl}>Endereço</label><input value={loja.endereco} onChange={e=>setLoja({...loja,endereco:e.target.value})} style={inp} /></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 80px', gap:'12px' }}>
                  <div><label style={lbl}>Cidade</label><input value={loja.cidade} onChange={e=>setLoja({...loja,cidade:e.target.value})} style={inp} /></div>
                  <div><label style={lbl}>Estado</label><input value={loja.estado} onChange={e=>setLoja({...loja,estado:e.target.value})} maxLength={2} style={inp} /></div>
                </div>
              </div>
            )}

            {/* APARÊNCIA */}
            {aba==='aparencia' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <h3 style={{ color:'#fff', fontSize:'15px', fontWeight:500, margin:'0 0 4px' }}>🎨 Aparência da loja</h3>
                <div>
                  <label style={lbl}>Tema</label>
                  <div style={{ display:'flex', gap:'8px' }}>
                    {[['claro','☀️ Claro'],['escuro','🌙 Escuro'],['automatico','🔄 Auto']].map(([val,label]) => (
                      <button key={val} onClick={()=>setConfig({...config,tema:val})} style={{ flex:1, padding:'10px', border:`2px solid ${config.tema===val?'#c9982a':'rgba(201,152,42,0.2)'}`, borderRadius:'8px', background:config.tema===val?'rgba(201,152,42,0.15)':'transparent', color:config.tema===val?'#c9982a':'#8ea3be', fontSize:'13px', cursor:'pointer' }}>{label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={lbl}>Layout dos produtos</label>
                  <div style={{ display:'flex', gap:'8px' }}>
                    {[['grade2','⊞ Grade 2'],['grade3','⊟ Grade 3'],['lista','☰ Lista']].map(([val,label]) => (
                      <button key={val} onClick={()=>setConfig({...config,layout_produtos:val})} style={{ flex:1, padding:'10px', border:`2px solid ${config.layout_produtos===val?'#c9982a':'rgba(201,152,42,0.2)'}`, borderRadius:'8px', background:config.layout_produtos===val?'rgba(201,152,42,0.15)':'transparent', color:config.layout_produtos===val?'#c9982a':'#8ea3be', fontSize:'13px', cursor:'pointer' }}>{label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={lbl}>🎨 Temas de cores prontos</label>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'16px' }}>
                    {CORES_PRONTAS.map(cor => (
                      <button key={cor.nome} onClick={()=>setConfig({...config,cor_primaria:cor.primaria,cor_secundaria:cor.secundaria,cor_texto:cor.texto})} style={{ padding:'10px 8px', borderRadius:'10px', cursor:'pointer', border:`2px solid ${config.cor_primaria===cor.primaria?'#fff':'transparent'}`, background:`linear-gradient(135deg, ${cor.secundaria} 0%, ${cor.primaria} 100%)`, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
                        <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:cor.primaria, border:'2px solid rgba(255,255,255,0.3)' }} />
                        <span style={{ color:'#fff', fontSize:'10px', textShadow:'0 1px 2px rgba(0,0,0,0.5)' }}>{cor.nome}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={lbl}>🖌️ Cores personalizadas</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px' }}>
                    {[['cor_primaria','Cor primária'],['cor_secundaria','Cor de fundo'],['cor_texto','Cor do texto']].map(([key,label]) => (
                      <div key={key}>
                        <label style={lbl}>{label}</label>
                        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                          <input type="color" value={(config as any)[key]} onChange={e=>setConfig({...config,[key]:e.target.value})} style={{ width:'44px', height:'36px', borderRadius:'8px', border:'none', cursor:'pointer', padding:'2px' }} />
                          <input value={(config as any)[key]} onChange={e=>setConfig({...config,[key]:e.target.value})} style={{...inp,flex:1}} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:'12px', borderRadius:'12px', overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ background:config.cor_secundaria, padding:'12px 16px', display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ width:'28px', height:'28px', background:config.cor_primaria, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>👑</div>
                      <span style={{ color:config.cor_texto, fontSize:'13px', fontWeight:600 }}>Preview da loja</span>
                    </div>
                    <div style={{ background:config.cor_secundaria, padding:'12px 16px', display:'flex', gap:'8px' }}>
                      <button style={{ background:config.cor_primaria, color:config.cor_secundaria, border:'none', borderRadius:'8px', padding:'8px 16px', fontSize:'13px', fontWeight:600, cursor:'pointer' }}>Botão principal</button>
                      <button style={{ background:'transparent', color:config.cor_primaria, border:`1px solid ${config.cor_primaria}`, borderRadius:'8px', padding:'8px 16px', fontSize:'13px', cursor:'pointer' }}>Botão secundário</button>
                    </div>
                  </div>
                </div>
                <div><label style={lbl}>Mensagem de boas-vindas no WhatsApp</label><textarea value={config.mensagem_whatsapp} onChange={e=>setConfig({...config,mensagem_whatsapp:e.target.value})} rows={3} placeholder="Ex: Olá! Seja bem-vindo! 🎉" style={{...inp,resize:'none'}} /></div>
                <div><label style={lbl}>Pedido mínimo (R$)</label><input type="number" value={config.pedido_minimo} onChange={e=>setConfig({...config,pedido_minimo:Number(e.target.value)})} style={inp} /></div>
              </div>
            )}

            {/* ENTREGA */}
            {aba==='entrega' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <h3 style={{ color:'#fff', fontSize:'15px', fontWeight:500, margin:'0 0 4px' }}>🚚 Entrega</h3>
                <div>
                  <label style={lbl}>Tipo de taxa</label>
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                    {[['fixa','💰 Taxa fixa'],['gratis_acima','🆓 Grátis acima de'],['gratis','✅ Sempre grátis']].map(([val,label]) => (
                      <button key={val} onClick={()=>setConfig({...config,taxa_entrega_tipo:val})} style={{ padding:'10px 14px', border:`2px solid ${config.taxa_entrega_tipo===val?'#c9982a':'rgba(201,152,42,0.2)'}`, borderRadius:'8px', background:config.taxa_entrega_tipo===val?'rgba(201,152,42,0.15)':'transparent', color:config.taxa_entrega_tipo===val?'#c9982a':'#8ea3be', fontSize:'13px', cursor:'pointer' }}>{label}</button>
                    ))}
                  </div>
                </div>
                {config.taxa_entrega_tipo==='fixa' && <div><label style={lbl}>Valor (R$)</label><input type="number" step="0.01" value={config.taxa_entrega_valor} onChange={e=>setConfig({...config,taxa_entrega_valor:Number(e.target.value)})} style={inp} /></div>}
                {config.taxa_entrega_tipo==='gratis_acima' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    <div><label style={lbl}>Taxa (R$)</label><input type="number" step="0.01" value={config.taxa_entrega_valor} onChange={e=>setConfig({...config,taxa_entrega_valor:Number(e.target.value)})} style={inp} /></div>
                    <div><label style={lbl}>Grátis acima de (R$)</label><input type="number" step="0.01" value={config.taxa_gratis_acima} onChange={e=>setConfig({...config,taxa_gratis_acima:Number(e.target.value)})} style={inp} /></div>
                  </div>
                )}
                <div style={{ display:'flex', gap:'16px' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', color:'#8ea3be', fontSize:'13px' }}><input type="checkbox" checked={config.aceita_retirada} onChange={e=>setConfig({...config,aceita_retirada:e.target.checked})} />🏪 Aceita retirada</label>
                  <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', color:'#8ea3be', fontSize:'13px' }}><input type="checkbox" checked={config.permite_agendamento} onChange={e=>setConfig({...config,permite_agendamento:e.target.checked})} />📅 Agendamento</label>
                </div>
              </div>
            )}

            {/* HORÁRIOS */}
            {aba==='horarios' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <h3 style={{ color:'#fff', fontSize:'15px', fontWeight:500, margin:'0 0 4px' }}>⏰ Horários</h3>
                {dias.map(dia => (
                  <div key={dia} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px', background:'#0d1b2e', borderRadius:'10px' }}>
                    <label style={{ display:'flex', alignItems:'center', gap:'6px', minWidth:'100px', cursor:'pointer' }}>
                      <input type="checkbox" checked={horarios[dia]?.aberto} onChange={e=>setHorarios({...horarios,[dia]:{...horarios[dia],aberto:e.target.checked}})} />
                      <span style={{ color:'#fff', fontSize:'13px' }}>{diasLabel[dia]}</span>
                    </label>
                    {horarios[dia]?.aberto ? (
                      <>
                        <input type="time" value={horarios[dia]?.abertura} onChange={e=>setHorarios({...horarios,[dia]:{...horarios[dia],abertura:e.target.value}})} style={{ background:'#132236', border:'1px solid rgba(201,152,42,0.2)', borderRadius:'6px', padding:'6px 10px', color:'#fff', fontSize:'13px', outline:'none' }} />
                        <span style={{ color:'#8ea3be' }}>às</span>
                        <input type="time" value={horarios[dia]?.fechamento} onChange={e=>setHorarios({...horarios,[dia]:{...horarios[dia],fechamento:e.target.value}})} style={{ background:'#132236', border:'1px solid rgba(201,152,42,0.2)', borderRadius:'6px', padding:'6px 10px', color:'#fff', fontSize:'13px', outline:'none' }} />
                      </>
                    ) : <span style={{ color:'#ef4444', fontSize:'13px' }}>Fechado</span>}
                  </div>
                ))}
              </div>
            )}

            {/* PAGAMENTOS */}
            {aba==='pagamentos' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <h3 style={{ color:'#fff', fontSize:'15px', fontWeight:500, margin:'0 0 4px' }}>💳 Gateways de pagamento</h3>
                <p style={{ color:'#8ea3be', fontSize:'13px', margin:'0 0 8px' }}>O dinheiro vai direto para sua conta!</p>
                {[
                  {key:'mercadopago', cor:'#009ee3', icon:'💙', nome:'Mercado Pago', desc:'Pix, cartão, boleto', field:'mercadopago_token', placeholder:'APP_USR-...', hint:'mercadopago.com.br → Suas integrações → Credenciais'},
                  {key:'pagseguro', cor:'#00b140', icon:'💚', nome:'PagSeguro', desc:'Pix, cartão, boleto', field:'pagseguro_token', placeholder:'seu-token-pagseguro', hint:'pagseguro.uol.com.br → Minha conta → Integrações'},
                  {key:'infinitypay', cor:'#6c5ce7', icon:'💜', nome:'InfinityPay', desc:'Maquininha + link', field:'infinitypay_token', placeholder:'sua-api-key', hint:'infinitypay.io → Desenvolvedor → API Keys'},
                ].map(gw => (
                  <div key={gw.key} style={{ background:'#0d1b2e', borderRadius:'12px', padding:'16px', border:'1px solid rgba(201,152,42,0.15)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:(integ as any)[`${gw.key}_ativo`]?'12px':'0' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'36px', height:'36px', background:gw.cor, borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px' }}>{gw.icon}</div>
                        <div><p style={{ color:'#fff', fontSize:'14px', fontWeight:500, margin:0 }}>{gw.nome}</p><p style={{ color:'#8ea3be', fontSize:'11px', margin:0 }}>{gw.desc}</p></div>
                      </div>
                      <button onClick={()=>setInteg({...integ,[`${gw.key}_ativo`]:!(integ as any)[`${gw.key}_ativo`]})} style={{ width:'44px', height:'24px', borderRadius:'12px', background:(integ as any)[`${gw.key}_ativo`]?gw.cor:'#374151', border:'none', cursor:'pointer', position:'relative' }}>
                        <div style={{ position:'absolute', top:'2px', left:(integ as any)[`${gw.key}_ativo`]?'22px':'2px', width:'20px', height:'20px', background:'#fff', borderRadius:'50%', transition:'all 0.2s' }} />
                      </button>
                    </div>
                    {(integ as any)[`${gw.key}_ativo`] && (
                      <div>
                        <label style={lbl}>Token / API Key</label>
                        <input value={(integ as any)[gw.field]} onChange={e=>setInteg({...integ,[gw.field]:e.target.value})} placeholder={gw.placeholder} style={inp} type="password" />
                        <p style={{ color:'#8ea3be', fontSize:'11px', marginTop:'6px' }}>📍 {gw.hint}</p>
                      </div>
                    )}
                  </div>
                ))}
                <div style={{ background:'rgba(201,152,42,0.1)', border:'1px solid rgba(201,152,42,0.3)', borderRadius:'10px', padding:'12px' }}>
                  <p style={{ color:'#c9982a', fontSize:'12px', margin:0 }}>⚠️ Integrações em breve. Já aceita: Pix manual, Dinheiro e Cartão na entrega.</p>
                </div>
              </div>
            )}

            {/* INTEGRAÇÕES */}
            {aba==='integracoes' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <h3 style={{ color:'#fff', fontSize:'15px', fontWeight:500, margin:'0 0 4px' }}>🔌 Redes sociais</h3>
                {[
                  {key:'whatsapp',label:'💬 WhatsApp',placeholder:'71999990000'},
                  {key:'instagram',label:'📸 Instagram',placeholder:'@sujaloja'},
                  {key:'facebook',label:'👤 Facebook',placeholder:'facebook.com/sujaloja'},
                  {key:'chave_pix',label:'💠 Chave Pix',placeholder:'CPF, email ou chave aleatória'},
                  {key:'qr_code_pix',label:'📷 QR Code Pix (URL)',placeholder:'https://...'},
                  {key:'google_maps',label:'🗺️ Google Maps (URL)',placeholder:'https://maps.google.com/...'},
                ].map(f => (
                  <div key={f.key}>
                    <label style={lbl}>{f.label}</label>
                    <input value={(integ as any)[f.key]} onChange={e=>setInteg({...integ,[f.key]:e.target.value})} placeholder={f.placeholder} style={inp} />
                  </div>
                ))}
                {integ.qr_code_pix && <img src={integ.qr_code_pix} style={{ width:'120px', height:'120px', borderRadius:'8px' }} />}
              </div>
            )}

            {/* NOTIFICAÇÕES */}
            {aba==='notificacoes' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                <h3 style={{ color:'#fff', fontSize:'15px', fontWeight:500, margin:'0 0 4px' }}>🔔 Notificações</h3>
                {[
                  {key:'notificacoes_whatsapp',icon:'💬',titulo:'WhatsApp',desc:'Receber novos pedidos no WhatsApp'},
                  {key:'notificacoes_painel',icon:'🔔',titulo:'Painel',desc:'Alertas de novos pedidos no dashboard'},
                ].map(n => (
                  <div key={n.key} style={{ background:'#0d1b2e', borderRadius:'10px', padding:'14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <p style={{ color:'#fff', fontSize:'13px', fontWeight:500, margin:'0 0 2px' }}>{n.icon} {n.titulo}</p>
                      <p style={{ color:'#8ea3be', fontSize:'12px', margin:0 }}>{n.desc}</p>
                    </div>
                    <button onClick={()=>setConfig({...config,[n.key]:!(config as any)[n.key]})} style={{ width:'44px', height:'24px', borderRadius:'12px', background:(config as any)[n.key]?'#c9982a':'#374151', border:'none', cursor:'pointer', position:'relative' }}>
                      <div style={{ position:'absolute', top:'2px', left:(config as any)[n.key]?'22px':'2px', width:'20px', height:'20px', background:'#fff', borderRadius:'50%', transition:'all 0.2s' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop:'20px', paddingTop:'16px', borderTop:'1px solid rgba(201,152,42,0.1)' }}>
              <button onClick={salvar} disabled={salvando} style={{ background:'#c9982a', color:'#0d1b2e', border:'none', borderRadius:'8px', padding:'12px 24px', fontSize:'14px', fontWeight:600, cursor:'pointer' }}>
                {salvando ? 'Salvando...' : '💾 Salvar configurações'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}