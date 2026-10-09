### Como conectar agora no pgAdmin
  1. Acesse o pgAdmin no navegador: http://localhost:15432
  2. Faça login:
      • E-mail: admin@admin.com
      • Senha: admin
  3. Clique com o botão direito em Servers > Register > Server...:
      • Aba General:
	  • Name: Biblioteca (ou outro nome que preferir)
      • Aba Connection:
	  • Host name/address: bibliotecadb
	  • Port: 5432
	  • Maintenance database: biblioteca
	  • Username: postgres
	  • Password: postgres

O Prisma foi configurado com sucesso e integrado ao PostgreSQL do projeto!
  ──────
  ### O que foi feito:
  1. Instalação dos pacotes:
      • prisma (CLI para gerenciar schemas e migrations)
      • @prisma/client, @prisma/adapter-pg e pg (driver oficial para conexão no Node.js)
      • dotenv (carregamento das variáveis de ambiente)
  2. Configuração da Conexão:
      • Criado o arquivo .env apontando para o container Docker:

      DATABASE_URL="postgresql://postgres:postgres@localhost:5432/biblioteca?schema=public"
  3. Criação do Schema e Modelos Iniciais:
      • No arquivo schema.prisma, foram criados os modelos iniciais do sistema de
      biblioteca:
          • Livro (título, autor, ISBN, disponibilidade, datas)
          • Usuario (nome, e-mail único, telefone)
          • Emprestimo (relacionamento entre usuário e livro)
  4. Execução da Primeira Migration:
      • Executamos npx prisma migrate dev --name init.
      • O Prisma gerou o arquivo SQL migration.sql e criou automaticamente todas as tabelas,
      chaves primárias, índices e foreign keys no PostgreSQL.
  5. Instância do Cliente:
      • Criado o arquivo prisma.js pronto para ser importado em qualquer rota do Express.
      Conexão testada e validada com sucesso!

──────
  ### Como usar no seu dia a dia (Comparativo com Django)

  #### 1. Alterar ou criar tabelas:

  Sempre que você adicionar ou mudar um campo em schema.prisma, basta rodar no terminal:

    npx prisma migrate dev --name nome_da_alteracao

  (Esse comando equivale ao makemigrations + migrate do Django em uma única etapa).

  #### 2. Visualizador Web do Banco (Interface gráfica do Prisma):

  O Prisma possui uma interface própria incrível para ver e editar os dados:

    npx prisma studio

  Ele abrirá uma interface no navegador em http://localhost:5555.

  #### 3. Exemplo de uso em uma rota Express:

    const express = require('express');
    const prisma = require('./src/prisma');

    const app = express();
    app.use(express.json());

    // Listar livros
    app.get('/livros', async (req, res) => {
      const livros = await prisma.livro.findMany();
      res.json(livros);
    });

    // Cadastrar livro
    app.post('/livros', async (req, res) => {
      const { titulo, autor, isbn, anoPublicacao } = req.body;
      const novoLivro = await prisma.livro.create({
        data: { titulo, autor, isbn, anoPublicacao }
      });
      res.status(201).json(novoLivro);
    });
