-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('ATIVO', 'SUSPENSO', 'INATIVO');

-- CreateEnum
CREATE TYPE "StatusEmprestimo" AS ENUM ('EM_ANDAMENTO', 'CONCLUIDO', 'ATRASADO', 'EXTRAVIADO');

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autores" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "nacionalidade" VARCHAR(80),
    "data_nascimento" DATE,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "autores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livros" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "subtitulo" VARCHAR(255),
    "isbn" VARCHAR(20) NOT NULL,
    "ano_publicacao" SMALLINT,
    "edicao" SMALLINT NOT NULL DEFAULT 1,
    "editora" VARCHAR(120),
    "categoria_id" INTEGER NOT NULL,
    "quantidade_total" INTEGER NOT NULL DEFAULT 1,
    "quantidade_disponivel" INTEGER NOT NULL DEFAULT 1,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "livros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "livros_autores" (
    "livro_id" INTEGER NOT NULL,
    "autor_id" INTEGER NOT NULL,

    CONSTRAINT "livros_autores_pkey" PRIMARY KEY ("livro_id","autor_id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "email" VARCHAR(180) NOT NULL,
    "telefone" VARCHAR(20),
    "cpf" VARCHAR(14) NOT NULL,
    "status" "StatusUsuario" NOT NULL DEFAULT 'ATIVO',
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emprestimos" (
    "id" SERIAL NOT NULL,
    "livro_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "data_emprestimo" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_prevista_devolucao" DATE NOT NULL,
    "data_devolucao_real" DATE,
    "status" "StatusEmprestimo" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "observacoes" TEXT,
    "criado_em" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emprestimos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nome_key" ON "categorias"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "livros_isbn_key" ON "livros"("isbn");

-- CreateIndex
CREATE INDEX "idx_livros_titulo" ON "livros"("titulo");

-- CreateIndex
CREATE INDEX "idx_livros_categoria" ON "livros"("categoria_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- CreateIndex
CREATE INDEX "idx_emprestimos_status" ON "emprestimos"("status");

-- CreateIndex
CREATE INDEX "idx_emprestimos_usuario" ON "emprestimos"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_emprestimos_livro" ON "emprestimos"("livro_id");

-- AddForeignKey
ALTER TABLE "livros" ADD CONSTRAINT "livros_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livros_autores" ADD CONSTRAINT "livros_autores_livro_id_fkey" FOREIGN KEY ("livro_id") REFERENCES "livros"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "livros_autores" ADD CONSTRAINT "livros_autores_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "autores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_livro_id_fkey" FOREIGN KEY ("livro_id") REFERENCES "livros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emprestimos" ADD CONSTRAINT "emprestimos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
