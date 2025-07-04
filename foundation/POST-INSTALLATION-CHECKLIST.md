# Foundation v3.0 - Checklist Pós-Instalação

## ✅ Verificação Completa Após Instalação

Este checklist valida que o Foundation v3.0 foi instalado corretamente e está funcionando perfeitamente. Execute após instalação bem-sucedida.

## 📋 Checklist de Validação

### **1. Arquivos Foundation Criados**

- [ ] **Marcador de instalação existe**
  ```bash
  ls .foundation-installed
  # Deve existir
  ```

- [ ] **Manifesto detalhado criado**
  ```bash
  ls .foundation-manifest.json
  cat .foundation-manifest.json | jq '.version'
  # Deve mostrar "3.0.0"
  ```

- [ ] **Estrutura foundation/ completa**
  ```bash
  ls foundation/
  # Deve conter: .config/, monitoring/, templates/, *.md
  ```

- [ ] **Configuração Foundation válida**
  ```bash
  cat foundation/.config/foundation.json | jq '.installed'
  # Deve mostrar data/hora de instalação
  ```

### **2. Integração com Servidor**

- [ ] **Rota Foundation instalada**
  ```bash
  ls server/routes/foundation-setup.js
  # Deve existir
  ```

- [ ] **Import Foundation no routes.ts**
  ```bash
  grep "foundation-setup" server/routes.ts
  # Deve mostrar import
  ```

- [ ] **Registro da rota no servidor**
  ```bash
  grep "app.use.*foundation" server/routes.ts
  # Deve mostrar app.use(foundationSetup)
  ```

### **3. Funcionamento HTTP**

- [ ] **Servidor responde em /foundation/setup**
  ```bash
  curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/foundation/setup
  # Deve retornar: 200
  ```

- [ ] **Conteúdo Foundation carregado**
  ```bash
  curl -s http://localhost:5000/foundation/setup | grep "Foundation v3.0"
  # Deve encontrar texto
  ```

- [ ] **API health funcionando**
  ```bash
  curl -s http://localhost:5000/api/health | jq '.status'
  # Deve retornar: "ok"
  ```

### **4. Validação de Sintaxe**

- [ ] **Rota Foundation sintaticamente correta**
  ```bash
  node --check server/routes/foundation-setup.js
  # Não deve retornar erros
  ```

- [ ] **ES modules funcionando**
  ```bash
  grep "import.*from" server/routes/foundation-setup.js
  # Deve mostrar imports ES modules (se projeto ES)
  ```

- [ ] **Server routes ainda funcionando**
  ```bash
  node --check server/routes.ts
  # Não deve retornar erros
  ```

### **5. Backup e Manifesto**

- [ ] **Backup de instalação criado**
  ```bash
  ls foundation/.installation-backup/
  # Deve conter backups de arquivos modificados
  ```

- [ ] **Manifesto rastreando mudanças**
  ```bash
  cat .foundation-manifest.json | jq '.files'
  # Deve listar arquivos criados
  ```

- [ ] **Relatório de instalação gerado**
  ```bash
  ls foundation/installation-report.json
  cat foundation/installation-report.json | jq '.success'
  # Deve mostrar: true
  ```

### **6. Interface Web Foundation**

- [ ] **Página Foundation carrega completamente**
  ```bash
  curl -s http://localhost:5000/foundation/setup | wc -c
  # Deve ser > 1000 caracteres (página completa)
  ```

- [ ] **CSS e estilos aplicados**
  ```bash
  curl -s http://localhost:5000/foundation/setup | grep -c "style"
  # Deve ser > 0
  ```

- [ ] **Informações corretas exibidas**
  ```bash
  curl -s http://localhost:5000/foundation/setup | grep "$(date +%Y)"
  # Deve mostrar ano atual na data de instalação
  ```

### **7. Comandos Foundation Disponíveis**

- [ ] **foundation-remove executável**
  ```bash
  ls foundation/foundation-remove.cjs
  node foundation/foundation-remove.cjs --help 2>/dev/null || echo "Script funcional"
  ```

- [ ] **foundation-scanner executável**
  ```bash
  node foundation/foundation-scanner.cjs > /dev/null
  echo $?
  # Deve ser 0 (sucesso)
  ```

- [ ] **Scripts de migração disponíveis**
  ```bash
  ls foundation/foundation-migrator.cjs foundation/foundation-installer.cjs
  # Ambos devem existir
  ```

## 🧪 Testes Funcionais Avançados

### **Teste 1: Ciclo Completo de Requisição**

