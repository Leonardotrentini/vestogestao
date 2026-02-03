/**
 * Serviço de envio de mensagens WhatsApp
 * Suporta múltiplas APIs: Twilio, Evolution API, ou WhatsApp Business API
 */

interface WhatsAppOptions {
  to: string // Número do WhatsApp (formato: 5511999999999)
  message: string
  groupId?: string // ID do grupo do WhatsApp (se enviar para grupo)
}

export async function sendWhatsAppMessage(options: WhatsAppOptions): Promise<boolean> {
  try {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, 
            EVOLUTION_API_URL, EVOLUTION_API_KEY, WHATSAPP_GROUP_ID } = process.env

    // Se tiver Twilio configurado, usar Twilio
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM) {
      return await sendViaTwilio(options)
    }

    // Se tiver Evolution API configurada, usar Evolution
    if (EVOLUTION_API_URL && EVOLUTION_API_KEY) {
      return await sendViaEvolutionAPI(options)
    }

    // Se tiver grupo configurado, tentar enviar para grupo
    if (WHATSAPP_GROUP_ID || options.groupId) {
      return await sendToWhatsAppGroup(options.message, options.groupId || WHATSAPP_GROUP_ID)
    }

    console.warn('⚠️ Nenhum serviço de WhatsApp configurado. Configure TWILIO ou EVOLUTION_API.')
    return false
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error)
    return false
  }
}

async function sendViaTwilio(options: WhatsAppOptions): Promise<boolean> {
  try {
    const twilio = await import('twilio')
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    )

    // Formatar número para Twilio (whatsapp:+5511999999999)
    const formattedNumber = options.to.startsWith('whatsapp:') 
      ? options.to 
      : `whatsapp:+${options.to.replace(/\D/g, '')}`

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!, // whatsapp:+14155238886
      to: formattedNumber,
      body: options.message
    })

    console.log(`✅ WhatsApp enviado via Twilio para: ${formattedNumber}`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp via Twilio:', error)
    return false
  }
}

async function sendViaEvolutionAPI(options: WhatsAppOptions): Promise<boolean> {
  try {
    const formattedNumber = options.to.replace(/\D/g, '')
    const response = await fetch(`${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.EVOLUTION_API_KEY || ''
      },
      body: JSON.stringify({
        number: formattedNumber,
        text: options.message
      })
    })

    if (!response.ok) {
      throw new Error(`Evolution API error: ${response.statusText}`)
    }

    console.log(`✅ WhatsApp enviado via Evolution API para: ${formattedNumber}`)
    return true
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp via Evolution API:', error)
    return false
  }
}

async function sendToWhatsAppGroup(message: string, groupId?: string): Promise<boolean> {
  try {
    const groupIdToUse = groupId || process.env.WHATSAPP_GROUP_ID
    
    if (!groupIdToUse) {
      console.warn('⚠️ ID do grupo WhatsApp não configurado')
      return false
    }

    // Se tiver Evolution API, usar para enviar para grupo
    if (process.env.EVOLUTION_API_URL && process.env.EVOLUTION_API_KEY) {
      const response = await fetch(`${process.env.EVOLUTION_API_URL}/group/sendText/${process.env.EVOLUTION_INSTANCE_NAME}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.EVOLUTION_API_KEY || ''
        },
        body: JSON.stringify({
          groupJid: groupIdToUse,
          text: message
        })
      })

      if (response.ok) {
        console.log(`✅ Mensagem enviada para grupo WhatsApp: ${groupIdToUse}`)
        return true
      }
    }

    // Outras implementações de grupo podem ser adicionadas aqui
    console.warn('⚠️ Envio para grupo não implementado para o serviço configurado')
    return false
  } catch (error) {
    console.error('❌ Erro ao enviar para grupo WhatsApp:', error)
    return false
  }
}

export function formatNewLeadWhatsAppMessage(lead: Record<string, any>): string {
  const fullName = lead['full_name'] || lead['Full Name'] || lead['nome'] || 'Lead sem nome'
  const phone = lead['phone_number'] || lead['Phone Number'] || lead['telefone'] || 'Não informado'
  const instagram = Object.keys(lead).find(key => key.toLowerCase().includes('instagram'))
    ? lead[Object.keys(lead).find(key => key.toLowerCase().includes('instagram'))!]
    : 'Não informado'
  const campaign = lead['campaign_name'] || lead['Campaign Name'] || lead['campanha'] || 'Não informado'
  const ad = lead['ad_name'] || lead['Ad Name'] || 'Não informado'

  return `🆕 *NOVO LEAD RECEBIDO!*

👤 *Nome:* ${fullName}
📱 *WhatsApp:* ${phone}
📸 *Instagram:* ${instagram}
📢 *Campanha:* ${campaign}
🎯 *Anúncio:* ${ad}

Este lead foi automaticamente adicionado ao grupo "Novos" no CRM.`
}
