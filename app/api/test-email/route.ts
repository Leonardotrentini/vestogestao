import { NextResponse } from 'next/server'
import { sendEmail, formatNewLeadEmail } from '@/lib/notifications/email'

export async function GET() {
  try {
    console.log('🧪 Testando envio de email...')
    
    // Verificar variáveis de ambiente
    const hasResendKey = !!process.env.RESEND_API_KEY
    const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
    const emailFrom = process.env.EMAIL_FROM
    const notificationEmail = process.env.NOTIFICATION_EMAIL || 'vestocooficial@gmail.com'
    
    console.log('📋 Configurações:', {
      hasResendKey,
      hasSmtp,
      emailFrom,
      notificationEmail,
      resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) || 'não configurado'
    })

    if (!hasResendKey && !hasSmtp) {
      return NextResponse.json({ 
        success: false, 
        message: '❌ Nenhum serviço de email configurado',
        error: 'Configure RESEND_API_KEY ou SMTP no .env.local',
        debug: {
          hasResendKey,
          hasSmtp,
          envVars: {
            RESEND_API_KEY: process.env.RESEND_API_KEY ? 'configurado' : 'não configurado',
            SMTP_HOST: process.env.SMTP_HOST || 'não configurado'
          }
        }
      }, { status: 500 })
    }

    // Criar um lead de teste
    const testLead = {
      'full_name': 'João Silva (TESTE)',
      'phone_number': '(11) 98765-4321',
      '@_do_instagram_da_sua_empresa': '@joaosilva',
      'campaign_name': 'Campanha de Teste',
      'ad_name': 'Anúncio de Teste',
      'adset_name': 'Público de Teste',
      'quanto_você_vende_em_média_mensalmente': 'R$ 50.000'
    }

    // Formatar email
    const { subject, html } = formatNewLeadEmail(testLead)

    console.log('📧 Tentando enviar email para:', notificationEmail)
    console.log('📧 De:', emailFrom || 'não configurado')

    // Enviar email
    const emailSent = await sendEmail({
      to: notificationEmail,
      subject,
      html,
      from: emailFrom
    })

    if (emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: '✅ Email de teste enviado com sucesso!',
        lead: testLead,
        config: {
          from: emailFrom,
          to: notificationEmail,
          service: hasResendKey ? 'Resend' : 'SMTP'
        }
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: '❌ Erro ao enviar email. Verifique as configurações.',
        error: 'Email não foi enviado',
        debug: {
          hasResendKey,
          hasSmtp,
          emailFrom,
          notificationEmail
        }
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error('❌ Erro no teste de email:', error)
    return NextResponse.json({ 
      success: false, 
      message: '❌ Erro ao enviar email de teste',
      error: error.message || 'Erro desconhecido',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
