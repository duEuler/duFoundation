import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface UserLevelSelectorProps {
  onLevelSelect: (level: 'beginner' | 'developer' | 'expert') => void;
}

export function UserLevelSelector({ onLevelSelect }: UserLevelSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const levels = [
    {
      id: 'beginner',
      title: 'Quero usar rapidamente',
      icon: '🎯',
      description: 'Interface simples, instalação automática em poucos cliques',
      features: ['Setup em 5 minutos', 'Interface visual', 'Sem comandos técnicos'],
      difficulty: 'Fácil',
      recommended: 'Para usuários finais'
    },
    {
      id: 'developer',
      title: 'Quero personalizar',
      icon: '⚙️',
      description: 'Acesso a configurações e customizações básicas',
      features: ['CLI simplificado', 'Configurações personalizadas', 'Documentação direcionada'],
      difficulty: 'Médio',
      recommended: 'Para desenvolvedores'
    },
    {
      id: 'expert',
      title: 'Quero controle total',
      icon: '🔧',
      description: 'Acesso completo a todos os recursos e subsistemas',
      features: ['15 subsistemas completos', '2.825 arquivos', 'APIs avançadas'],
      difficulty: 'Avançado',
      recommended: 'Para especialistas'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Avançado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Foundation v3.0</h1>
        <h2 className="text-2xl text-gray-600 mb-2">Como você quer usar o Foundation?</h2>
        <p className="text-gray-500">Escolha o nível que melhor se adapta às suas necessidades</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {levels.map((level) => (
          <Card 
            key={level.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedLevel === level.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
            }`}
            onClick={() => setSelectedLevel(level.id)}
          >
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">{level.icon}</div>
              <CardTitle className="text-xl">{level.title}</CardTitle>
              <CardDescription className="text-sm">{level.description}</CardDescription>
              <div className="flex justify-center gap-2 mt-2">
                <Badge className={getDifficultyColor(level.difficulty)}>
                  {level.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {level.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-600">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 italic">{level.recommended}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedLevel && (
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => onLevelSelect(selectedLevel as 'beginner' | 'developer' | 'expert')}
            className="px-8 py-3"
          >
            Continuar com {levels.find(l => l.id === selectedLevel)?.title}
          </Button>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Você pode sempre mudar o nível de acesso posteriormente</p>
      </div>
    </div>
  );
}