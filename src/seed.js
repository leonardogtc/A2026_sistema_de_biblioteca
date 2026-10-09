const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const prisma = require('./prisma');

async function seed() {
  console.log('Iniciando carga de dados de teste (Seed)...');

  // 1. Carregar imagem binária do avatar
  const avatarPath = path.join(__dirname, 'avatar_test.png');
  const fotoBuffer = fs.readFileSync(avatarPath);

  // 2. Criar ou atualizar Usuário de Teste
  const senhaHash = await bcrypt.hash('admin123', 10);

  const usuario = await prisma.usuario.upsert({
    where: { email: 'admin@biblioteca.com' },
    update: {
      senha: senhaHash,
      foto: fotoBuffer,
      fotoMimeType: 'image/png',
      status: 'ATIVO'
    },
    create: {
      nome: 'Maria Silva',
      email: 'admin@biblioteca.com',
      senha: senhaHash,
      cpf: '111.222.333-44',
      telefone: '(11) 98765-4321',
      status: 'ATIVO',
      foto: fotoBuffer,
      fotoMimeType: 'image/png'
    }
  });

  console.log(`✓ Usuário de teste criado/atualizado: ${usuario.nome} (${usuario.email})`);

  // 3. Categorias de exemplo
  const catTec = await prisma.categoria.upsert({
    where: { nome: 'Tecnologia & Computação' },
    update: {},
    create: { nome: 'Tecnologia & Computação', descricao: 'Livros de programação, engenharia de software e banco de dados' }
  });

  const catLit = await prisma.categoria.upsert({
    where: { nome: 'Literatura Brasileira' },
    update: {},
    create: { nome: 'Literatura Brasileira', descricao: 'Clássicos da literatura nacional' }
  });

  const catFic = await prisma.categoria.upsert({
    where: { nome: 'Ficção Científica' },
    update: {},
    create: { nome: 'Ficção Científica', descricao: 'Narrativas de ficção científica e futurismo' }
  });

  console.log('✓ Categorias criadas');

  // 4. Autores de exemplo
  const autorMartin = await prisma.autor.create({
    data: { nome: 'Robert C. Martin', nacionalidade: 'Norte-Americano' }
  }).catch(() => null);

  const autorMachado = await prisma.autor.create({
    data: { nome: 'Machado de Assis', nacionalidade: 'Brasileiro' }
  }).catch(() => null);

  const autorAsimov = await prisma.autor.create({
    data: { nome: 'Isaac Asimov', nacionalidade: 'Russo-Americano' }
  }).catch(() => null);

  console.log('✓ Autores cadastrados');

  // 5. Livros de exemplo
  const livroClean = await prisma.livro.upsert({
    where: { isbn: '9780132350884' },
    update: {},
    create: {
      titulo: 'Código Limpo (Clean Code)',
      subtitulo: 'Habilidades Práticas do Agile Software',
      isbn: '9780132350884',
      anoPublicacao: 2008,
      edicao: 1,
      editora: 'Alta Books',
      categoriaId: catTec.id,
      quantidadeTotal: 5,
      quantidadeDisponivel: 4
    }
  });

  const livroDom = await prisma.livro.upsert({
    where: { isbn: '9788535914849' },
    update: {},
    create: {
      titulo: 'Dom Casmurro',
      subtitulo: 'Edição Comentada',
      isbn: '9788535914849',
      anoPublicacao: 1899,
      edicao: 3,
      editora: 'Companhia das Letras',
      categoriaId: catLit.id,
      quantidadeTotal: 3,
      quantidadeDisponivel: 3
    }
  });

  const livroFund = await prisma.livro.upsert({
    where: { isbn: '9788576571552' },
    update: {},
    create: {
      titulo: 'Fundação',
      subtitulo: 'Trilogia da Fundação - Livro 1',
      isbn: '9788576571552',
      anoPublicacao: 1951,
      edicao: 2,
      editora: 'Aleph',
      categoriaId: catFic.id,
      quantidadeTotal: 4,
      quantidadeDisponivel: 3
    }
  });

  // Vincular autores aos livros
  if (autorMartin) {
    await prisma.livroAutor.create({ data: { livroId: livroClean.id, autorId: autorMartin.id } }).catch(() => null);
  }
  if (autorMachado) {
    await prisma.livroAutor.create({ data: { livroId: livroDom.id, autorId: autorMachado.id } }).catch(() => null);
  }
  if (autorAsimov) {
    await prisma.livroAutor.create({ data: { livroId: livroFund.id, autorId: autorAsimov.id } }).catch(() => null);
  }

  console.log('✓ Livros e associações criados');

  // 6. Criar um leitor e empréstimo de exemplo
  const leitor = await prisma.usuario.upsert({
    where: { email: 'joao.leitor@email.com' },
    update: {},
    create: {
      nome: 'João Santos',
      email: 'joao.leitor@email.com',
      senha: await bcrypt.hash('leitor123', 10),
      cpf: '222.333.444-55',
      telefone: '(11) 97777-8888',
      status: 'ATIVO'
    }
  });

  const dataHoje = new Date();
  const dataDev = new Date();
  dataDev.setDate(dataHoje.getDate() + 14);

  await prisma.emprestimo.create({
    data: {
      usuarioId: leitor.id,
      livroId: livroClean.id,
      dataEmprestimo: dataHoje,
      dataPrevistaDevolucao: dataDev,
      status: 'EM_ANDAMENTO',
      observacoes: 'Primeiro empréstimo do semestre'
    }
  }).catch(() => null);

  console.log('✓ Dados de empréstimo criados');
  console.log('\n--- SEED FINALIZADO COM SUCESSO ---');
  console.log('Credenciais para login:');
  console.log('E-mail: admin@biblioteca.com');
  console.log('Senha:  admin123');
}

seed()
  .catch((err) => {
    console.error('Erro ao executar seed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
