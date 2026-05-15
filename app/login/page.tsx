'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

const MASTER_EMAIL = '71999642635@reino.app'

export default function LoginPage() {
  const router = useRouter()
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin(tipo: 'lojista' | 'master') {
    setLoading(true)
    setErro('')
    const supabase = createClient()
    const nums = telefone.replace(/\D/g, '')
    const email = `${nums}@reino.app`

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('Telefone ou senha inválidos')
      setLoading(false)
      return
    }

    if (tipo === 'master') {
      if (email !== MASTER_EMAIL) {
        setErro('Acesso master não autorizado')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }
      router.push('/dashboard/master')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1b2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: '#c9982a', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px' }}>👑</div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 600 }}>Reino App</h1>
          <p style={{ color: '#c9982a', fontSize: '13px', marginTop: '4px' }}>Acesse sua conta</p>
        </div>

        <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 500, marginBottom: '20px' }}>Entrar na sua conta</h2>

          {erro && (
            <div style={{ background: '#ef444420', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 12px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>
              {erro}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Telefone</label>
            <input type="tel" placeholder="(11) 99999-9999" value={telefone} onChange={e => setTelefone(e.target.value)}
              style={{ width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Senha</label>
            <input type="password" placeholder="••••••••" value={senha} onChange={e => setSenha(e.target.value)}
              style={{ width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>

          <button onClick={() => handleLogin('lojista')} disabled={loading}
            style={{ width: '100%', background: '#c9982a', color: '#0d1b2e', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '10px' }}>
            {loading ? 'Entrando...' : '🏪 Entrar como Lojista'}
          </button>

          <button onClick={() => handleLogin('master')} disabled={loading}
            style={{ width: '100%', background: 'transparent', color: '#c9982a', border: '1px solid rgba(201,152,42,0.3)', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>
            {loading ? 'Entrando...' : '👑 Entrar como Master'}
          </button>

          <p style={{ textAlign: 'center', color: '#8ea3be', fontSize: '12px' }}>
            Esqueceu a senha?{' '}
            <a href="https://wa.me/5571999642635" target="_blank" style={{ color: '#c9982a', cursor: 'pointer', textDecoration: 'none' }}>Falar no WhatsApp</a>
          </p>
        </div>
      </div>
    </div>
  )
}