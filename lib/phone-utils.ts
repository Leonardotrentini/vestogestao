/**
 * Formata um número de telefone para o formato (DDD) XXXXX-XXXX
 * Remove prefixos como "p:", "+55", espaços e caracteres especiais
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '-'
  
  // Converter para string e remover espaços
  let cleaned = String(phone).trim()
  
  // Remover prefixos comuns
  cleaned = cleaned.replace(/^p:/i, '')
  cleaned = cleaned.replace(/^\+55/, '')
  cleaned = cleaned.replace(/^55/, '')
  
  // Remover todos os caracteres não numéricos exceto parênteses e hífens já formatados
  cleaned = cleaned.replace(/[^\d()-\s]/g, '')
  
  // Remover espaços
  cleaned = cleaned.replace(/\s/g, '')
  
  // Se já estiver formatado com parênteses, tentar manter
  if (cleaned.match(/^\(\d{2}\)\d{4,5}-\d{4}$/)) {
    return cleaned
  }
  
  // Remover parênteses e hífens para processar
  let digits = cleaned.replace(/[()-\s]/g, '')
  
  // Se não tiver dígitos suficientes, retornar original
  if (digits.length < 10) {
    return phone.toString()
  }
  
  // Se tiver 10 dígitos (fixo): (XX) XXXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  
  // Se tiver 11 dígitos (celular): (XX) XXXXX-XXXX
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  
  // Se tiver mais de 11 dígitos, pode ter código do país
  // Remover código do país (55) se presente
  if (digits.length > 11 && digits.startsWith('55')) {
    digits = digits.slice(2)
  }
  
  // Se ainda tiver 10 ou 11 dígitos, formatar
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  
  // Se não conseguir formatar, retornar original
  return phone.toString()
}

/**
 * Verifica se uma string parece ser um número de telefone
 */
export function isPhoneNumber(value: string | null | undefined): boolean {
  if (!value) return false
  
  const cleaned = String(value)
    .replace(/^p:/i, '')
    .replace(/^\+55/, '')
    .replace(/^55/, '')
    .replace(/[^\d]/g, '')
  
  // Deve ter pelo menos 10 dígitos (DDD + número)
  return cleaned.length >= 10 && cleaned.length <= 13
}
