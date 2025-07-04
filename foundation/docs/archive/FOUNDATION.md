# DuEuler Foundation v3.0 - Sistema Portável

## Visão Geral

O DuEuler Foundation v3.0 é um framework portável e auto-suficiente que pode ser integrado a qualquer projeto. Fornece funcionalidades avançadas de monitoramento, gerenciamento de usuários e interface web completa.

## Características

### **Portabilidade**
- Sistema independente que funciona em qualquer projeto
- Auto-detecção quando descompactado
- Instalação/desinstalação completa
- Backup automático antes de modificações

### **Capacidades**
- **SMALL**: 10K-50K usuários (2GB RAM, 2 cores)
- **MEDIUM**: 50K-250K usuários (4GB RAM, 4 cores)  
- **LARGE**: 250K-1M usuários (8GB RAM, 8 cores)
- **ENTERPRISE**: 1M+ usuários (16GB+ RAM, 16+ cores)

### **Funcionalidades**
- Interface web completa em `/foundation`
- Sistema de monitoramento em tempo real
- Gerenciamento de dependências
- Métricas e dashboards
- Sistema de backup e restore
- API endpoints para integração

## Instalação

### **Método 1: Auto-detector (Recomendado)**
```bash
# O sistema detecta automaticamente quando extraído
node foundation/foundation-detector.cjs
```

### **Método 2: Instalação Direta**
```bash
node foundation/foundation-installer-simple.cjs
```

### **Método 3: Interface Web**
Após instalação, acesse: `http://localhost:5173/foundation/setup`

## Desinstalação

### **Comando Avançado (Recomendado)**
```bash
./foundation/foundation-uninstall
```

### **Comando Legado**
```bash
./foundation/foundation-remove
```

### **Interface Web**
Acesse: `http://localhost:5173/foundation/uninstall`

## Estrutura de Arquivos

```
foundation/
├── foundation-detector.cjs      # Auto-detector principal
├── foundation-installer-simple.cjs  # Instalador básico
├── foundation-uninstaller.cjs   # Desinstalador avançado
├── foundation-remover.cjs       # Removedor básico
├── foundation-uninstall         # Comando shell avançado
├── foundation-remove            # Comando shell legado
├── foundation.config.json       # Configuração central
├── monitoring/                  # Sistema de monitoramento
├── _app/                       # Configurações do projeto
├── .trash/                     # Arquivos obsoletos
└── README.md                   # Documentação geral
```

## Manifesto de Instalação

O sistema mantém um registro preciso de todas as modificações em `.foundation-manifest.json`:

```json
{
  "version": "3.0",
  "installed": true,
  "installDate": "2025-07-04T05:00:00.000Z",
  "modifications": [
    {
      "type": "file_created",
      "path": "client/src/foundation-setup.tsx",
      "backup": "foundation/.trash/..."
    }
  ]
}
```

## Comandos Úteis

```bash
# Verificar status
node foundation/foundation-detector.cjs --status

# Backup manual
node foundation/foundation-detector.cjs --backup

# Restore
node foundation/foundation-detector.cjs --restore

# Limpar cache
node foundation/foundation-detector.cjs --clean
```

## Integração com Projeto

### **Rotas Adicionadas**
- `/foundation` - Dashboard principal
- `/foundation/setup` - Configuração inicial
- `/foundation/uninstall` - Interface de desinstalação
- `/foundation/monitoring` - Métricas em tempo real
- `/foundation/dependencies` - Gerenciamento de dependências

### **API Endpoints**
- `GET /api/foundation/status` - Status do sistema
- `POST /api/foundation/setup` - Configuração inicial
- `POST /api/foundation/uninstall` - Desinstalação via API
- `GET /api/foundation/metrics` - Métricas em tempo real

## Compatibilidade

### **Projetos Suportados**
- React + Express + PostgreSQL
- Node.js + TypeScript
- Vite + Drizzle ORM
- Replit deployments

### **Dependências Automáticas**
O Foundation instala automaticamente suas dependências sem afetar o projeto principal.

## Troubleshooting

### **Problemas Comuns**

1. **Foundation não detectado**
   ```bash
   # Verifique se está na pasta correta
   ls foundation/
   ```

2. **Erro de permissões**
   ```bash
   chmod +x foundation/foundation-uninstall
   chmod +x foundation/foundation-remove
   ```

3. **Conflitos de rotas**
   - O Foundation usa prefixo `/foundation` para evitar conflitos
   - Desinstale completamente se necessário

4. **Estado inconsistente**
   ```bash
   # Force reset
   rm -f .foundation-manifest.json
   ./foundation/foundation-uninstall --force
   ```

## Atualizações

O Foundation é versionado independentemente:
- `v3.0`: Sistema portável com auto-detecção
- `v3.1`: Melhorias de performance (em desenvolvimento)
- `v4.0`: Suporte multi-tenant (planejado)

---

**Documentação atualizada**: 4 de Julho, 2025
**Versão do Foundation**: 3.0
**Compatibilidade**: Projetos Replit + React + Express