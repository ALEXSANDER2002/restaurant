// Script para testar e debugar o login facial
console.log('🧪 Testando sistema de login facial...')

// Simular dados faciais para teste
function simulateFacialData() {
  const testEmail = 'admin@unifesspa.edu.br'
  const testDescriptor = new Float32Array(128).fill(0.5) // Descritor fake para teste
  
  // Salvar no localStorage (simulando cadastro)
  localStorage.setItem(`face_descriptor_${testEmail}`, JSON.stringify(Array.from(testDescriptor)))
  
  console.log(`✅ Dados faciais simulados salvos para: ${testEmail}`)
  console.log(`📊 Descritor: ${testDescriptor.length} dimensões`)
  
  return testEmail
}

// Verificar usuários cadastrados
function checkRegisteredUsers() {
  const users = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('face_descriptor_')) {
      const email = key.replace('face_descriptor_', '')
      users.push(email)
    }
  }
  
  console.log(`👥 Usuários com dados faciais: ${users.length}`)
  users.forEach(user => console.log(`  - ${user}`))
  
  return users
}

// Testar comparação de descritores
function testDescriptorComparison() {
  const descriptor1 = new Float32Array(128).fill(0.5)
  const descriptor2 = new Float32Array(128).fill(0.5)
  const descriptor3 = new Float32Array(128).fill(0.8)
  
  // Simular função de distância euclidiana
  function euclideanDistance(desc1, desc2) {
    let sum = 0
    for (let i = 0; i < desc1.length; i++) {
      sum += Math.pow(desc1[i] - desc2[i], 2)
    }
    return Math.sqrt(sum)
  }
  
  const distance1 = euclideanDistance(descriptor1, descriptor2)
  const distance2 = euclideanDistance(descriptor1, descriptor3)
  
  console.log(`🔍 Teste de comparação:`)
  console.log(`  - Descritores idênticos: ${distance1.toFixed(4)} (deveria ser ~0)`)
  console.log(`  - Descritores diferentes: ${distance2.toFixed(4)} (deveria ser >0.6)`)
  
  return { distance1, distance2 }
}

// Executar testes
console.log('='.repeat(50))
simulateFacialData()
checkRegisteredUsers()
testDescriptorComparison()
console.log('='.repeat(50))
console.log('✅ Testes concluídos! Agora teste o login facial na interface.') 