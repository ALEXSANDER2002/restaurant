// Script para testar cookies no navegador
console.log('🍪 Testando cookies...')

// Função para verificar cookies
function checkCookies() {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=')
    acc[name] = value
    return acc
  }, {})
  
  console.log('📋 Cookies encontrados:', Object.keys(cookies))
  
  if (cookies.token) {
    console.log('✅ Token encontrado:', cookies.token.substring(0, 20) + '...')
    
    // Decodificar payload do JWT
    try {
      const payload = JSON.parse(atob(cookies.token.split('.')[1]))
      console.log('👤 Payload do token:', payload)
    } catch (e) {
      console.log('❌ Erro ao decodificar token:', e.message)
    }
  } else {
    console.log('❌ Token não encontrado nos cookies')
  }
  
  return cookies
}

// Função para simular login facial
async function testFacialLogin() {
  console.log('🧪 Testando login facial...')
  
  try {
    const response = await fetch('/api/login-facial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@unifesspa.edu.br' }),
      credentials: 'include'
    })
    
    console.log('📡 Status da resposta:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Resposta da API:', data)
      
      // Verificar cookies após a resposta
      setTimeout(() => {
        console.log('🔍 Verificando cookies após login...')
        checkCookies()
      }, 100)
    } else {
      const error = await response.json()
      console.log('❌ Erro na API:', error)
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error)
  }
}

// Executar testes
checkCookies()

// Instruções para o usuário
console.log('📝 Para testar login facial, execute: testFacialLogin()')

// Tornar função disponível globalmente
window.testFacialLogin = testFacialLogin
window.checkCookies = checkCookies 