/**
 * Serviço de envio de emails
 * Suporta Resend (recomendado) ou SMTP direto
 */

interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { RESEND_API_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env

    // Se tiver Resend API Key, usar Resend (recomendado)
    if (RESEND_API_KEY) {
      return await sendEmailViaResend(options)
    }
    
    // Se tiver SMTP configurado, usar SMTP direto
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      return await sendEmailViaSMTP(options)
    }

    console.warn('⚠️ Nenhum serviço de email configurado. Configure RESEND_API_KEY ou SMTP.')
    return false
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error)
    return false
  }
}

async function sendEmailViaResend(options: EmailOptions): Promise<boolean> {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Suporta múltiplos destinatários em um único envio
    const recipients = Array.isArray(options.to) ? options.to : [options.to]
    
    // Enviar um único email para todos os destinatários
    await resend.emails.send({
      from: options.from || process.env.EMAIL_FROM || 'noreply@vestogestao.com',
      to: recipients, // Resend aceita array de destinatários
      subject: options.subject,
      html: options.html,
    })

    console.log(`✅ Email enviado para ${recipients.length} destinatário(s): ${recipients.join(', ')}`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar email via Resend:', error)
    return false
  }
}

async function sendEmailViaSMTP(options: EmailOptions): Promise<boolean> {
  try {
    const nodemailer = await import('nodemailer')
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    const recipients = Array.isArray(options.to) ? options.to : [options.to]
    
    for (const recipient of recipients) {
      await transporter.sendMail({
        from: options.from || process.env.EMAIL_FROM || 'noreply@vestogestao.com',
        to: recipient,
        subject: options.subject,
        html: options.html,
      })
    }

    console.log(`✅ Email enviado via SMTP para: ${recipients.join(', ')}`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar email via SMTP:', error)
    return false
  }
}

export function formatNewLeadEmail(lead: Record<string, any>): { subject: string; html: string } {
  const fullName = lead['full_name'] || lead['Full Name'] || lead['nome'] || 'Lead sem nome'
  const phone = lead['phone_number'] || lead['Phone Number'] || lead['telefone'] || 'Não informado'
  const instagram = Object.keys(lead).find(key => key.toLowerCase().includes('instagram'))
    ? lead[Object.keys(lead).find(key => key.toLowerCase().includes('instagram'))!]
    : 'Não informado'
  const campaign = lead['campaign_name'] || lead['Campaign Name'] || lead['campanha'] || 'Não informado'
  const ad = lead['ad_name'] || lead['Ad Name'] || 'Não informado'

  const subject = `🆕 Novo Lead: ${fullName}`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #C79D45 0%, #D4AD5F 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .lead-info { background: white; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #C79D45; }
        .label { font-weight: bold; color: #C79D45; }
        .value { margin-left: 10px; }
        .button { display: inline-block; padding: 12px 24px; background: #C79D45; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🆕 Novo Lead Recebido!</h1>
        </div>
        <div class="content">
          <p>Um novo lead foi adicionado ao sistema:</p>
          
          <div class="lead-info">
            <p><span class="label">Nome:</span><span class="value">${fullName}</span></p>
            <p><span class="label">WhatsApp:</span><span class="value">${phone}</span></p>
            <p><span class="label">Instagram:</span><span class="value">${instagram}</span></p>
            <p><span class="label">Campanha:</span><span class="value">${campaign}</span></p>
            <p><span class="label">Anúncio:</span><span class="value">${ad}</span></p>
          </div>

          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            Este lead foi automaticamente adicionado ao grupo "Novos" no quadro de CRM.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return { subject, html }
}
