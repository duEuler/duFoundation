# DuEuler Foundation v3.0 - Aplicação Interna

## Regras Arquiteturais Fundamentais

### ⚠️ REGRA CRÍTICA: Isolamento do Foundation
**NUNCA** crie ou modifique arquivos fora da pasta `foundation/`. Toda funcionalidade relacionada ao Foundation deve estar contida aqui.

### Estrutura Organizacional
```
foundation/
├── _app/                    # ← Aplicação web principal
│   ├── client/             # Frontend React
│   ├── server/             # Backend Node.js
│   ├── shared/             # Schemas compartilhados
│   ├── package.json        # Dependências isoladas
│   ├── tsconfig.json       # Config TypeScript
│   ├── vite.config.ts      # Config Vite
│   └── tailwind.config.ts  # Config Tailwind
├── core/                   # Scripts e automação
├── docs/                   # Documentação
└── templates/              # Templates de configuração
```

## Configurações de Arquivos Externos

### tsconfig.json (Raiz do Projeto)
Se precisar modificar configurações TypeScript externas:
```json
{
  "exclude": ["foundation/**/*"],
  "compilerOptions": {
    // Configurações sem interferir no foundation
  }
}
```

### vite.config.ts (Raiz do Projeto) 
Se existir configuração Vite externa:
```typescript
// Excluir foundation/ do processamento
export default defineConfig({
  // ... outras configs
  exclude: ["foundation/**/*"]
});
```

### package.json (Raiz do Projeto)
Scripts externos não devem processar foundation:
```json
{
  "scripts": {
    "build": "vite build --exclude=foundation",
    "dev": "NODE_ENV=development tsx server/index.ts"
  }
}
```

## Rotas e Integração Externa

### API Routes Externas
Rotas do foundation devem ser prefixadas com `/foundation`:
```typescript
// server/routes.ts (externo)
app.use('/foundation', foundationRouter);

// foundation/_app/server/routes.ts (interno)
app.get('/api/setup', ...);  // Será acessível como /foundation/api/setup
```

### Frontend Routes
Navegação externa deve redirecionar para foundation:
```typescript
// App.tsx (externo) 
<Route path="/foundation/*" component={() => window.location.href = '/foundation'} />

// foundation/_app/client/src/App.tsx (interno)
<Route path="/setup" component={SetupPage} />
```

## Dependências e Imports

### Imports Entre Sistemas
```typescript
// ❌ NUNCA - Importar do foundation para projeto externo
import { something } from '../foundation/_app/...';

// ✅ CORRETO - Foundation é autossuficiente
// Use APIs HTTP ou eventos para comunicação
```

### Dependências Compartilhadas
O foundation mantém suas próprias dependências em `foundation/_app/package.json`.

## Configuração de Build

### Exclusão do Foundation no Build Principal
```javascript
// vite.config.js (se existir na raiz)
export default {
  build: {
    rollupOptions: {
      external: ['foundation/**']
    }
  }
}
```

### Scripts de Desenvolvimento
```bash
# Para projeto principal (sem foundation)
npm run dev

# Para foundation (isolado)
cd foundation/_app && npm run dev
```

## Modificações de Arquivos Externos

### Checklist de Segurança
Antes de modificar qualquer arquivo fora de `foundation/`:

1. ✅ É realmente necessário?
2. ✅ Posso fazer dentro do foundation?
3. ✅ A modificação não quebra o isolamento?
4. ✅ Está documentada neste README?

### Padrões de Integração Segura

#### 1. Comunicação via API
```typescript
// Projeto externo chama foundation via HTTP
fetch('/foundation/api/status')
  .then(res => res.json())
  .then(data => console.log(data));
```

#### 2. Redirecionamento de Rotas
```typescript
// Projeto externo redireciona para foundation
if (needsFoundationSetup) {
  window.location.href = '/foundation/setup';
}
```

#### 3. Eventos e Mensagens
```typescript
// Comunicação via eventos do navegador
window.postMessage({
  type: 'FOUNDATION_READY',
  data: setupStatus
}, '*');
```

## Solução de Problemas

### "Cannot find module" Errors
Verifique se o import não está tentando acessar arquivos do foundation diretamente.

### Conflitos de Configuração
O foundation usa suas próprias configurações isoladas. Não modifique configs da raiz.

### Hot Reload Issues
Foundation tem seu próprio servidor de desenvolvimento isolado.

## Exemplo de Integração Correta

```typescript
// ❌ ERRADO - Modificar arquivo externo
// client/src/App.tsx
import { FoundationSetup } from '../../../foundation/_app/...';

// ✅ CORRETO - Redirecionamento isolado
// client/src/App.tsx  
function App() {
  const [needsSetup, setNeedsSetup] = useState(false);
  
  useEffect(() => {
    fetch('/api/system/status')
      .then(res => res.json())
      .then(data => {
        if (!data.setupComplete) {
          window.location.href = '/foundation/setup';
        }
      });
  }, []);
  
  return needsSetup ? null : <MainApp />;
}
```

## Changelog de Modificações Externas

```
- July 4, 2025: Removidos arquivos incorretos da raiz (tsconfig.json, vite.config.js, tailwind.config.js)
- July 4, 2025: Implementadas regras de isolamento no README.md
- July 4, 2025: Configurado exclusão do foundation no processamento principal
```

---

**Lembre-se: O Foundation é um sistema autônomo e independente. Mantenha-o isolado para garantir portabilidade e estabilidade.**