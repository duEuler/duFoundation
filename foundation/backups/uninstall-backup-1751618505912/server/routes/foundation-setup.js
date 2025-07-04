// Foundation Setup Route - Auto-gerado (ES Modules)
import express from 'express';
const router = express.Router();

// Rota principal do Foundation Setup - Serve o wizard diretamente
router.get('/foundation/setup', (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Foundation Setup Wizard</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; background: #f8fafc; }
    .wizard { max-width: 800px; margin: 40px auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
    .content { padding: 30px; }
    .step { display: none; }
    .step.active { display: block; }
    .btn { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; margin: 10px 5px; }
    .btn:hover { background: #2563eb; }
    .btn:disabled { background: #9ca3af; cursor: not-allowed; }
    .form-group { margin: 20px 0; }
    .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; }
    .progress { background: #e5e7eb; height: 6px; border-radius: 3px; margin: 20px 0; }
    .progress-bar { background: #3b82f6; height: 100%; border-radius: 3px; transition: width 0.3s; }
    .capacity-option { border: 1px solid #d1d5db; padding: 20px; margin: 10px 0; border-radius: 8px; cursor: pointer; }
    .capacity-option:hover { border-color: #3b82f6; background: #eff6ff; }
    .capacity-option.selected { border-color: #3b82f6; background: #dbeafe; }
  </style>
</head>
<body>
  <div class="wizard">
    <div class="header">
      <h1>🌟 Foundation v3.0 Setup Wizard</h1>
      <p>Configure seu sistema Foundation passo a passo</p>
      <div class="progress">
        <div class="progress-bar" id="progressBar" style="width: 25%"></div>
      </div>
    </div>
    
    <div class="content">
      <!-- Passo 1: Organização -->
      <div class="step active" id="step1">
        <h2>📋 Informações da Organização</h2>
        <div class="form-group">
          <label>Nome da Organização:</label>
          <input type="text" id="orgName" placeholder="Ex: Minha Empresa LTDA" />
        </div>
        <div class="form-group">
          <label>Departamento:</label>
          <input type="text" id="department" placeholder="Ex: TI, Desenvolvimento" />
        </div>
        <button class="btn" onclick="nextStep()">Próximo →</button>
      </div>

      <!-- Passo 2: Capacidade -->
      <div class="step" id="step2">
        <h2>⚡ Selecione a Capacidade</h2>
        <div class="capacity-option" onclick="selectCapacity('small')">
          <h3>🏢 SMALL (Recomendado)</h3>
          <p><strong>10K-50K usuários</strong> | 4GB RAM | 4 cores</p>
          <p>Ideal para pequenas e médias empresas</p>
        </div>
        <div class="capacity-option" onclick="selectCapacity('medium')">
          <h3>🏭 MEDIUM</h3>
          <p><strong>50K-200K usuários</strong> | 8GB RAM | 6 cores</p>
          <p>Para empresas em crescimento</p>
        </div>
        <div class="capacity-option" onclick="selectCapacity('large')">
          <h3>🌐 LARGE</h3>
          <p><strong>200K-500K usuários</strong> | 16GB RAM | 8 cores</p>
          <p>Para grandes corporações</p>
        </div>
        <button class="btn" onclick="prevStep()">← Anterior</button>
        <button class="btn" onclick="nextStep()" id="capacityNext" disabled>Próximo →</button>
      </div>

      <!-- Passo 3: Finalização -->
      <div class="step" id="step3">
        <h2>🚀 Finalizar Instalação</h2>
        <div id="summary"></div>
        <button class="btn" onclick="prevStep()">← Anterior</button>
        <button class="btn" onclick="installFoundation()">🎯 Instalar Foundation</button>
      </div>

      <!-- Passo 4: Conclusão -->
      <div class="step" id="step4">
        <h2>✅ Instalação Concluída!</h2>
        <p>Foundation v3.0 foi instalado com sucesso!</p>
        <button class="btn" onclick="window.location.reload()">🏠 Ir para Dashboard</button>
      </div>
    </div>
  </div>

  <script type="text/babel">
    let currentStep = 1;
    let selectedCapacity = '';
    let formData = {};

    function nextStep() {
      if (currentStep === 1) {
        formData.orgName = document.getElementById('orgName').value;
        formData.department = document.getElementById('department').value;
        if (!formData.orgName) {
          alert('Por favor, preencha o nome da organização');
          return;
        }
      }
      
      if (currentStep === 2 && !selectedCapacity) {
        alert('Por favor, selecione uma capacidade');
        return;
      }

      if (currentStep === 2) {
        // Atualizar resumo
        document.getElementById('summary').innerHTML = \`
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            <h3>📋 Resumo da Configuração:</h3>
            <p><strong>Organização:</strong> \${formData.orgName}</p>
            <p><strong>Departamento:</strong> \${formData.department}</p>
            <p><strong>Capacidade:</strong> \${selectedCapacity.toUpperCase()}</p>
          </div>
        \`;
      }

      document.getElementById(\`step\${currentStep}\`).classList.remove('active');
      currentStep++;
      document.getElementById(\`step\${currentStep}\`).classList.add('active');
      
      // Atualizar progress bar
      const progress = (currentStep / 4) * 100;
      document.getElementById('progressBar').style.width = progress + '%';
    }

    function prevStep() {
      document.getElementById(\`step\${currentStep}\`).classList.remove('active');
      currentStep--;
      document.getElementById(\`step\${currentStep}\`).classList.add('active');
      
      // Atualizar progress bar
      const progress = (currentStep / 4) * 100;
      document.getElementById('progressBar').style.width = progress + '%';
    }

    function selectCapacity(capacity) {
      selectedCapacity = capacity;
      
      // Remove previous selection
      document.querySelectorAll('.capacity-option').forEach(el => {
        el.classList.remove('selected');
      });
      
      // Add selection to clicked option
      event.currentTarget.classList.add('selected');
      
      // Enable next button
      document.getElementById('capacityNext').disabled = false;
    }

    async function installFoundation() {
      try {
        const response = await fetch('/api/foundation/install', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            capacity: selectedCapacity,
            organization: formData.orgName,
            department: formData.department,
            quickSetup: true
          })
        });

        if (response.ok) {
          nextStep();
        } else {
          alert('Erro na instalação. Tente novamente.');
        }
      } catch (error) {
        alert('Erro na comunicação com o servidor');
      }
    }
  </script>
</body>
</html>
  `;
  
  res.send(html);
});

export default router;