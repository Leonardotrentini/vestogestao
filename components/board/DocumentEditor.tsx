'use client'

import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import { Extension } from '@tiptap/core'
import Color from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Typography from '@tiptap/extension-typography'
import { createClient } from '@/lib/supabase/client'
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Plus,
  ChevronDown,
  Undo,
  Redo,
  AlignJustify as IndentDecrease,
  AlignJustify as IndentIncrease
} from 'lucide-react'

interface DocumentEditorProps {
  boardId: string
  initialContent?: string
}

// Extensão para tamanho de fonte
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize?.replace('px', ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}px`,
              }
            },
          },
          fontFamily: {
            default: null,
            parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontFamily) {
                return {}
              }
              return {
                style: `font-family: ${attributes.fontFamily}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
      setFontFamily: (fontFamily: string) => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily })
          .run()
      },
      unsetFontFamily: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})

const fontSizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '30', '36', '48', '60', '72', '96']
const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Georgia',
  'Palatino',
  'Garamond',
  'Comic Sans MS',
  'Trebuchet MS',
  'Impact'
]

export default function DocumentEditor({ boardId, initialContent = '' }: DocumentEditorProps) {
  const [savedContent, setSavedContent] = useState(initialContent)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showFontSize, setShowFontSize] = useState(false)
  const [showFontFamily, setShowFontFamily] = useState(false)
  const supabase = createClient()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer hover:text-blue-600',
        },
      }),
      Underline,
      Typography,
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
        style: 'min-height: 800px; padding: 96px 120px;',
      },
    },
    onUpdate: ({ editor }) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = setTimeout(async () => {
        await saveContent(editor.getHTML())
      }, 2000)
    },
  })

  useEffect(() => {
    const loadContent = async () => {
      const { data } = await supabase
        .from('boards')
        .select('content')
        .eq('id', boardId)
        .single()

      if (data?.content && editor) {
        editor.commands.setContent(data.content || '')
        setSavedContent(data.content || '')
      } else if (initialContent && editor) {
        editor.commands.setContent(initialContent)
        setSavedContent(initialContent)
      }
    }
    if (editor) {
      loadContent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId, editor])

  const saveContent = async (html: string) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('boards')
        .update({ content: html })
        .eq('id', boardId)

      if (!error) {
        setLastSaved(new Date())
        setSavedContent(html)
      } else {
        console.error('Erro ao salvar conteúdo:', error)
      }
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleManualSave = async () => {
    if (!editor) return
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    await saveContent(editor.getHTML())
  }

  const handleSetLink = () => {
    if (!editor) return
    const url = linkUrl.trim()
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setLinkUrl('')
    setShowLinkModal(false)
  }

  const handleRemoveLink = () => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
    setShowLinkModal(false)
  }

  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#B7B7B7', '#CCCCCC',
    '#D9D9D9', '#EFEFEF', '#F3F3F3', '#FFFFFF', '#C79D45', '#FF6B6B',
    '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'
  ]

  const currentFontSize = editor?.getAttributes('textStyle').fontSize || '11'
  const currentFontFamily = editor?.getAttributes('textStyle').fontFamily || 'Arial'

  const hasChanges = editor?.getHTML() !== savedContent

  if (!editor) {
    return <div className="flex-1 flex items-center justify-center text-[rgba(255,255,255,0.7)]">Carregando editor...</div>
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0F1711]">
      {/* Barra de status superior */}
      <div className="px-6 py-2 border-b border-[rgba(199,157,69,0.2)] flex items-center justify-between bg-[#1A2A1D]">
        <div className="flex items-center gap-3 text-sm">
          {saving && (
            <span className="text-[rgba(255,255,255,0.7)] flex items-center gap-2">
              <span className="w-2 h-2 bg-[#C79D45] rounded-full animate-pulse"></span>
              Salvando...
            </span>
          )}
          {!saving && lastSaved && !hasChanges && (
            <span className="text-[rgba(255,255,255,0.5)]">
              Salvo às {lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {!saving && hasChanges && (
            <span className="text-[rgba(255,255,255,0.7)]">Não salvo</span>
          )}
        </div>
        <button
          onClick={handleManualSave}
          disabled={saving || !hasChanges}
          className="px-4 py-1.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: saving || !hasChanges 
              ? 'rgba(199, 157, 69, 0.2)' 
              : 'rgba(199, 157, 69, 0.3)',
            color: saving || !hasChanges 
              ? 'rgba(255, 255, 255, 0.5)' 
              : '#C79D45'
          }}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Toolbar principal */}
      <div className="px-6 py-2 border-b border-[rgba(199,157,69,0.2)] bg-[#1A2A1D] flex items-center gap-1 flex-wrap">
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r border-[rgba(199,157,69,0.2)] pr-2">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors disabled:opacity-50"
            title="Desfazer"
          >
            <Undo size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors disabled:opacity-50"
            title="Refazer"
          >
            <Redo size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
        </div>

        {/* Tamanho de fonte */}
        <div className="flex items-center gap-1 border-r border-[rgba(199,157,69,0.2)] pr-2">
          <div className="relative">
            <button
              onClick={() => setShowFontSize(!showFontSize)}
              className="px-2 py-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors text-sm text-[rgba(255,255,255,0.7)] min-w-[50px] flex items-center justify-between"
            >
              <span>{currentFontSize}</span>
              <ChevronDown size={14} />
            </button>
            {showFontSize && (
              <div className="absolute top-full left-0 mt-1 bg-[#1A2A1D] border border-[rgba(199,157,69,0.3)] rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto min-w-[100px]">
                {fontSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      editor.chain().focus().setFontSize(size).run()
                      setShowFontSize(false)
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm text-[rgba(255,255,255,0.7)] hover:bg-[rgba(199,157,69,0.1)]"
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Família de fonte */}
        <div className="flex items-center gap-1 border-r border-[rgba(199,157,69,0.2)] pr-2">
          <div className="relative">
            <button
              onClick={() => setShowFontFamily(!showFontFamily)}
              className="px-2 py-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors text-sm text-[rgba(255,255,255,0.7)] min-w-[120px] flex items-center justify-between"
            >
              <span>{currentFontFamily}</span>
              <ChevronDown size={14} />
            </button>
            {showFontFamily && (
              <div className="absolute top-full left-0 mt-1 bg-[#1A2A1D] border border-[rgba(199,157,69,0.3)] rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto min-w-[150px]">
                {fontFamilies.map((font) => (
                  <button
                    key={font}
                    onClick={() => {
                      editor.chain().focus().setFontFamily(font).run()
                      setShowFontFamily(false)
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm text-[rgba(255,255,255,0.7)] hover:bg-[rgba(199,157,69,0.1)]"
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formatação de texto */}
        <div className="flex items-center gap-1 border-r border-[rgba(199,157,69,0.2)] pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive('bold') ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Negrito"
          >
            <Bold size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive('italic') ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Itálico"
          >
            <Italic size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive('underline') ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Sublinhado"
          >
            <UnderlineIcon size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive('strike') ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Tachado"
          >
            <Strikethrough size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
        </div>

        {/* Cabeçalhos */}
        <div className="flex items-center gap-1 border-r border-[rgba(199,157,69,0.2)] pr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Título 1"
          >
            <Heading1 size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Título 2"
          >
            <Heading2 size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Título 3"
          >
            <Heading3 size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
        </div>

        {/* Listas */}
        <div className="flex items-center gap-1 border-r border-[rgba(199,157,69,0.2)] pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive('bulletList') ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Lista com marcadores"
          >
            <List size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive('orderedList') ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Lista numerada"
          >
            <ListOrdered size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
        </div>

        {/* Alinhamento */}
        <div className="flex items-center gap-1 border-r border-[rgba(199,157,69,0.2)] pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Alinhar à esquerda"
          >
            <AlignLeft size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Centralizar"
          >
            <AlignCenter size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Alinhar à direita"
          >
            <AlignRight size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
              editor.isActive({ textAlign: 'justify' }) ? 'bg-[rgba(199,157,69,0.2)]' : ''
            }`}
            title="Justificar"
          >
            <AlignJustify size={16} className="text-[rgba(255,255,255,0.7)]" />
          </button>
        </div>

        {/* Link */}
        <div className="flex items-center gap-1 border-r border-[rgba(199,157,69,0.2)] pr-2">
          <div className="relative">
            <button
              onClick={() => {
                if (editor.isActive('link')) {
                  setLinkUrl(editor.getAttributes('link').href || '')
                }
                setShowLinkModal(!showLinkModal)
              }}
              className={`p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors ${
                editor.isActive('link') ? 'bg-[rgba(199,157,69,0.2)]' : ''
              }`}
              title="Inserir link"
            >
              <LinkIcon size={16} className="text-[rgba(255,255,255,0.7)]" />
            </button>
            {showLinkModal && (
              <div className="absolute top-full left-0 mt-2 bg-[#1A2A1D] border border-[rgba(199,157,69,0.3)] rounded-lg p-3 z-50 min-w-[300px]">
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                  className="w-full px-3 py-2 bg-[rgba(0,0,0,0.3)] border border-[rgba(199,157,69,0.3)] rounded text-sm text-[rgba(255,255,255,0.95)] focus:outline-none focus:border-[rgba(199,157,69,0.5)] mb-2"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSetLink()
                    } else if (e.key === 'Escape') {
                      setShowLinkModal(false)
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSetLink}
                    className="flex-1 px-3 py-1.5 bg-[rgba(199,157,69,0.3)] text-[#C79D45] rounded text-sm font-medium hover:bg-[rgba(199,157,69,0.4)]"
                  >
                    Aplicar
                  </button>
                  {editor.isActive('link') && (
                    <button
                      onClick={handleRemoveLink}
                      className="px-3 py-1.5 bg-[rgba(255,0,0,0.2)] text-red-400 rounded text-sm font-medium hover:bg-[rgba(255,0,0,0.3)]"
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cor do texto */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-1.5 rounded hover:bg-[rgba(199,157,69,0.1)] transition-colors"
              title="Cor do texto"
            >
              <div className="w-4 h-4 border border-[rgba(255,255,255,0.3)] rounded" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }} />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-2 bg-[#1A2A1D] border border-[rgba(199,157,69,0.3)] rounded-lg p-3 z-50">
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run()
                        setShowColorPicker(false)
                      }}
                      className="w-8 h-8 rounded border border-[rgba(255,255,255,0.2)] hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  onChange={(e) => {
                    editor.chain().focus().setColor(e.target.value).run()
                    setShowColorPicker(false)
                  }}
                  className="w-full h-8 cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Área do documento - folha branca centralizada */}
      <div 
        className="flex-1 overflow-auto bg-gray-100 py-8"
        onClick={() => { 
          setShowLinkModal(false); 
          setShowColorPicker(false);
          setShowFontSize(false);
          setShowFontFamily(false);
        }}
      >
        <div className="max-w-[816px] mx-auto bg-white shadow-lg min-h-[1056px]">
          <EditorContent 
            editor={editor}
            className="prose max-w-none"
          />
        </div>
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 1056px;
          padding: 96px 120px;
          color: #000000;
          font-size: 11pt;
          line-height: 1.15;
          font-family: 'Arial', sans-serif;
        }

        .ProseMirror p {
          margin: 0;
          margin-bottom: 0;
          padding: 0;
        }

        .ProseMirror p + p {
          margin-top: 0.75em;
        }

        .ProseMirror h1 {
          font-size: 24pt;
          font-weight: bold;
          margin: 0.67em 0;
          color: #000000;
          line-height: 1.2;
        }

        .ProseMirror h2 {
          font-size: 18pt;
          font-weight: bold;
          margin: 0.75em 0;
          color: #000000;
          line-height: 1.3;
        }

        .ProseMirror h3 {
          font-size: 14pt;
          font-weight: bold;
          margin: 0.83em 0;
          color: #000000;
          line-height: 1.4;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 36pt;
          margin: 0.75em 0;
        }

        .ProseMirror li {
          margin: 0.25em 0;
          line-height: 1.5;
        }

        .ProseMirror a {
          color: #1155cc;
          text-decoration: underline;
          cursor: pointer;
        }

        .ProseMirror a:hover {
          color: #0d47a1;
        }

        .ProseMirror strong {
          font-weight: bold;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror u {
          text-decoration: underline;
        }

        .ProseMirror s {
          text-decoration: line-through;
        }

        .ProseMirror[style*="text-align: left"] {
          text-align: left;
        }

        .ProseMirror[style*="text-align: center"] {
          text-align: center;
        }

        .ProseMirror[style*="text-align: right"] {
          text-align: right;
        }

        .ProseMirror[style*="text-align: justify"] {
          text-align: justify;
        }
      `}</style>
    </div>
  )
}
