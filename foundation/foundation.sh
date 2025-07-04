#!/bin/bash

# DuEuler Foundation - Script de Conveniência
# Facilita a execução dos comandos foundation

# Detectar se estamos dentro da pasta foundation ou na raiz
if [ -f "foundation-installer.cjs" ]; then
    FOUNDATION_DIR="."
elif [ -f "foundation/foundation-installer.cjs" ]; then
    FOUNDATION_DIR="foundation"
else
    FOUNDATION_DIR="."
fi

# Função para mostrar ajuda
show_help() {
    echo "🌟 DuEuler Foundation v3.0 - Comandos Disponíveis"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  install    - Instalar foundation (com confirmação S/SIM)"
    echo "  verify     - Verificar estrutura plantada"
    echo "  check      - Alias para verify"
    echo "  status     - Status atual do foundation"
    echo "  help       - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  ./foundation/foundation.sh install"
    echo "  ./foundation/foundation.sh verify"
    echo "  bash foundation/foundation.sh install"
}

# Função para verificar se foundation existe
check_foundation() {
    if [ ! -f "$FOUNDATION_DIR/foundation-installer.cjs" ]; then
        echo "❌ Foundation não encontrado em: $FOUNDATION_DIR/"
        echo "💡 Certifique-se de estar na raiz do projeto ou pasta foundation"
        exit 1
    fi
}

# Função para instalar
install_foundation() {
    echo "🚀 Iniciando instalação do Foundation..."
    check_foundation
    node "$FOUNDATION_DIR/foundation-installer.cjs"
}

# Função para verificar
verify_foundation() {
    echo "🔍 Verificando estrutura do Foundation..."
    check_foundation
    if [ ! -f "$FOUNDATION_DIR/scripts/plant_foundation.cjs" ]; then
        echo "⚠️  Script plant_foundation não encontrado, execute install primeiro"
        exit 1
    fi
    node "$FOUNDATION_DIR/scripts/plant_foundation.cjs"
}

# Função para status
status_foundation() {
    echo "📊 Status do DuEuler Foundation v3.0"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ -f "$FOUNDATION_DIR/foundation-installer.cjs" ]; then
        echo "✅ Foundation Installer: Presente"
    else
        echo "❌ Foundation Installer: Ausente"
    fi
    
    if [ -f "$FOUNDATION_DIR/scripts/plant_foundation.cjs" ]; then
        echo "✅ Plant Foundation: Presente"
    else
        echo "❌ Plant Foundation: Ausente"
    fi
    
    if [ -f "$FOUNDATION_DIR/REPLIT_ORDER_EXECUTION.md" ]; then
        echo "✅ Documentação: Presente"
    else
        echo "❌ Documentação: Ausente"
    fi
    
    echo ""
    echo "🌱 Para instalar: ./foundation/foundation.sh install"
    echo "🔍 Para verificar: ./foundation/foundation.sh verify"
}

# Main
case "$1" in
    "install")
        install_foundation
        ;;
    "verify"|"check")
        verify_foundation
        ;;
    "status")
        status_foundation
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo "❌ Comando inválido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac