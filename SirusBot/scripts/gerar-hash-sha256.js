const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Diretórios e arquivos a incluir no hash
const includePatterns = [
  'app/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  'lib/**/*.{ts,tsx,js,jsx}',
  'services/**/*.{ts,tsx,js,jsx}',
  'contexts/**/*.{ts,tsx,js,jsx}',
  'hooks/**/*.{ts,tsx,js,jsx}',
  'types/**/*.{ts,tsx,js,jsx}',
  'middleware.ts',
  'next.config.mjs',
  'tailwind.config.ts',
  'tsconfig.json',
  'package.json',
  'drizzle.config.ts'
];

// Diretórios a excluir
const excludeDirs = ['node_modules', '.next', 'dist', 'build', 'uploads', '.git'];

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    // Verifica se deve excluir
    if (excludeDirs.some(dir => filePath.includes(dir))) {
      return;
    }

    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      // Inclui apenas arquivos de código fonte
      const ext = path.extname(file);
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs'].includes(ext)) {
        arrayOfFiles.push(filePath);
      }
    }
  });

  return arrayOfFiles;
}

function generateHash() {
  const rootDir = path.join(__dirname, '..');
  
  console.log('🔍 Coletando arquivos de código fonte...\n');
  
  // Coleta todos os arquivos relevantes
  let files = getAllFiles(rootDir);
  
  // Filtra apenas arquivos importantes (não inclui tests, scripts de setup, etc)
  files = files.filter(file => {
    const relativePath = path.relative(rootDir, file);
    return (
      relativePath.startsWith('app' + path.sep) ||
      relativePath.startsWith('components' + path.sep) ||
      relativePath.startsWith('lib' + path.sep) ||
      relativePath.startsWith('services' + path.sep) ||
      relativePath.startsWith('contexts' + path.sep) ||
      relativePath.startsWith('hooks' + path.sep) ||
      relativePath.startsWith('types' + path.sep) ||
      relativePath === 'middleware.ts' ||
      relativePath === 'next.config.mjs' ||
      relativePath === 'tailwind.config.ts' ||
      relativePath === 'tsconfig.json' ||
      relativePath === 'package.json' ||
      relativePath === 'drizzle.config.ts'
    );
  });
  
  // Ordena alfabeticamente para garantir consistência
  files.sort();
  
  console.log(`📁 Total de arquivos: ${files.length}\n`);
  
  // Cria hash concatenando conteúdo de todos os arquivos
  const hash = crypto.createHash('sha256');
  
  files.forEach(file => {
    const relativePath = path.relative(rootDir, file);
    const content = fs.readFileSync(file, 'utf8');
    
    // Adiciona caminho do arquivo e conteúdo ao hash
    hash.update(relativePath);
    hash.update(content);
    
    console.log(`  ✓ ${relativePath}`);
  });
  
  const finalHash = hash.digest('hex');
  
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMO DIGITAL (HASH SHA256) DA APLICAÇÃO');
  console.log('='.repeat(70));
  console.log('\nHASH SHA256:');
  console.log(finalHash.toUpperCase());
  console.log('\n' + '='.repeat(70));
  console.log(`\n📅 Data de geração: ${new Date().toLocaleString('pt-BR')}`);
  console.log(`📦 Total de arquivos processados: ${files.length}`);
  
  // Salva em arquivo
  const outputPath = path.join(rootDir, 'HASH_SHA256.txt');
  const output = `RESUMO DIGITAL (HASH SHA256) - SISTEMA RESTAURANTE UNIFESSPA
${'='.repeat(70)}

HASH SHA256: ${finalHash.toUpperCase()}

Data de geração: ${new Date().toLocaleString('pt-BR')}
Total de arquivos processados: ${files.length}

LISTA DE ARQUIVOS PROCESSADOS:
${files.map((f, i) => `${i + 1}. ${path.relative(rootDir, f)}`).join('\n')}

${'='.repeat(70)}

Este hash representa a assinatura digital única do código fonte da aplicação
no momento da geração. Qualquer modificação no código resultará em um hash
diferente, garantindo a integridade e autenticidade do software.

USO:
- Registro de propriedade intelectual
- Controle de versão
- Verificação de integridade
- Documentação oficial
`;
  
  fs.writeFileSync(outputPath, output);
  console.log(`\n💾 Hash salvo em: HASH_SHA256.txt`);
  console.log('\n✅ Processo concluído com sucesso!\n');
  
  return finalHash;
}

try {
  generateHash();
} catch (error) {
  console.error('❌ Erro ao gerar hash:', error.message);
  process.exit(1);
}





