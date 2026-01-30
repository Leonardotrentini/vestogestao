# 📋 BRIEFING: Editor de Documento Estilo Google Docs

## 🎯 O QUE FOI ENTENDIDO

O usuário quer que quando criar um quadro como "DOCUMENTO", seja uma **folha de texto rica** (rich text editor) estilo **Google Docs**, não apenas um textarea simples.

### Estado Atual:
- ✅ Já existe um `DocumentEditor` básico com textarea simples
- ✅ Já salva o tipo 'document' no banco
- ✅ Já renderiza o editor quando boardType === 'document'
- ❌ **FALTA**: Editor rico com formatação (negrito, itálico, listas, etc.)

---

## 📝 RECURSOS NECESSÁRIOS (Estilo Google Docs)

### 1. **Formatação de Texto Básica:**
- ✅ Negrito (Bold)
- ✅ Itálico (Italic)
- ✅ Sublinhado (Underline)
- ✅ Tachado (Strikethrough)

### 2. **Tipografia:**
- Tamanhos de fonte (pequeno, normal, grande, título)
- Estilos de cabeçalho (H1, H2, H3)
- Fonte (serif, sans-serif, monospace)

### 3. **Listas:**
- Listas numeradas (1, 2, 3...)
- Listas com bullets (•, •, •)
- Listas de tarefas com checkboxes

### 4. **Alinhamento:**
- Esquerda, Centro, Direita, Justificado

### 5. **Outros:**
- Links (adicionar/editar URLs)
- Cores de texto/fundo
- Inserir imagens (opcional para fase 2)
- Tabelas (opcional para fase 2)

---

## 🛠️ COMO EXECUTAR - OPÇÕES DE BIBLIOTECA

### **Opção 1: TipTap (RECOMENDADO) ⭐**
**Prós:**
- Moderna, leve, extensível
- Baseada em ProseMirror (mesma base do Google Docs)
- Excelente documentação
- Suporte a React
- Fácil de customizar

**Contras:**
- Pode ser complexa inicialmente

**Instalação:**
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-text-style @tiptap/extension-color @tiptap/extension-text-align @tiptap/extension-link @tiptap/extension-image
```

**Salvar conteúdo:**
- TipTap gera HTML ou JSON
- Podemos salvar como HTML no campo `content` do Supabase

---

### **Opção 2: React Quill**
**Prós:**
- Mais simples de usar
- Muitos plugins disponíveis
- Bem documentada

**Contras:**
- Menos flexível que TipTap
- Bundle size maior

**Instalação:**
```bash
npm install react-quill quill
```

---

### **Opção 3: Draft.js (Facebook)**
**Prós:**
- Criado pelo Facebook
- Muito customizável

**Contras:**
- Mais complexa
- Curva de aprendizado maior

---

## 📐 PLANO DE IMPLEMENTAÇÃO (Usando TipTap)

### **FASE 1: Estrutura Básica**
1. Instalar TipTap e extensões necessárias
2. Criar componente `RichTextEditor` baseado em TipTap
3. Substituir o textarea atual pelo editor rico
4. Configurar barra de ferramentas básica (toolbar)

### **FASE 2: Extensões Essenciais**
1. Adicionar extensões:
   - StarterKit (negrito, itálico, listas básicas)
   - TextAlign (alinhamento)
   - Link (links clicáveis)
   - Color (cores de texto)

### **FASE 3: Persistência**
1. Converter conteúdo do editor para HTML
2. Salvar HTML no campo `content` do Supabase
3. Carregar HTML ao abrir o documento

### **FASE 4: UI/UX**
1. Toolbar fixa no topo (estilo Google Docs)
2. Toolbar flutuante ao selecionar texto (opcional)
3. Indicador de salvamento (já existe, manter)
4. Estilo visual consistente com o tema dark da aplicação

---

## 🎨 INTERFACE VISUAL (Estilo Google Docs)

```
┌─────────────────────────────────────────────────────────────┐
│ [Nome do Documento]                          [Salvando...]  │  ← Header
├─────────────────────────────────────────────────────────────┤
│ [B] [I] [U] [S] | [H1] [H2] [H3] | [•] [1] | [🔗] [🎨]    │  ← Toolbar
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Área de Edição Rica - Estilo Google Docs]                │
│                                                              │
│  • Texto formatado                                          │
│  • Listas                                                    │
│  • Links                                                     │
│  • Cores                                                     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUXO DE DADOS

```
1. Usuário cria quadro tipo "document"
   ↓
2. BoardView detecta boardType === 'document'
   ↓
3. Renderiza DocumentEditor
   ↓
4. DocumentEditor carrega HTML do Supabase
   ↓
5. TipTap renderiza HTML como editor rico
   ↓
6. Usuário edita (auto-save a cada 2s)
   ↓
7. TipTap converte para HTML
   ↓
8. Salva HTML no Supabase (campo content)
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Instalar TipTap e dependências
- [ ] Criar componente RichTextEditor com TipTap
- [ ] Adicionar toolbar com botões básicos
- [ ] Configurar extensões (StarterKit, Link, TextAlign, Color)
- [ ] Integrar com DocumentEditor atual
- [ ] Converter HTML para conteúdo TipTap (ao carregar)
- [ ] Converter conteúdo TipTap para HTML (ao salvar)
- [ ] Testar salvamento/carregamento
- [ ] Estilizar toolbar no tema dark
- [ ] Testar todas as formatações
- [ ] Adicionar suporte a links
- [ ] Melhorar UX (toolbar flutuante, etc)

---

## 🚀 PRÓXIMOS PASSOS

1. **Aprovar o briefing** ✅
2. **Escolher biblioteca** (recomendado: TipTap)
3. **Instalar dependências**
4. **Implementar FASE 1**
5. **Testar básico**
6. **Implementar FASE 2-4**

---

## 💡 OBSERVAÇÕES IMPORTANTES

- **Compatibilidade**: TipTap funciona bem com React e Next.js
- **Performance**: Editor rico pode ser mais pesado, mas TipTap é otimizada
- **Mobile**: TipTap tem suporte mobile, mas pode precisar ajustes
- **Backup**: Sempre salvar como HTML para garantir compatibilidade futura
- **Tema**: Toolbar precisa seguir o tema dark (#0F1711, #1A2A1D, #C79D45)

---

**Status**: ⏳ Aguardando aprovação para iniciar implementação



