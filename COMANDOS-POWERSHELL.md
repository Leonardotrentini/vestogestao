# 💻 Comandos PowerShell - Vestogestao

## 🚀 Rodar a Aplicação

Abra o PowerShell no diretório do projeto e execute:

```powershell
npm run dev
```

## 📍 Navegar até a pasta do projeto

Se você estiver em outro diretório, primeiro navegue até a pasta:

```powershell
cd "C:\Users\Leonardo trentini\Desktop\vestogestao"
```

Depois execute:

```powershell
npm run dev
```

## ✅ O que vai acontecer

O servidor Next.js vai iniciar e você verá algo como:

```
▲ Next.js 14.2.5
- Local:        http://localhost:3000
- Ready in 2.5s
```

## 🌐 Acessar no navegador

Abra seu navegador e acesse:

**http://localhost:3000**

## 🛑 Parar o servidor

Para parar o servidor, pressione:

```
Ctrl + C
```

## 📋 Outros comandos úteis

### Instalar dependências (primeira vez ou depois de atualizar package.json)
```powershell
npm install
```

### Verificar erros no código
```powershell
npm run lint
```

### Compilar para produção
```powershell
npm run build
```

### Rodar versão de produção (depois do build)
```powershell
npm start
```

## ⚠️ Primeira vez?

Se for a primeira vez rodando o projeto:

1. **Instale as dependências:**
   ```powershell
   npm install
   ```

2. **Configure o Supabase:**
   - Crie arquivo `.env.local` com suas credenciais
   - Execute o SQL de migração no Supabase

3. **Depois rode:**
   ```powershell
   npm run dev
   ```

## 🎯 Resumo Rápido

```powershell
# 1. Ir para a pasta do projeto
cd "C:\Users\Leonardo trentini\Desktop\vestogestao"

# 2. (Se necessário) Instalar dependências
npm install

# 3. Rodar aplicação
npm run dev

# 4. Abrir navegador em: http://localhost:3000
```











