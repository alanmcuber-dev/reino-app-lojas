'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase'

export default function CadastroPage() {
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState<any>(null)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState({
    nome_loja:  '',
    slug:       '',
    nome_dono:  '',
    telefone:   '',
    senha:      '',
    confirmar:  '',
    cidade:     '',
    estado:     '',
  })

  function gerarSlug(nome: string) {
    return nome.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (form.senha !== form.confirmar) { setErro('As senhas não coincidem!'); return }
    if (form.senha.length < 6) { setErro('Senha deve ter ao menos 6 caracteres'); return }
    if (!form.slug) { setErro('Slug obrigatório'); return }

    setLoading(true)

    const supabase = createClient()

    // Verifica se slug já existe
    const { data: lojaExiste } = await supabase
      .from('lojas').select('id').eq('slug', form.slug).single()

    if (lojaExiste) { setErro('Esse link já está em uso! Tente outro.'); setLoading(false); return }

    // Cria loja
    const { data: loja, error: erroLoja } = await supabase
      .from('lojas').insert({
        nome:      form.nome_loja,
        slug:      form.slug,
        telefone:  form.telefone.replace(/\D/g, ''),
        whatsapp:  form.telefone.replace(/\D/g, ''),
        cidade:    form.cidade,
        estado:    form.estado,
        status:    'ativa',
      }).select().single()

    if (erroLoja) { setErro('Erro ao criar loja: ' + erroLoja.message); setLoading(false); return }

    // Cria usuário no Auth
    const email = form.telefone.replace(/\D/g, '') + '@reino.app'
    const { data: authData, error: erroAuth } = await supabase.auth.signUp({
      email,
      password: form.senha,
      options: { data: { nome: form.nome_dono, loja_id: loja.id } }
    })

    if (erroAuth || !authData.user) {
      // Desfaz a loja criada
      await supabase.from('lojas').delete().eq('id', loja.id)
      setErro('Erro ao criar conta: ' + erroAuth?.message)
      setLoading(false)
      return
    }

    // Cria usuário na tabela
    await supabase.from('usuarios').insert({
      id:       authData.user.id,
      loja_id:  loja.id,
      nome:     form.nome_dono,
      telefone: form.telefone.replace(/\D/g, ''),
      tipo:     'dono',
    })

    setSucesso({ loja, email })
    setLoading(false)
  }

  // Tela de sucesso
  if (sucesso) return (
    <div style={{ minHeight: '100vh', background: '#0d1b2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Loja criada com sucesso!</h2>
        <p style={{ color: '#8ea3be', fontSize: '14px', marginBottom: '24px' }}>Sua loja está pronta para receber pedidos!</p>

        <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '14px', padding: '20px', marginBottom: '16px', textAlign: 'left' }}>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ color: '#8ea3be', fontSize: '12px', margin: '0 0 2px' }}>🏪 Nome da loja</p>
            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 500, margin: 0 }}>{sucesso.loja.nome}</p>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <p style={{ color: '#8ea3be', fontSize: '12px', margin: '0 0 2px' }}>🔗 Link da loja</p>
            <p style={{ color: '#c9982a', fontSize: '14px', fontWeight: 500, margin: 0 }}>localhost:3000/{sucesso.loja.slug}</p>
          </div>
          <div>
            <p style={{ color: '#8ea3be', fontSize: '12px', margin: '0 0 2px' }}>📧 Login</p>
            <p style={{ color: '#fff', fontSize: '14px', margin: 0 }}>{sucesso.email}</p>
          </div>
        </div>

        <a href="/login" style={{ display: 'block', background: '#c9982a', color: '#0d1b2e', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', textAlign: 'center', marginBottom: '8px' }}>
          Acessar painel →
        </a>
        <a href={`/${sucesso.loja.slug}`} style={{ display: 'block', background: 'transparent', border: '1px solid rgba(201,152,42,0.3)', color: '#c9982a', borderRadius: '10px', padding: '12px', fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}>
          Ver minha loja 🛍️
        </a>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0d1b2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '64px', height: '64px', background: '#c9982a', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 12px' }}>👑</div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>Criar sua loja</h1>
          <p style={{ color: '#8ea3be', fontSize: '13px', margin: 0 }}>Grátis, rápido e sem cartão de crédito</p>
        </div>

        <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '16px', padding: '24px' }}>

          {erro && (
            <div style={{ background: '#ef444420', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>
              {erro}
            </div>
          )}

          <form onSubmit={handleCadastro}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <div>
                <label style={{ display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Nome da loja *</label>
                <input
                  value={form.nome_loja}
                  onChange={e => {
                    const nome = e.target.value
                    setForm({ ...form, nome_loja: nome, slug: gerarSlug(nome) })
                  }}
                  placeholder="Ex: Pizzaria do João"
                  required
                  style={{ width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Link da loja *</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', overflow: 'hidden' }}>
                  <span style={{ color: '#8ea3be', fontSize: '13px', padding: '10px 8px 10px 12px', whiteSpace: 'nowrap' }}>seusite.com/</span>
                  <input
                    value={form.slug}
                    onChange={e => setForm({ ...form, slug: gerarSlug(e.target.value) })}
                    placeholder="pizzariadojoao"
                    required
                    style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px 12px 10px 0', color: '#c9982a', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Seu nome *</label>
                <input
                  value={form.nome_dono}
                  onChange={e => setForm({ ...form, nome_dono: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                  style={{ width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Telefone / WhatsApp *</label>
                <input
                  value={form.telefone}
                  onChange={e => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(71) 99999-9999"
                  type="tel"
                  required
                  style={{ width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Cidade</label>
                  <input
                    value={form.cidade}
                    onChange={e => setForm({ ...form, cidade: e.target.value })}
                    placeholder="Salvador"
                    style={{ width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Estado</label>
                  <input
                    value={form.estado}
                    onChange={e => setForm({ ...form, estado: e.target.value })}
                    placeholder="BA"
                    maxLength={2}
                    style={{ width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Senha *</label>
                <input
                  value={form.senha}
                  onChange={e => setForm({ ...form, senha: e.target.value })}
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  style={{ width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Confirmar senha *</label>
                <input
                  value={form.confirmar}
                  onChange={e => setForm({ ...form, confirmar: e.target.value })}
                  type="password"
                  placeholder="Repita a senha"
                  required
                  style={{ width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', background: '#c9982a', color: '#0d1b2e', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }}
              >
                {loading ? 'Criando sua loja...' : '🚀 Criar minha loja grátis'}
              </button>
            </div>
          </form>

          <p style={{ textAlign: 'center', color: '#8ea3be', fontSize: '12px', marginTop: '16px' }}>
            Já tem conta?{' '}
            <a href="/login" style={{ color: '#c9982a', textDecoration: 'none' }}>Fazer login</a>
          </p>
        </div>
      </div>
    </div>
  )
}