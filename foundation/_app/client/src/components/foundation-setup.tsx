import React, { useState } from "react";

export default function FoundationSetup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    organizationName: "",
    capacity: "small",
    adminUsername: "",
    adminEmail: "",
    adminPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    // Enviar dados para o servidor
    try {
      const response = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Foundation configurado com sucesso!");
        window.location.href = "/foundation";
      } else {
        const error = await response.text();
        alert("Erro ao configurar: " + error);
      }
    } catch (error) {
      alert("Erro de conexão: " + error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header com logo/ícone */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              duEuler Foundation v3.0
            </h1>
            <p className="text-blue-100 text-lg">
              Sistema de Gestão Empresarial Avançado
            </p>
            <div className="mt-4 inline-flex items-center bg-white/10 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              <span className="text-sm">Configuração Guiada</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Progress indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[
                { num: 1, title: "Organização", icon: "🏢" },
                { num: 2, title: "Capacidade", icon: "⚡" },
                { num: 3, title: "Administrador", icon: "👤" }
              ].map((s, idx) => (
                <div key={s.num} className="flex items-center">
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium border-2 transition-all ${
                        step >= s.num
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                          : step === s.num
                          ? "bg-blue-50 text-blue-600 border-blue-300 border-dashed"
                          : "bg-gray-100 text-gray-400 border-gray-200"
                      }`}
                    >
                      {step > s.num ? "✓" : s.icon}
                    </div>
                    <div className={`mt-2 text-xs font-medium ${
                      step >= s.num ? "text-blue-600" : "text-gray-500"
                    }`}>
                      {s.title}
                    </div>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`w-16 h-1 mx-4 transition-all ${
                        step > s.num ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Informações da Organização</h2>
                  <p className="text-gray-600">Configure os dados básicos da sua empresa</p>
                </div>
                
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
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Minha Empresa Ltda"
                    required
                  />
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                    <span className="mr-2">ℹ️</span>
                    O que você terá acesso:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">✓</span>
                      Dashboard completo de gestão
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">✓</span>
                      Sistema de usuários avançado
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">✓</span>
                      Monitoramento em tempo real
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">✓</span>
                      Relatórios e analytics
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">✓</span>
                      Backup automático de dados
                    </div>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">✓</span>
                      Suporte técnico especializado
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha a Capacidade do Sistema</h2>
                  <p className="text-gray-600">Selecione o plano ideal para sua organização</p>
                </div>
                
                <div className="space-y-4">
                  {[
                    {
                      value: "small",
                      name: "SMALL",
                      users: "10K - 50K usuários",
                      ram: "2GB RAM",
                      cpu: "2 CPU Cores",
                      storage: "50GB Storage",
                      bandwidth: "100 Mbps",
                      responseTime: "< 200ms",
                      description: "Ideal para startups e pequenas empresas",
                      features: ["Monitoramento básico", "Dashboard simplificado", "Backup diário", "Suporte via email"],
                      color: "green"
                    },
                    {
                      value: "medium",
                      name: "MEDIUM",
                      users: "50K - 200K usuários",
                      ram: "4GB RAM",
                      cpu: "4 CPU Cores", 
                      storage: "200GB Storage",
                      bandwidth: "500 Mbps",
                      responseTime: "< 150ms",
                      description: "Perfeito para empresas em crescimento",
                      features: ["Monitoramento avançado", "Analytics completo", "Backup em tempo real", "Suporte prioritário"],
                      color: "blue"
                    },
                    {
                      value: "large",
                      name: "LARGE",
                      users: "200K - 500K usuários",
                      ram: "8GB RAM",
                      cpu: "8 CPU Cores",
                      storage: "500GB Storage", 
                      bandwidth: "1 Gbps",
                      responseTime: "< 100ms",
                      description: "Para grandes organizações",
                      features: ["Monitoramento enterprise", "BI integrado", "Backup redundante", "Suporte 24/7"],
                      color: "purple"
                    },
                    {
                      value: "enterprise",
                      name: "ENTERPRISE",
                      users: "500K - 1M+ usuários",
                      ram: "16GB RAM",
                      cpu: "16 CPU Cores",
                      storage: "1TB Storage",
                      bandwidth: "10 Gbps",
                      responseTime: "< 50ms",
                      description: "Máxima performance e escalabilidade",
                      features: ["Monitoramento customizado", "ML/AI integrado", "Backup global", "Suporte dedicado"],
                      color: "red"
                    }
                  ].map((tier) => (
                    <div
                      key={tier.value}
                      className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.capacity === tier.value
                          ? "border-blue-500 bg-blue-50 shadow-lg"
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                      onClick={() => setFormData({ ...formData, capacity: tier.value })}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <input
                              type="radio"
                              name="capacity"
                              value={tier.value}
                              checked={formData.capacity === tier.value}
                              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                              className="mr-3 h-4 w-4 text-blue-600"
                            />
                            <h3 className="text-xl font-bold text-gray-900">
                              {tier.name}
                            </h3>
                            <span className="ml-3 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                              {tier.users}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-4">{tier.description}</p>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-500 mr-2">💾</span>
                              <span className="text-sm">{tier.ram}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-500 mr-2">⚡</span>
                              <span className="text-sm">{tier.cpu}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-500 mr-2">💽</span>
                              <span className="text-sm">{tier.storage}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-medium text-gray-500 mr-2">🌐</span>
                              <span className="text-sm">{tier.bandwidth}</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <span className="text-sm font-medium text-gray-500">Tempo de resposta: </span>
                            <span className="text-sm font-bold text-blue-600">{tier.responseTime}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {tier.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center text-sm text-gray-600">
                                <span className="text-green-500 mr-2">✓</span>
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuração do Administrador</h2>
                  <p className="text-gray-600">Crie a conta do administrador principal do sistema</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome de Usuário
                    </label>
                    <input
                      type="text"
                      value={formData.adminUsername}
                      onChange={(e) =>
                        setFormData({ ...formData, adminUsername: e.target.value })
                      }
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="admin"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, adminEmail: e.target.value })
                      }
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="admin@empresa.com"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha
                    </label>
                    <input
                      type="password"
                      value={formData.adminPassword}
                      onChange={(e) =>
                        setFormData({ ...formData, adminPassword: e.target.value })
                      }
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Digite uma senha segura"
                      required
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-yellow-600 mr-2">⚠️</span>
                    <div>
                      <h3 className="font-medium text-yellow-800 mb-1">Importante</h3>
                      <p className="text-sm text-yellow-700">
                        Guarde essas credenciais em local seguro. Você precisará delas para acessar o sistema após a instalação.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Voltar
                </button>
              )}
              
              <button
                type="submit"
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  step < 3
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                } ${step === 1 ? "ml-auto" : ""}`}
                disabled={
                  (step === 1 && !formData.organizationName) ||
                  (step === 3 && (!formData.adminUsername || !formData.adminEmail || !formData.adminPassword))
                }
              >
                {step < 3 ? "Próximo" : "Instalar Foundation"}
              </button>
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
    </div>
  );
}