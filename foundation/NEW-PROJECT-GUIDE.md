# Foundation v3.0 - Guia para Projetos Novos

## 🚀 Configuração Ideal para Novos Projetos

Para projetos novos, recomendamos seguir os padrões obrigatórios do Foundation desde o início. Isso garante máxima compatibilidade e aproveitamento de todos os recursos.

## 📋 Padrões Obrigatórios

### **1. Configuração de Módulos**
```json
// package.json
{
  "type": "module",
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build"
  }
}
```

### **2. Estrutura de Pastas Obrigatória**
```
projeto/
├── server/           # Backend Express
│   ├── index.ts      # Servidor principal
│   ├── routes.ts     # Sistema de rotas
│   └── storage.ts    # Camada de dados
├── client/           # Frontend React
│   └── src/
├── shared/           # Código compartilhado
│   └── schema.ts     # Schemas de dados
└── foundation/       # Sistema Foundation (auto-criado)
```

### **3. Dependências Essenciais**
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

## 🛠️ Configuração Passo a Passo

### **Passo 1: Inicializar Projeto**
```bash
npm init -y
npm install express typescript vite tsx
```

### **Passo 2: Configurar package.json**
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build"
  }
}
```

### **Passo 3: Criar server/index.ts**
```typescript
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Register routes
const server = await registerRoutes(app);

const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
```

### **Passo 4: Criar server/routes.ts**
```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic health check route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
```

### **Passo 5: Criar tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["client", "server", "shared"],
  "exclude": ["node_modules", "dist"]
}
```

### **Passo 6: Criar estrutura de pastas**
```bash
mkdir -p server client/src shared
```

### **Passo 7: Criar shared/schema.ts**
```typescript
// Basic schema template for Foundation
export interface BaseEntity {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

// Example: User schema
export interface User extends BaseEntity {
  username: string;
  email: string;
  role: string;
}
```

## ✅ Verificação de Compatibilidade

Após configurar o projeto, execute:

```bash
# Baixar Foundation
curl -o foundation-scanner.cjs https://foundation.dueuler.com/scanner.cjs
node foundation-scanner.cjs
```

Resultado esperado:
```
🟢 Classificação: COMPATÍVEL
📊 Pontuação: 90-100/100

✅ PRÓXIMOS PASSOS:
   ✅ Projeto pronto para Foundation
   🚀 Executar: foundation-installer para instalação
```

## 🚀 Instalação Foundation

Se o scan retornar COMPATÍVEL:

```bash
# Baixar e executar installer
curl -o foundation-installer.cjs https://foundation.dueuler.com/installer.cjs
node foundation-installer.cjs
```

## 📊 Validação Final

Após instalação, acesse:
- **Interface Foundation:** http://localhost:5000/foundation/setup
- **API Health:** http://localhost:5000/api/health

## 🎯 Benefícios da Configuração Padrão

### **Performance:**
- ES Modules para carregamento otimizado
- TypeScript para detecção precoce de erros
- Vite para build rápido

### **Manutenibilidade:**
- Estrutura padronizada
- Separação clara de responsabilidades
- Schemas compartilhados

### **Escalabilidade:**
- Foundation pronto para expansão
- Padrões consistentes
- Documentação automática

## 🛟 Suporte

Se encontrar problemas:

1. **Verificar dependências:** Todas as dependências essenciais instaladas?
2. **Verificar sintaxe:** Arquivos usando ES modules corretamente?
3. **Consultar logs:** Mensagens de erro específicas?
4. **Scanner Foundation:** Execute novamente para diagnóstico

**Documentação adicional:**
- `foundation/TROUBLESHOOTING.md` - Resolução de problemas
- `foundation/FOUNDATION-ARCHITECTURE.md` - Arquitetura completa

---

**Criado em:** 2025-07-04  
**Versão:** 3.0.0  
**Para:** Projetos novos seguindo padrões Foundation