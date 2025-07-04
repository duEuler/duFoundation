import React, { useState, useEffect } from "react";
import FoundationSetupSimple from "./foundation-setup-simple";

// Aplicação "virgem" que funciona independentemente do Foundation
function WelcomePage() {
  const [foundationStatus, setFoundationStatus] = useState<'checking' | 'available' | 'not-found'>('checking');

  useEffect(() => {
    checkFoundationStatus();
  }, []);

  const checkFoundationStatus = async () => {
    try {
      // Verificar se o Foundation está disponível
      const response = await fetch('/foundation/api/status');
      if (response.ok) {
        setFoundationStatus('available');
      } else {
        setFoundationStatus('not-found');
      }
    } catch (error) {
      setFoundationStatus('not-found');
    }
  };

  const redirectToFoundation = () => {
    console.log('Redirecionando para /foundation/setup');
    // Tentar múltiplas formas de redirecionamento
    try {
      window.location.href = '/foundation/setup';
    } catch (error) {
      console.error('Erro no redirecionamento:', error);
      window.open('/foundation/setup', '_self');
    }
  };

  if (foundationStatus === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sistema...</p>
        </div>
      </div>
    );
  }

  if (foundationStatus === 'available') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Foundation Disponível</h1>
            <p className="text-gray-600">O sistema Foundation v3.0 foi detectado e está pronto para uso.</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={redirectToFoundation}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Acessar Foundation
            </button>
            
            <p className="text-sm text-gray-500">
              Ou acesse diretamente: <a href="/foundation/setup" className="text-blue-600 underline hover:text-blue-800">/foundation/setup</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Projeto Base</h1>
          <p className="text-gray-600 mb-6">
            Este é um projeto base preparado para integração com o duEuler Foundation v3.0.
            O Foundation não foi instalado ainda.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-yellow-800 mb-2">Para instalar o Foundation:</h3>
            <code className="text-sm text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
              node foundation/foundation-installer.cjs
            </code>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>O Foundation v3.0 oferece:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Gestão empresarial completa</li>
              <li>Monitoramento em tempo real</li>
              <li>Sistema de capacidades flexível</li>
              <li>Interface web integrada</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  // Detecta se deve mostrar a página de configuração do Foundation
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  
  if (page === 'foundation-setup') {
    return <FoundationSetupSimple />;
  }
  
  return <WelcomePage />;
}

export default App;
