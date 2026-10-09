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


### Como funciona e onde fica salvo:

  1. Persistência local:
      • Todos os comandos, respostas e arquivos gerados nesta sessão estão salvos na pasta:
      ~/.gemini/antigravity-cli/brain/313b240f-96ee-47b5-a5e2-71dc4c014dd9/
      • O transcript completo da conversa fica registrado em arquivos de log internos
      (transcript.jsonl).
  2. Como retomar esta conversa mais tarde:
      • Se estiver usando a interface gráfica / IDE: as conversas anteriores ficam
      acessíveis no painel lateral de histórico de conversas/chats.
      • Pelo terminal (agy CLI):
	  • Para continuar a conversa mais recente:
            agy -c
            # ou
            agy --continue

	  • Para abrir exatamente esta conversa pelo ID:
            agy --conversation 313b240f-96ee-47b5-a5e2-71dc4c014dd9

Todos os requisitos foram implementados e testados com sucesso!
  ──────
  ### 1. Resumo das Implementações

   Requisito                              | S… | Implementação
  ----------------------------------------|----|-------------------------------------------
   1. Tela de Login com Bootstrap         |    | Criada em login.html com design
                                          |    | responsivo Bootstrap 5, formulário com
                                          |    | validação e atalho de preenchimento.
   1. Usuário de teste no PostgreSQL      |    | Criado via seed.js com senha
                                          |    | criptografada (bcrypt) e foto gravada no
                                          |    | banco.
   1.1. Alerta / Popup em caso de falha   |    | Emite Modal Popup de erro do Bootstrap
                                          |    | (#modalErroLogin) + Alert inline dinâmico
                                          |    | com foco de volta no formulário sem sair
                                          |    | da tela.
   1.2. Dashboard Principal               |    | Criado em dashboard.html com KPIs, blocos
                                          |    | de Cadastros, Consultas e Relatórios.
   1.2.1. Menu Lateral Offcanvas Oculto   |    | Barra superior com botão hambúrguer à
                                          |    | esquerda que aciona o painel lateral
                                          |    | deslizante do Bootstrap (permanece oculto
                                          |    | por padrão).
   1.2.2. Identificação com Foto Circular |    | Lado direito da barra exibe o nome do
                                          |    | usuário e a foto do rosto em moldura
                                          |    | circular (.user-avatar-frame rounded-
                                          |    | circle) com dropdown de perfil.
   1.2.3. Armazenamento Binário no Banco  |    | Adicionados campos foto Bytes? (coluna
                                          |    | BYTEA no PostgreSQL) e foto_mime_type no
                                          |    | schema.prisma. O binário é servido via
                                          |    | rota /api/usuarios/:id/foto.
  ──────
  ### 2. Credenciais do Usuário de Teste

  • E-mail: admin@biblioteca.com
  • Senha: admin123
  • Nome: Maria Silva
  • Foto: Imagem de rosto de 3,2 KB gravada diretamente no PostgreSQL como binário (BYTEA).
  ──────
  ### 3. Como Acessar e Testar

  O servidor Express já está rodando em segundo plano:

  1. Acesse no seu navegador:
      • http://localhost:3000/login
  2. Teste a falha (Requisito 1.1):
      • Digite uma senha incorreta ou e-mail inexistente e clique em Acessar Sistema.
      • O sistema abrirá um Modal Popup e um Alert informando o erro, mantendo você na tela
      de login.
  3. Teste o sucesso (Requisitos 1.2, 1.2.1, 1.2.2 e 1.2.3):
      • Clique no botão Preencher (ou digite admin@biblioteca.com e admin123).
      • Ao entrar no Dashboard:
	  • Canto superior esquerdo: Clique no botão de menu para abrir o painel lateral
	  com opções de Cadastros, Consultas e Relatórios.
	  • Canto superior direito: Veja a foto do rosto de Maria Silva na moldura circular
	  servida diretamente do banco de dados, com menu dropdown para ver o perfil
	  completo ou encerrar a sessão.


  ──────
  ### 4. Scripts Adicionados no package.json

  • Iniciar o servidor:
    npm start

  • Recarregar dados de teste (Seed):
    npm run seed
