'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const supabase = createClient()
    const nums = telefone.replace(/\D/g, '')
    const email = `${nums}@reino.app`

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('Telefone ou senha inválidos')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1b2e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', background: '#c9982a',
            borderRadius: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px'
          }}>👑</div>
          <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: 600 }}>Reino App</h1>
          <p style={{ color: '#c9982a', fontSize: '13px', marginTop: '4px' }}>Painel do Lojista</p>
        </div>

        {/* Card */}
        <div style={{
          background: '#132236',
          border: '1px solid rgba(201,152,42,0.2)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h2 style={{ color: '#fff', fontSize: '16px', fontWeight: 500, marginBottom: '20px' }}>
            Entrar na sua conta
          </h2>

          {erro && (
            <div style={{ background: '#ef444420', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 12px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>
              {erro}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Telefone</label>
              <input
                type="tel"
                placeholder="(11) 99999-9999"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                required
                style={{ width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#8ea3be', fontSize: '12px', marginBottom: '6px' }}>Senha</label>
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                style={{ width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', background: '#c9982a', color: '#0d1b2e', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: '#8ea3be', fontSize: '12px', marginTop: '16px' }}>
            Esqueceu a senha?{' '}
            <span style={{ color: '#c9982a', cursor: 'pointer' }}>Falar no WhatsApp</span>
          </p>
        </div>
      </div>
    </div>
  )
}