import React, { useState, useEffect } from "react";

// Aplicação "virgem" que detecta Foundation e oferece acesso
function WelcomePage() {
  const [foundationDetected, setFoundationDetected] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkFoundation();
  }, []);

  const checkFoundation = async () => {
    try {
      // Verificar se Foundation está instalado
      const response = await fetch('/api/foundation/status');
      if (response.ok) {
        setFoundationDetected(true);
      }
    } catch (error) {
      console.log('Foundation não detectado');
    } finally {
      setChecking(false);
    }
  };

  const redirectToFoundation = () => {
    console.log('Redirecionando para Foundation');
    window.location.href = '/foundation/setup';
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        {/* Logo/Ícone */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        </div>

        {foundationDetected ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Bem-vindo!
            </h1>
            <p className="text-gray-600 mb-6">
              duEuler Foundation v3.0 detectado e pronto para uso.
            </p>
            <button
              onClick={redirectToFoundation}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Acessar Foundation
            </button>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Sistema Pronto
            </h1>
            <p className="text-gray-600 mb-6">
              Seu projeto está configurado e pronto para desenvolvimento.
              Para instalar o duEuler Foundation v3.0, execute o comando de instalação.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <code className="text-sm text-gray-800">
                ./foundation/foundation-installer.cjs
              </code>
            </div>
            <p className="text-sm text-gray-500">
              O Foundation adiciona sistema de gestão empresarial completo
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  // Detecta se deve mostrar a página de configuração do Foundation
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get('page');
  
  if (page === 'foundation-setup') {
    // Redirecionar para o Foundation App
    window.location.href = '/foundation/setup';
    return null;
  }
  
  return <WelcomePage />;
}

export default App;
