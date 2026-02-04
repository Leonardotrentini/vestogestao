import { NextResponse } from 'next/server'
import { sendEmail, formatNewLeadEmail } from '@/lib/notifications/email'

/**
 * Rota de teste para enviar email de novo lead
 */
export async function GET() {
  try {
    console.log('🧪 Testando envio de email para novo lead...')
    
    // Criar um lead de teste
    const testLead = {
      'full_name': 'João Silva Teste',
      'phone_number': '11987654321',
      '@_do_instagram_da_sua_empresa': '@joaosilva_teste',
      'campaign_name': 'Campanha Teste - ' + new Date().toLocaleString('pt-BR'),
      'ad_name': 'Anúncio Teste',
      'adset_name': 'Público Teste',
      'quanto_você_vende_em_média_mensalmente': 'R$ 10.000,00'
    }

    // Verificar se email está configurado
    const emailRecipients = process.env.NOTIFICATION_EMAIL?.split(',').map(e => e.trim()).filter(Boolean)
    
    if (!emailRecipients || emailRecipients.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: '❌ NOTIFICATION_EMAIL não configurado',
        debug: {
          NOTIFICATION_EMAIL: process.env.NOTIFICATION_EMAIL || 'não configurado',
          RESEND_API_KEY: process.env.RESEND_API_KEY ? 'configurado' : 'não configurado'
        }
      }, { status: 500 })
    }

    // Formatar e enviar email
    const { subject, html } = formatNewLeadEmail(testLead)
    const emailSent = await sendEmail({
      to: emailRecipients,
      subject,
      html
    })

    if (emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: `✅ Email de teste enviado com sucesso!`,
        lead: testLead,
        recipients: emailRecipients
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '❌ Falha ao enviar email',
        debug: {
          RESEND_API_KEY: process.env.RESEND_API_KEY ? 'configurado' : 'não configurado',
          EMAIL_FROM: process.env.EMAIL_FROM || 'não configurado'
        }
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ Erro no teste de novo lead:', error)
    return NextResponse.json({ 
      success: false, 
      message: '❌ Erro ao enviar email de teste',
      error: error.message || 'Erro desconhecido',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
