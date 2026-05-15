'use client'

import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase'

export default function MasterPage() {
  const [lojas, setLojas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNova, setShowNova] = useState(false)
  const [novaLoja, setNovaLoja] = useState({ nome: '', telefone: '', cidade: '', estado: '' })
  const [criando, setCriando] = useState(false)
  const [sucesso, setSucesso] = useState('')

  useEffect(() => { carregarLojas() }, [])

  async function carregarLojas() {
    const supabase = createClient()
    const { data } = await supabase.from('lojas').select('*').order('created_at', { ascending: false })
    if (data) setLojas(data)
    setLoading(false)
  }

  async function criarLoja() {
    if (!novaLoja.nome) return
    setCriando(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('lojas').insert([{ nome: novaLoja.nome, telefone: novaLoja.telefone, cidade: novaLoja.cidade, estado: novaLoja.estado, ativo: true }]).select().single()
    if (!error && data) {
      setSucesso(`Loja criada! ID: ${data.id}`)
      setNovaLoja({ nome: '', telefone: '', cidade: '', estado: '' })
      setShowNova(false)
      carregarLojas()
    }
    setCriando(false)
  }

  function compartilhar(loja: any) {
    const texto = `🏪 *${loja.nome}*\n\n🔗 Link da loja: https://aqua-snake-101151.hostingersite.com/${loja.slug ?? loja.id}\n\n📊 Painel: https://aqua-snake-101151.hostingersite.com/dashboard\n\n✉️ Entre em contato para receber seu login!`
    navigator.clipboard.writeText(texto)
    alert('Link copiado! Cole no WhatsApp.')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a1625', padding: '20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', background: '#c9982a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>👑</div>
              <div>
                <div style={{ color: '#fff', fontSize: '20px', fontWeight: 700 }}>Reino App</div>
                <div style={{ color: '#c9982a', fontSize: '11px' }}>Painel Master</div>
              </div>
            </div>
          </div>
          <button onClick={() => setShowNova(true)}
            style={{ background: '#c9982a', color: '#0d1b2e', border: 'none', borderRadius: '8px', padding: '10px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            + Nova Loja
          </button>
        </div>

        {sucesso && (
          <div style={{ background: '#22c55e20', border: '1px solid #22c55e', borderRadius: '8px', padding: '12px', color: '#22c55e', marginBottom: '16px', fontSize: '13px' }}>
            ✅ {sucesso}
          </div>
        )}

        {showNova && (
          <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.3)', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '15px' }}>Nova Loja</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'Nome da loja *', key: 'nome', placeholder: 'Ex: Pizzaria da Bia' },
                { label: 'Telefone', key: 'telefone', placeholder: '71999999999' },
                { label: 'Cidade', key: 'cidade', placeholder: 'Salvador' },
                { label: 'Estado', key: 'estado', placeholder: 'BA' },
              ].map(f => (
                <div key={f.key}>
                  <div style={{ color: '#8ea3be', fontSize: '11px', marginBottom: '4px' }}>{f.label}</div>
                  <input value={(novaLoja as any)[f.key]} onChange={e => setNovaLoja(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ width: '100%', background: '#0d1b2e', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '6px', padding: '8px 10px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={criarLoja} disabled={criando}
                style={{ background: '#c9982a', color: '#0d1b2e', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                {criando ? 'Criando...' : 'Criar Loja'}
              </button>
              <button onClick={() => setShowNova(false)}
                style={{ background: 'transparent', color: '#8ea3be', border: '1px solid rgba(201,152,42,0.2)', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div style={{ background: '#132236', border: '1px solid rgba(201,152,42,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(201,152,42,0.1)' }}>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Todas as lojas ({lojas.length})</div>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8ea3be' }}>Carregando...</div>
          ) : lojas.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#8ea3be' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏪</div>
              <p>Nenhuma loja cadastrada ainda.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Loja', 'Cidade', 'Telefone', 'Status', 'Ações'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: '#8ea3be', fontSize: '11px', fontWeight: 400, borderBottom: '1px solid rgba(201,152,42,0.1)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lojas.map(loja => (
                  <tr key={loja.id} style={{ borderBottom: '1px solid rgba(201,152,42,0.05)' }}>
                    <td style={{ padding: '12px 16px', color: '#fff', fontSize: '13px', fontWeight: 500 }}>{loja.nome}</td>
                    <td style={{ padding: '12px 16px', color: '#8ea3be', fontSize: '13px' }}>{loja.cidade ?? '-'} {loja.estado ?? ''}</td>
                    <td style={{ padding: '12px 16px', color: '#8ea3be', fontSize: '13px' }}>{loja.telefone ?? '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: loja.ativo ? '#22c55e20' : '#ef444420', color: loja.ativo ? '#22c55e' : '#ef4444', padding: '2px 8px', borderRadius: '20px', fontSize: '11px' }}>
                        {loja.ativo ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => compartilhar(loja)}
                        style={{ background: 'rgba(201,152,42,0.1)', color: '#c9982a', border: '1px solid rgba(201,152,42,0.3)', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}>
                        📤 Compartilhar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}