import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fetchDashboardData } from '@/lib/google-sheets/client'
import { getDefaultUserId } from '@/lib/utils'
import { sendEmail, formatNewLeadEmail } from '@/lib/notifications/email'
import { sendWhatsAppMessage, formatNewLeadWhatsAppMessage } from '@/lib/notifications/whatsapp'

/**
 * Envia notificações (email e WhatsApp) para novos leads
 */
async function sendNotificationsForNewLeads(leads: Record<string, any>[]) {
  const notifications = []
  
  if (leads.length === 0) return

  try {
    // Enviar email se configurado
    const emailRecipients = process.env.NOTIFICATION_EMAIL?.split(',').map(e => e.trim()).filter(Boolean)
    if (emailRecipients && emailRecipients.length > 0) {
      // Enviar um email por lead
      for (const lead of leads) {
        const { subject, html } = formatNewLeadEmail(lead)
        const emailSent = await sendEmail({
          to: emailRecipients,
          subject,
          html
        })
        if (emailSent) {
          notifications.push({ type: 'email', lead: lead['full_name'] || lead['nome'] || 'Lead', success: true })
        }
      }
    }

    // Enviar WhatsApp se configurado
    const whatsappGroupId = process.env.WHATSAPP_GROUP_ID
    if (whatsappGroupId) {
      // Se houver múltiplos leads, enviar mensagem consolidada
      if (leads.length === 1) {
        const message = formatNewLeadWhatsAppMessage(leads[0])
        const whatsappSent = await sendWhatsAppMessage({
          to: '',
          message,
          groupId: whatsappGroupId
        })
        if (whatsappSent) {
          notifications.push({ type: 'whatsapp', lead: leads[0]['full_name'] || leads[0]['nome'] || 'Lead', success: true })
        }
      } else {
        // Mensagem consolidada para múltiplos leads
        const consolidatedMessage = `🆕 *${leads.length} NOVOS LEADS RECEBIDOS!*\n\n` +
          leads.map((lead, idx) => {
            const name = lead['full_name'] || lead['Full Name'] || lead['nome'] || `Lead ${idx + 1}`
            const phone = lead['phone_number'] || lead['Phone Number'] || lead['telefone'] || 'Não informado'
            return `${idx + 1}. *${name}* - 📱 ${phone}`
          }).join('\n') +
          `\n\nTodos foram adicionados ao grupo "Novos" no CRM.`
        
        const whatsappSent = await sendWhatsAppMessage({
          to: '',
          message: consolidatedMessage,
          groupId: whatsappGroupId
        })
        if (whatsappSent) {
          notifications.push({ type: 'whatsapp', lead: `${leads.length} leads`, success: true })
        }
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao enviar notificações:`, error)
  }

  if (notifications.length > 0) {
    console.log(`✅ ${notifications.length} notificação(ões) enviada(s)`)
  } else {
    console.log('ℹ️ Nenhuma notificação configurada ou enviada')
  }
}

export async function POST(request: Request) {
  try {
    console.log('🔄 Iniciando sincronização de leads...')
    const { boardId, spreadsheetId, groupBy = 'qualificado' } = await request.json()

    if (!boardId || !spreadsheetId) {
      console.error('❌ Parâmetros faltando:', { boardId, spreadsheetId })
      return NextResponse.json(
        { error: 'boardId e spreadsheetId são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('📋 Parâmetros recebidos:', { boardId, spreadsheetId, groupBy })

    const supabase = await createClient()
    const defaultUserId = getDefaultUserId()

    console.log('📥 Buscando dados do Google Sheets...')
    // Buscar dados do Google Sheets
    const rawData = await fetchDashboardData(spreadsheetId)
    console.log('✅ Dados do Google Sheets recebidos:', {
      leads: rawData.leads?.length || 0,
      investimento: rawData.investimento?.length || 0,
      metas: rawData.metas?.length || 0
    })
    
    if (!rawData.leads || rawData.leads.length === 0) {
      console.error('❌ Nenhum lead encontrado na planilha')
      return NextResponse.json(
        { error: 'Nenhum lead encontrado na planilha' },
        { status: 400 }
      )
    }

    console.log('📊 Processando leads...')
    const leadsHeaders = rawData.leads[0] || []
    const cleanHeaders = leadsHeaders.map((h: string) => String(h || '').trim())
    console.log('📋 Cabeçalhos encontrados:', cleanHeaders)
    
    const leadsRows = rawData.leads.slice(1)
      .map((row) => {
        const lead: Record<string, any> = {}
        cleanHeaders.forEach((header: string, index: number) => {
          if (header && header.trim()) {
            const cellValue = row[index] !== undefined ? String(row[index] || '').trim() : ''
            lead[header] = cellValue
          }
        })
        return lead
      })
      .filter(lead => Object.values(lead).some(val => val && String(val).trim()))
    
    console.log(`✅ ${leadsRows.length} leads processados`)
    
    // Limitar número de leads para evitar timeout (pode processar em lotes depois)
    const maxLeads = 1000
    const leadsToProcess = leadsRows.slice(0, maxLeads)
    if (leadsRows.length > maxLeads) {
      console.warn(`⚠️ Limitando processamento a ${maxLeads} leads de ${leadsRows.length} totais`)
    }

    // Buscar ou criar colunas padrão para leads
    console.log('📝 Verificando/criando colunas...')
    const defaultColumns = [
      { name: 'Instagram', type: 'text', position: 1 },
      { name: 'WhatsApp', type: 'text', position: 2 },
      { name: 'Anúncio', type: 'text', position: 3 },
      { name: 'Público', type: 'text', position: 4 },
      { name: 'Campanha', type: 'text', position: 5 },
      { name: 'Faturamento Mensal', type: 'text', position: 6 },
      { name: 'Status', type: 'status', position: 7 },
    ]

    const { data: existingColumns, error: colsError } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (colsError) {
      console.error('❌ Erro ao buscar colunas:', colsError)
      throw colsError
    }

    const columnsMap = new Map<string, any>()
    existingColumns?.forEach(col => {
      columnsMap.set(col.name, col)
    })

    // Criar colunas que não existem
    for (const colDef of defaultColumns) {
      if (!columnsMap.has(colDef.name)) {
        console.log(`➕ Criando coluna: ${colDef.name}`)
        const { data: newCol, error: colError } = await supabase
          .from('columns')
          .insert({
            name: colDef.name,
            type: colDef.type,
            board_id: boardId,
            position: colDef.position,
          })
          .select()
          .single()
        
        if (colError) {
          console.error(`❌ Erro ao criar coluna ${colDef.name}:`, colError)
        } else if (newCol) {
          columnsMap.set(colDef.name, newCol)
          console.log(`✅ Coluna criada: ${colDef.name}`)
        }
      }
    }
    console.log(`✅ Total de colunas: ${columnsMap.size}`)

    // Buscar grupos existentes do board PRIMEIRO (precisa para buscar itens)
    console.log('🔍 Buscando grupos existentes...')
    const { data: existingGroups, error: groupsError } = await supabase
      .from('groups')
      .select('*')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (groupsError) {
      console.error('❌ Erro ao buscar grupos:', groupsError)
      throw groupsError
    }
    console.log(`✅ ${existingGroups?.length || 0} grupos existentes encontrados`)

    // Buscar TODOS os itens existentes do board para identificar leads novos
    console.log('🔍 Buscando itens existentes para identificar leads novos...')
    const { data: allExistingItems } = await supabase
      .from('items')
      .select('id, name, group_id')
      .in('group_id', existingGroups?.map(g => g.id) || [])

    const existingItemNames = new Set<string>()
    allExistingItems?.forEach(item => {
      existingItemNames.add(item.name.toLowerCase().trim())
    })
    console.log(`📋 ${existingItemNames.size} itens existentes encontrados`)

    // Agrupar leads por campo escolhido (padrão: qualificado)
    // REGRA ESPECIAL: Leads NOVOS (que não existem no banco) sempre vão para "Novos"
    console.log('📦 Agrupando leads...')
    const groupsMap = new Map<string, any[]>()
    let newLeadsCount = 0
    let existingLeadsCount = 0
    
    leadsToProcess.forEach(lead => {
      const fullName = lead['full_name'] || lead['Full Name'] || lead['Full_Name'] || lead['nome'] || lead['Nome'] || ''
      const normalizedName = fullName.toLowerCase().trim()
      const isNewLead = !existingItemNames.has(normalizedName)
      
      let groupKey = 'Novos' // Padrão é "Novos"
      
      // REGRA: Se for lead NOVO, sempre vai para "Novos" (independente do que está na planilha)
      if (isNewLead) {
        newLeadsCount++
        console.log(`🆕 Lead NOVO detectado: ${fullName} → vai para grupo "Novos"`)
        groupKey = 'Novos'
      } else {
        // Para leads EXISTENTES, verificar status na planilha para decidir o grupo
        existingLeadsCount++
        if (groupBy === 'qualificado') {
          const qualificado = lead['qualificado'] || lead['Qualificado'] || lead['validação'] || lead['Validação'] || ''
          groupKey = qualificado?.toString().toUpperCase().includes('QUALIFICADO') || qualificado?.toString().toUpperCase() === 'SIM'
            ? 'Qualificados'
            : 'Novos'
        } else if (groupBy === 'status') {
          groupKey = lead['lead_status'] || lead['Status'] || lead['status'] || 'Novos'
        } else if (groupBy === 'campanha') {
          groupKey = lead['campaign_name'] || lead['Campaign Name'] || lead['campanha'] || 'Novos'
        } else {
          // Usar o campo diretamente
          groupKey = lead[groupBy] || 'Novos'
        }
      }

      if (!groupsMap.has(groupKey)) {
        groupsMap.set(groupKey, [])
      }
      groupsMap.get(groupKey)!.push(lead)
    })
    console.log(`✅ Leads agrupados: ${newLeadsCount} novos (sempre em "Novos"), ${existingLeadsCount} existentes`)
    console.log(`📊 Total de grupos: ${groupsMap.size}`, Array.from(groupsMap.keys()))

    const groupsByName = new Map<string, any>()
    existingGroups?.forEach(group => {
      groupsByName.set(group.name, group)
    })

    // Criar ou atualizar grupos e itens
    console.log('🔄 Criando/atualizando grupos e itens...')
    const allNewLeadsToNotify: Record<string, any>[] = []
    let position = 0
    for (const [groupName, leads] of groupsMap.entries()) {
      console.log(`📦 Processando grupo: ${groupName} (${leads.length} leads)`)
      let group = groupsByName.get(groupName)
      
      if (!group) {
        console.log(`➕ Criando grupo: ${groupName}`)
        const { data: newGroup, error: groupError } = await supabase
          .from('groups')
          .insert({
            name: groupName,
            board_id: boardId,
            position: position++,
          })
          .select()
          .single()
        
        if (groupError) {
          console.error(`❌ Erro ao criar grupo ${groupName}:`, groupError)
          continue
        }
        
        if (newGroup) {
          group = newGroup
          groupsByName.set(groupName, group)
          console.log(`✅ Grupo criado: ${groupName}`)
        } else {
          console.warn(`⚠️ Grupo não foi criado: ${groupName}`)
          continue
        }
      } else {
        console.log(`✅ Grupo já existe: ${groupName}`)
      }

      // Buscar itens existentes do grupo
      const { data: existingItems, error: itemsError } = await supabase
        .from('items')
        .select('id, name')
        .eq('group_id', group.id)

      if (itemsError) {
        console.error(`❌ Erro ao buscar itens do grupo ${groupName}:`, itemsError)
        continue
      }

      const itemsByName = new Map<string, any>()
      existingItems?.forEach(item => {
        itemsByName.set(item.name, item)
      })
      console.log(`📋 ${existingItems?.length || 0} itens existentes no grupo ${groupName}`)

      // Criar ou atualizar itens
      let itemsCreated = 0
      let itemsUpdated = 0
      
      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i]
        const fullName = lead['full_name'] || lead['Full Name'] || lead['Full_Name'] || lead['nome'] || lead['Nome'] || `Lead ${i + 1}`
        const normalizedName = fullName.toLowerCase().trim()
        const isNewLead = !existingItemNames.has(normalizedName)
        
        let item = itemsByName.get(fullName)
        
        if (!item) {
          console.log(`➕ Criando item: ${fullName}`)
          const { data: newItem, error: itemError } = await supabase
            .from('items')
            .insert({
              name: fullName,
              group_id: group.id,
              position: i,
              user_id: defaultUserId,
            })
            .select()
            .single()
          
          if (itemError) {
            console.error(`❌ Erro ao criar item ${fullName}:`, itemError)
            continue
          }
          
          if (newItem) {
            item = newItem
            itemsCreated++
            
            // Se for um lead NOVO (não existia antes) e estiver no grupo "Novos", adicionar à lista de notificações
            if (isNewLead && groupName === 'Novos') {
              allNewLeadsToNotify.push(lead)
              console.log(`🔔 Lead novo detectado para notificação: ${fullName}`)
            }
          } else {
            console.warn(`⚠️ Item não foi criado: ${fullName}`)
            continue
          }
        } else {
          // Atualizar posição
          itemsUpdated++
          await supabase
            .from('items')
            .update({ position: i })
            .eq('id', item.id)
        }

        // Atualizar valores das colunas
        const columnMappings: Record<string, string> = {
          'Instagram': '@_do_instagram_da_sua_empresa',
          'WhatsApp': 'phone_number',
          'Anúncio': 'ad_name',
          'Público': 'adset_name',
          'Campanha': 'campaign_name',
          'Faturamento Mensal': 'quanto_você_vende_em_média_mensalmente',
          'Status': 'lead_status',
        }

        // Buscar todos os valores existentes do item de uma vez (otimização)
        const { data: existingColumnValues } = await supabase
          .from('column_values')
          .select('id, column_id')
          .eq('item_id', item.id)

        const existingValuesMap = new Map<string, string>()
        existingColumnValues?.forEach(cv => {
          existingValuesMap.set(cv.column_id, cv.id)
        })

        // Preparar valores para inserir/atualizar
        const columnValuesToInsert: any[] = []
        const columnValuesToUpdate: any[] = []

        for (const [colName, leadField] of Object.entries(columnMappings)) {
          const column = columnsMap.get(colName)
          if (!column) continue

          // Buscar valor do campo com múltiplas variações
          let value = ''
          
          if (colName === 'Instagram') {
            // Busca flexível para Instagram - tentar todas as variações possíveis
            const instagramKey = Object.keys(lead).find(key => {
              const lower = key.toLowerCase().trim()
              return lower.includes('instagram') || lower.includes('insta')
            })
            
            if (instagramKey) {
              value = lead[instagramKey] || ''
            } else {
              // Tentar variações específicas
              value = lead['@_do_instagram_da_sua_empresa'] || 
                     lead['instagram_da_empresa'] || 
                     lead['Instagram da Empresa'] || 
                     lead['Instagram da empresa'] ||
                     lead['instagram'] || 
                     lead['Instagram'] || 
                     lead['@instagram'] || 
                     lead['@_instagram'] || ''
            }
            
            // Log detalhado para debug (apenas primeiro lead)
            if (i === 0) {
              console.log(`📸 Debug Instagram - Lead: ${fullName}`, {
                foundKey: instagramKey,
                value: value,
                allKeys: Object.keys(lead),
                keysWithInstagram: Object.keys(lead).filter(k => k.toLowerCase().includes('instagram') || k.toLowerCase().includes('insta'))
              })
            }
          } else if (colName === 'WhatsApp') {
            // Busca flexível para WhatsApp
            value = lead[leadField] || 
                   lead['phone_number'] || 
                   lead['Phone Number'] || 
                   lead['phone'] || 
                   lead['Phone'] ||
                   lead['whatsapp'] || 
                   lead['WhatsApp'] || 
                   lead['telefone'] || 
                   lead['Telefone'] ||
                   lead['celular'] || 
                   lead['Celular'] ||
                   // Tentar buscar qualquer campo que contenha "phone", "whatsapp", "telefone" ou "celular"
                   (Object.keys(lead).find(key => {
                     const lower = key.toLowerCase()
                     return lower.includes('phone') || lower.includes('whatsapp') || lower.includes('telefone') || lower.includes('celular')
                   }) 
                     ? lead[Object.keys(lead).find(key => {
                         const lower = key.toLowerCase()
                         return lower.includes('phone') || lower.includes('whatsapp') || lower.includes('telefone') || lower.includes('celular')
                       })!] 
                     : '') || ''
          } else {
            // Para outros campos, tentar variações básicas
            value = lead[leadField] || 
                   lead[leadField.toLowerCase()] || 
                   lead[leadField.replace(/_/g, ' ')] ||
                   lead[leadField.replace(/_/g, '_')] ||
                   // Tentar buscar por nome similar
                   (Object.keys(lead).find(key => {
                     const lowerKey = key.toLowerCase().replace(/[_\s]/g, '')
                     const lowerField = leadField.toLowerCase().replace(/[_\s]/g, '')
                     return lowerKey.includes(lowerField) || lowerField.includes(lowerKey)
                   }) 
                     ? lead[Object.keys(lead).find(key => {
                         const lowerKey = key.toLowerCase().replace(/[_\s]/g, '')
                         const lowerField = leadField.toLowerCase().replace(/[_\s]/g, '')
                         return lowerKey.includes(lowerField) || lowerField.includes(lowerKey)
                       })!] 
                     : '') || ''
          }
          
          // Limpar valor (remover espaços extras)
          value = String(value || '').trim()
          
          const existingValueId = existingValuesMap.get(column.id)

          if (existingValueId) {
            // Atualizar
            columnValuesToUpdate.push({
              id: existingValueId,
              value
            })
          } else {
            // Criar
            columnValuesToInsert.push({
              item_id: item.id,
              column_id: column.id,
              value,
            })
          }
        }

        // Inserir novos valores em batch
        if (columnValuesToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('column_values')
            .insert(columnValuesToInsert)
          
          if (insertError) {
            console.error(`❌ Erro ao inserir valores para ${fullName}:`, insertError)
          }
        }

        // Atualizar valores existentes
        for (const update of columnValuesToUpdate) {
          const { error: updateError } = await supabase
            .from('column_values')
            .update({ value: update.value })
            .eq('id', update.id)
          
          if (updateError) {
            console.error(`❌ Erro ao atualizar valor para ${fullName}:`, updateError)
          }
        }
      }
      
      console.log(`✅ Grupo ${groupName}: ${itemsCreated} criados, ${itemsUpdated} atualizados`)

      // Remover itens que não estão mais na planilha
      const currentLeadNames = leads.map(l => 
        l['full_name'] || l['Full Name'] || l['Full_Name'] || l['nome'] || l['Nome'] || ''
      )
      let itemsDeleted = 0
      for (const item of existingItems || []) {
        if (!currentLeadNames.includes(item.name)) {
          console.log(`🗑️ Removendo item obsoleto: ${item.name}`)
          // Deletar valores das colunas
          await supabase.from('column_values').delete().eq('item_id', item.id)
          // Deletar item
          await supabase.from('items').delete().eq('id', item.id)
          itemsDeleted++
        }
      }
      if (itemsDeleted > 0) {
        console.log(`✅ ${itemsDeleted} itens obsoletos removidos do grupo ${groupName}`)
      }
    }

    // Enviar notificações para novos leads
    if (allNewLeadsToNotify.length > 0) {
      console.log(`🔔 Enviando notificações para ${allNewLeadsToNotify.length} novo(s) lead(s)...`)
      await sendNotificationsForNewLeads(allNewLeadsToNotify)
    }

    console.log('✅ Sincronização concluída com sucesso!')
    return NextResponse.json({ 
      success: true, 
      message: `${leadsToProcess.length} de ${leadsRows.length} leads sincronizados${leadsRows.length > maxLeads ? ` (limitado a ${maxLeads} por vez)` : ''}`,
      groups: Array.from(groupsMap.keys()),
      totalLeads: leadsRows.length,
      processedLeads: leadsToProcess.length,
      newLeadsNotified: allNewLeadsToNotify.length
    })
  } catch (error: any) {
    console.error('Erro ao sincronizar leads:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao sincronizar leads' },
      { status: 500 }
    )
  }
}
