/**
 * duEuler Foundation v3.0 - Configuration Manager
 * Manages capacity-based system configurations
 */

export interface FoundationCapacityConfig {
  capacity: string;
  userRange: { min: number; max: number };
  resources: {
    ramMB: number;
    cpuCores: number;
    storageGB: number;
    bandwidthMbps: number;
  };
  performance: {
    responseTimeTargetMs: number;
    throughputRps: number;
    availabilityTarget: number;
    errorRateThreshold: number;
  };
  monitoring: {
    scrapeInterval: string;
    retentionDays: number;
    alertThresholds: {
      cpuPercent: number;
      memoryPercent: number;
      responseTimeMs: number;
    };
  };
  description: string;
  useCases: string[];
}

export const FOUNDATION_CONFIGS: Record<string, FoundationCapacityConfig> = {
  nano: {
    capacity: "nano",
    userRange: { min: 1, max: 1000 },
    resources: {
      ramMB: 512,
      cpuCores: 1,
      storageGB: 10,
      bandwidthMbps: 25
    },
    performance: {
      responseTimeTargetMs: 200,
      throughputRps: 50,
      availabilityTarget: 99.0,
      errorRateThreshold: 2.0
    },
    monitoring: {
      scrapeInterval: "60s",
      retentionDays: 3,
      alertThresholds: {
        cpuPercent: 85,
        memoryPercent: 90,
        responseTimeMs: 1000
      }
    },
    description: "Ideal para pequenos consultórios e negócios individuais",
    useCases: ["Dentista", "Advogado", "Freelancer", "Pequeno Comércio"]
  },
  
  micro: {
    capacity: "micro",
    userRange: { min: 1000, max: 10000 },
    resources: {
      ramMB: 1024,
      cpuCores: 1,
      storageGB: 25,
      bandwidthMbps: 50
    },
    performance: {
      responseTimeTargetMs: 150,
      throughputRps: 100,
      availabilityTarget: 99.5,
      errorRateThreshold: 1.5
    },
    monitoring: {
      scrapeInterval: "45s",
      retentionDays: 5,
      alertThresholds: {
        cpuPercent: 80,
        memoryPercent: 85,
        responseTimeMs: 750
      }
    },
    description: "Perfeito para clínicas e escritórios pequenos",
    useCases: ["Clínica Médica", "Escritório Contábil", "Agência Pequena", "Loja Online"]
  },
  
  small: {
    capacity: "small",
    userRange: { min: 10000, max: 50000 },
    resources: {
      ramMB: 2048,
      cpuCores: 2,
      storageGB: 50,
      bandwidthMbps: 100
    },
    performance: {
      responseTimeTargetMs: 100,
      throughputRps: 500,
      availabilityTarget: 99.5,
      errorRateThreshold: 1.0
    },
    monitoring: {
      scrapeInterval: "30s",
      retentionDays: 7,
      alertThresholds: {
        cpuPercent: 75,
        memoryPercent: 80,
        responseTimeMs: 500
      }
    },
    description: "Ideal para startups e empresas regionais",
    useCases: ["Startup", "Empresa Regional", "E-commerce Médio", "SaaS Inicial"]
  },
  
  medium: {
    capacity: "medium",
    userRange: { min: 50000, max: 200000 },
    resources: {
      ramMB: 4096,
      cpuCores: 4,
      storageGB: 100,
      bandwidthMbps: 200
    },
    performance: {
      responseTimeTargetMs: 75,
      throughputRps: 1000,
      availabilityTarget: 99.7,
      errorRateThreshold: 0.8
    },
    monitoring: {
      scrapeInterval: "15s",
      retentionDays: 14,
      alertThresholds: {
        cpuPercent: 70,
        memoryPercent: 75,
        responseTimeMs: 300
      }
    },
    description: "Adequado para empresas de médio porte",
    useCases: ["Empresa Média", "E-commerce Grande", "SaaS Crescimento", "Instituição Educacional"]
  },
  
  large: {
    capacity: "large",
    userRange: { min: 200000, max: 1000000 },
    resources: {
      ramMB: 8192,
      cpuCores: 8,
      storageGB: 250,
      bandwidthMbps: 500
    },
    performance: {
      responseTimeTargetMs: 50,
      throughputRps: 2500,
      availabilityTarget: 99.9,
      errorRateThreshold: 0.5
    },
    monitoring: {
      scrapeInterval: "10s",
      retentionDays: 30,
      alertThresholds: {
        cpuPercent: 65,
        memoryPercent: 70,
        responseTimeMs: 200
      }
    },
    description: "Para grandes empresas e organizações",
    useCases: ["Grande Empresa", "Marketplace", "SaaS Maduro", "Governo", "Hospital"]
  },
  
  enterprise: {
    capacity: "enterprise",
    userRange: { min: 1000000, max: 10000000 },
    resources: {
      ramMB: 16384,
      cpuCores: 16,
      storageGB: 500,
      bandwidthMbps: 1000
    },
    performance: {
      responseTimeTargetMs: 25,
      throughputRps: 5000,
      availabilityTarget: 99.95,
      errorRateThreshold: 0.2
    },
    monitoring: {
      scrapeInterval: "5s",
      retentionDays: 90,
      alertThresholds: {
        cpuPercent: 60,
        memoryPercent: 65,
        responseTimeMs: 100
      }
    },
    description: "Para corporações e aplicações críticas",
    useCases: ["Corporação", "Banco", "Telecom", "Cloud Provider", "Rede Social"]
  }
};

export function getFoundationConfig(capacity: string): FoundationCapacityConfig {
  const config = FOUNDATION_CONFIGS[capacity];
  if (!config) {
    throw new Error(`Capacidade da Foundation não encontrada: ${capacity}`);
  }
  return config;
}

export function validateCapacityForUsers(capacity: string, maxUsers: number): boolean {
  const config = getFoundationConfig(capacity);
  return maxUsers >= config.userRange.min && maxUsers <= config.userRange.max;
}

export function suggestCapacityForUsers(maxUsers: number): string {
  for (const [capacity, config] of Object.entries(FOUNDATION_CONFIGS)) {
    if (maxUsers >= config.userRange.min && maxUsers <= config.userRange.max) {
      return capacity;
    }
  }
  return "enterprise"; // Fallback para números muito grandes
}

export function getCapacityRecommendations(currentCapacity: string) {
  const config = getFoundationConfig(currentCapacity);
  const capacities = Object.keys(FOUNDATION_CONFIGS);
  const currentIndex = capacities.indexOf(currentCapacity);
  
  return {
    current: config,
    previous: currentIndex > 0 ? FOUNDATION_CONFIGS[capacities[currentIndex - 1]] : null,
    next: currentIndex < capacities.length - 1 ? FOUNDATION_CONFIGS[capacities[currentIndex + 1]] : null,
    upgradePath: capacities.slice(currentIndex + 1)
  };
}