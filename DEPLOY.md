# Guia de Deploy

## Preparar para commit no Git

### 1. Verificar o que será commitado

```bash
git status
```

### 2. Adicionar arquivos ao git

```bash
git add .
```

### 3. Fazer commit inicial

```bash
git commit -m "feat: MVP do sistema de gestão de projetos - Monday.com clone"
```

### 4. Conectar ao repositório remoto

```bash
git remote add origin https://github.com/Leonardotrentini/vestogestao.git
```

### 5. Fazer push

```bash
git branch -M main
git push -u origin main
```

## Deploy na Vercel (Recomendado)

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com GitHub
3. Clique em "Add New Project"
4. Selecione o repositório `vestogestao`
5. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Clique em "Deploy"

O Vercel detecta automaticamente que é um projeto Next.js e faz o deploy.

## Deploy manual (outras plataformas)

O projeto é um Next.js padrão, então pode ser deployado em qualquer plataforma que suporte Next.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## Importante antes do deploy

⚠️ Certifique-se de:
1. Ter executado o SQL de migração no Supabase
2. Ter configurado as variáveis de ambiente
3. Ter testado localmente (`npm run dev`)