```bash
# Teste completo da stack
curl -X GET http://localhost:5000/foundation/setup \
  -H "Accept: text/html" \
  -H "User-Agent: Foundation-Test" \
  -w "Status: %{http_code}\nTime: %{time_total}s\nSize: %{size_download} bytes\n"
```

**Resultado esperado:**
```
Status: 200
Time: < 1.0s
Size: > 1000 bytes
```

### **Teste 2: Stress Test Básico**

```bash
# 10 requisições simultâneas
for i in {1..10}; do
  curl -s http://localhost:5000/foundation/setup > /dev/null &
done
wait
echo "Stress test concluído"
```

### **Teste 3: Validação de Headers**

```bash
curl -I http://localhost:5000/foundation/setup
```

**Deve incluir:**
```
HTTP/1.1 200 OK
Content-Type: text/html
```

## 📊 Verificação de Performance

### **Tempo de Resposta**

- [ ] **Foundation setup < 500ms**
  ```bash
  curl -w "%{time_total}" -s http://localhost:5000/foundation/setup -o /dev/null
  # Deve ser < 0.5
  ```

- [ ] **API health < 100ms**
  ```bash
  curl -w "%{time_total}" -s http://localhost:5000/api/health -o /dev/null
  # Deve ser < 0.1
  ```

### **Uso de Memória**

- [ ] **Servidor estável após instalação**
  ```bash
  ps aux | grep node | grep -v grep
  # Verificar uso de CPU e memória razoáveis
  ```

## 🚨 Sinais de Problemas

### **❌ Falhas Críticas (Executar Rollback)**

1. **HTTP 404 em /foundation/setup**
   ```bash
   # Rollback imediato
   node foundation/foundation-remove.cjs
   ```

2. **Erros de sintaxe nos arquivos**
   ```bash
   # Restaurar backup
   cp foundation/.installation-backup/* ./
   ```

3. **Servidor não inicia após instalação**
   ```bash
   # Verificar logs e reverter
   npm run dev 2>&1 | head -10
   ```

### **⚠️ Problemas Menores (Investigar)**

1. **Resposta lenta (> 1s)**
2. **Warnings no console**
3. **Falta de estilos CSS**

## ✅ Checklist de Sucesso Completo

Marque apenas quando **todos** os itens passarem:

- [ ] ✅ Arquivos Foundation criados (4/4)
- [ ] ✅ Integração com servidor (3/3)
- [ ] ✅ Funcionamento HTTP (3/3)
- [ ] ✅ Validação de sintaxe (3/3)
- [ ] ✅ Backup e manifesto (3/3)
- [ ] ✅ Interface web Foundation (3/3)
- [ ] ✅ Comandos Foundation (3/3)

**Total: __ / 22 verificações**

### **Status Final:**

- [ ] **100% SUCESSO** - Foundation completamente funcional
- [ ] **95-99% SUCESSO** - Pequenos ajustes necessários  
- [ ] **< 95% SUCESSO** - Reinstalação recomendada

## 📝 Template de Relatório

```
Foundation v3.0 - Relatório Pós-Instalação
Data: ___________
Projeto: ___________
Responsável: ___________

VERIFICAÇÕES BÁSICAS:
✅ Arquivos Foundation: __/4
✅ Integração servidor: __/3  
✅ Funcionamento HTTP: __/3
✅ Validação sintaxe: __/3
✅ Backup/manifesto: __/3
✅ Interface web: __/3
✅ Comandos disponíveis: __/3

TESTES FUNCIONAIS:
[ ] Ciclo completo requisição
[ ] Stress test básico
[ ] Validação headers

PERFORMANCE:
Foundation setup: ___ms
API health: ___ms
Uso memória: ___MB

STATUS FINAL: ________________

PROBLEMAS ENCONTRADOS:
_________________________________
_________________________________

AÇÕES CORRETIVAS:
_________________________________
_________________________________

Assinatura: ___________
```

## 🎯 Próximos Passos

### **Se 100% Sucesso:**
1. ✅ Foundation pronto para uso
2. 🌐 Acesse: http://localhost:5000/foundation/setup
3. 📚 Consulte: foundation/README.md para recursos

### **Se < 100% Sucesso:**
1. 📖 Consulte: foundation/TROUBLESHOOTING.md
2. 🔄 Execute correções necessárias
3. 🧪 Re-execute este checklist

### **Para Projetos em Produção:**
1. 📋 Documente configuração final
2. 🔒 Configure backups automáticos
3. 📊 Monitore performance continuamente

---

**Este checklist garante que o Foundation v3.0 está 100% operacional e pronto para uso em produção.**