#!/usr/bin/env node

/**
 * Foundation v3.0 - Validador de Links Programático
 * 
 * Valida todos os links internos nos arquivos markdown da Foundation
 * Identifica links quebrados, referências inconsistentes e arquivos ausentes
 */

const fs = require('fs');
const path = require('path');

class LinkValidator {
  constructor() {
    this.foundationDir = __dirname;
    this.results = {
      totalFiles: 0,
      totalLinks: 0,
      validLinks: 0,
      brokenLinks: 0,
      errors: [],
      warnings: [],
      report: []
    };
  }

  /**
   * Inicia a validação completa
   */
  async validateAll() {
    console.log('🔍 Foundation v3.0 - Validação de Links Iniciada\n');
    
    try {
      const markdownFiles = this.findMarkdownFiles();
      console.log(`📁 Encontrados ${markdownFiles.length} arquivos markdown\n`);
      
      for (const filePath of markdownFiles) {
        await this.validateFile(filePath);
      }
      
      this.generateReport();
      this.saveReport();
      
    } catch (error) {
      console.error('❌ Erro durante validação:', error.message);
      process.exit(1);
    }
  }

  /**
   * Encontra todos os arquivos markdown na foundation
   */
  findMarkdownFiles() {
    const files = [];
    
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          scanDirectory(fullPath);
        } else if (item.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    };
    
    scanDirectory(this.foundationDir);
    return files;
  }

  /**
   * Valida links em um arquivo específico
   */
  async validateFile(filePath) {
    this.results.totalFiles++;
    
    const relativePath = path.relative(this.foundationDir, filePath);
    console.log(`📄 Validando: ${relativePath}`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const links = this.extractLinks(content);
      
      const fileReport = {
        file: relativePath,
        totalLinks: links.length,
        validLinks: 0,
        brokenLinks: 0,
        errors: [],
        warnings: []
      };
      
      for (const link of links) {
        this.results.totalLinks++;
        const validation = await this.validateLink(link, filePath);
        
        if (validation.valid) {
          this.results.validLinks++;
          fileReport.validLinks++;
        } else {
          this.results.brokenLinks++;
          fileReport.brokenLinks++;
          fileReport.errors.push({
            link: link.url,
            line: link.line,
            reason: validation.reason
          });
          
          this.results.errors.push({
            file: relativePath,
            link: link.url,
            line: link.line,
            reason: validation.reason
          });
        }
      }
      
      this.results.report.push(fileReport);
      
      if (fileReport.brokenLinks > 0) {
        console.log(`  ❌ ${fileReport.brokenLinks} links quebrados`);
      } else {
        console.log(`  ✅ Todos os ${fileReport.totalLinks} links válidos`);
      }
      
    } catch (error) {
      const errorMsg = `Erro ao ler arquivo: ${error.message}`;
      this.results.errors.push({
        file: relativePath,
        reason: errorMsg
      });
      console.log(`  ❌ ${errorMsg}`);
    }
  }

  /**
   * Extrai links markdown de um conteúdo
   */
  extractLinks(content) {
    const links = [];
    const lines = content.split('\n');
    
    // Regex para links markdown: [text](url)
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    
    lines.forEach((line, index) => {
      let match;
      while ((match = linkRegex.exec(line)) !== null) {
        const [, text, url] = match;
        
        // Só validar links internos (relativos)
        if (this.isInternalLink(url)) {
          links.push({
            text,
            url,
            line: index + 1,
            fullLine: line.trim()
          });
        }
      }
    });
    
    return links;
  }

  /**
   * Verifica se é um link interno
   */
  isInternalLink(url) {
    // Links internos: relativos, sem protocolo, não são âncoras puras
    return !url.startsWith('http') && 
           !url.startsWith('mailto:') && 
           !url.startsWith('#') &&
           !url.includes('://');
  }

  /**
   * Valida um link específico
   */
  async validateLink(link, fromFile) {
    try {
      const fromDir = path.dirname(fromFile);
      let targetPath = link.url;
      
      // Remove âncoras (#section)
      if (targetPath.includes('#')) {
        targetPath = targetPath.split('#')[0];
        
        // Se só tem âncora, é válido (link interno na mesma página)
        if (!targetPath) {
          return { valid: true };
        }
      }
      
      // Resolve caminho relativo
      const fullPath = path.resolve(fromDir, targetPath);
      
      // Verifica se arquivo existe
      if (!fs.existsSync(fullPath)) {
        return {
          valid: false,
          reason: `Arquivo não encontrado: ${targetPath}`
        };
      }
      
      // Verifica se é arquivo
      const stat = fs.statSync(fullPath);
      if (!stat.isFile()) {
        return {
          valid: false,
          reason: `Caminho não é um arquivo: ${targetPath}`
        };
      }
      
      return { valid: true };
      
    } catch (error) {
      return {
        valid: false,
        reason: `Erro ao validar: ${error.message}`
      };
    }
  }

  /**
   * Gera relatório de validação
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RELATÓRIO DE VALIDAÇÃO DE LINKS');
    console.log('='.repeat(60));
    
    console.log(`\n📈 ESTATÍSTICAS GERAIS:`);
    console.log(`  📁 Arquivos analisados: ${this.results.totalFiles}`);
    console.log(`  🔗 Links encontrados: ${this.results.totalLinks}`);
    console.log(`  ✅ Links válidos: ${this.results.validLinks}`);
    console.log(`  ❌ Links quebrados: ${this.results.brokenLinks}`);
    
    const successRate = this.results.totalLinks > 0 
      ? ((this.results.validLinks / this.results.totalLinks) * 100).toFixed(1)
      : 100;
    console.log(`  📊 Taxa de sucesso: ${successRate}%`);
    
    if (this.results.brokenLinks > 0) {
      console.log(`\n🚨 LINKS QUEBRADOS ENCONTRADOS:`);
      
      this.results.errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.file}:${error.line || '?'}`);
        console.log(`   Link: ${error.link || 'N/A'}`);
        console.log(`   Problema: ${error.reason}`);
      });
      
      console.log(`\n🔧 AÇÕES RECOMENDADAS:`);
      console.log(`  1. Revisar os ${this.results.brokenLinks} links quebrados acima`);
      console.log(`  2. Corrigir caminhos incorretos`);
      console.log(`  3. Atualizar referências para arquivos movidos`);
      console.log(`  4. Verificar se arquivos foram deletados`);
    } else {
      console.log(`\n🎉 EXCELENTE! Todos os links estão funcionando corretamente.`);
    }
    
    console.log(`\n📄 Relatório detalhado salvo em: foundation-links-report.json`);
  }

  /**
   * Salva relatório em JSON
   */
  saveReport() {
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: this.results.totalFiles,
        totalLinks: this.results.totalLinks,
        validLinks: this.results.validLinks,
        brokenLinks: this.results.brokenLinks,
        successRate: this.results.totalLinks > 0 
          ? ((this.results.validLinks / this.results.totalLinks) * 100)
          : 100
      },
      errors: this.results.errors,
      fileReports: this.results.report
    };
    
    const reportPath = path.join(this.foundationDir, 'foundation-links-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
  }
}

// Execução principal
async function main() {
  const validator = new LinkValidator();
  await validator.validateAll();
  
  // Exit code baseado nos resultados
  process.exit(validator.results.brokenLinks > 0 ? 1 : 0);
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = LinkValidator;