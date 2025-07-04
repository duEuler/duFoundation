#!/usr/bin/env node

/**
 * EXECUTOR DA MIGRAÇÃO FOUNDATION v3.0
 * Script para executar a migração completa de forma segura
 */

const { FoundationMigrationPlan } = require('./foundation-migration-plan.cjs');

async function main() {
  console.log('🏗️  MIGRAÇÃO FOUNDATION v3.0 - EXECUTOR');
  console.log('=====================================\n');
  
  const plan = new FoundationMigrationPlan();
  
  console.log('📋 Exibindo plano de migração...\n');
  plan.showPlan();
  
  console.log('\n⚠️  IMPORTANTE:');
  console.log('- Backup criado: backup/fundation_ponto1.tar.gz');
  console.log('- Log detalhado será salvo em: migration-log.json');
  console.log('- Em caso de erro, consulte o log para rollback manual');
  
  console.log('\n🚀 Iniciando migração em 3 segundos...');
  
  // Pequena pausa para o usuário ver o plano
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const success = await plan.executeMigration();
  
  if (success) {
    console.log('\n✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('📁 Nova estrutura criada em: foundation_new/');
    console.log('📋 Log detalhado em: migration-log.json');
    console.log('\n⏭️  PRÓXIMOS PASSOS:');
    console.log('1. Validar a nova estrutura em foundation_new/');
    console.log('2. Testar a aplicação');
    console.log('3. Mover foundation_new → foundation (renomear/substituir)');
    console.log('4. Atualizar configurações do servidor');
  } else {
    console.log('\n❌ MIGRAÇÃO FALHOU!');
    console.log('📋 Consulte migration-log.json para detalhes dos erros');
    console.log('🔄 O backup está disponível em: backup/fundation_ponto1.tar.gz');
  }
}

// Executar
main().catch(error => {
  console.error('💥 ERRO CRÍTICO:', error);
  process.exit(1);
});