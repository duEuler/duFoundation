import React, { useState } from "react";

export default function FoundationSetupSimple() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    organizationName: "",
    environment: "development" as "development" | "staging" | "production",
    capacity: "small",
    adminUsername: "",
    adminEmail: "",
    adminPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          setupPassword: "dueuler2024",
          foundationCapacity: formData.capacity,
          maxConcurrentUsers: formData.capacity === "small" ? 10000 : 100000,
          cacheTTL: 3600,
          wizard: true,
        }),
      });

      if (response.ok) {
        alert("Foundation configurado com sucesso!");
        window.location.href = "/";
      } else {
        const error = await response.json();
        alert("Erro: " + error.message);
      }
    } catch (error) {
      alert("Erro de conexão: " + error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Configuração do duEuler Foundation v3.0
          </h1>
          <p className="text-gray-600">
            Configure seu sistema de gestão empresarial
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= num ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {num}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600 text-center">
            {step === 1 && "Informações da Organização"}
            {step === 2 && "Configuração do Sistema"}
            {step === 3 && "Criação do Administrador"}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Organização
                </label>
                <input
                  type="text"
                  value={formData.organizationName}
                  onChange={(e) =>
                    setFormData({ ...formData, organizationName: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ambiente
                </label>
                <select
                  value={formData.environment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      environment: e.target.value as "development" | "staging" | "production",
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="development">Desenvolvimento</option>
                  <option value="staging">Testes</option>
                  <option value="production">Produção</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidade do Sistema
                </label>
                <select
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                >
                  <option value="small">Small (até 50K usuários)</option>
                  <option value="medium">Medium (até 200K usuários)</option>
                  <option value="large">Large (até 500K usuários)</option>
                  <option value="enterprise">Enterprise (1M+ usuários)</option>
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Recursos inclusos:
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Monitoramento em tempo real</li>
                  <li>• Sistema de autenticação avançado</li>
                  <li>• Dashboard analítico</li>
                  <li>• Backup automático</li>
                </ul>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome de usuário do administrador
                </label>
                <input
                  type="text"
                  value={formData.adminUsername}
                  onChange={(e) =>
                    setFormData({ ...formData, adminUsername: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email do administrador
                </label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, adminEmail: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha do administrador
                </label>
                <input
                  type="password"
                  value={formData.adminPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, adminPassword: e.target.value })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Voltar
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-auto"
                disabled={
                  (step === 1 && !formData.organizationName) ||
                  (step === 2 && !formData.capacity)
                }
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 ml-auto"
                disabled={
                  !formData.adminUsername ||
                  !formData.adminEmail ||
                  !formData.adminPassword
                }
              >
                Instalar Foundation
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => (window.location.href = "/")}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancelar e voltar
          </button>
        </div>
      </div>
    </div>
  );
}