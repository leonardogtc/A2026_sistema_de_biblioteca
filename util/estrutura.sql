-- ========================================================
-- SISTEMA DE GESTÃO DE BIBLIOTECA
-- DDL de Criação de Tabelas, Constraints e Índices
-- ========================================================

-- 1. TABELA DE CATEGORIAS / GÊNEROS
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE AUTORES
CREATE TABLE autores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    nacionalidade VARCHAR(80),
    data_nascimento DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE LIVROS (ACERVO)
CREATE TABLE livros (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    subtitulo VARCHAR(255),
    isbn VARCHAR(20) NOT NULL UNIQUE,
    ano_publicacao SMALLINT CHECK (ano_publicacao > 0 AND ano_publicacao <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
    edicao SMALLINT DEFAULT 1 CHECK (edicao > 0),
    editora VARCHAR(120),
    categoria_id INT NOT NULL,
    quantidade_total INT NOT NULL DEFAULT 1 CHECK (quantidade_total >= 0),
    quantidade_disponivel INT NOT NULL DEFAULT 1 CHECK (quantidade_disponivel >= 0),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Garante que nunca teremos mais livros disponíveis do que o total físico
    CONSTRAINT chk_estoque_valido CHECK (quantidade_disponivel <= quantidade_total),
    CONSTRAINT fk_livros_categoria FOREIGN KEY (categoria_id) 
        REFERENCES categorias(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 4. TABELA ASSOCIATIVA: LIVROS <-> AUTORES (N:N)
CREATE TABLE livros_autores (
    livro_id INT NOT NULL,
    autor_id INT NOT NULL,
    PRIMARY KEY (livro_id, autor_id),
    CONSTRAINT fk_la_livro FOREIGN KEY (livro_id) 
        REFERENCES livros(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_la_autor FOREIGN KEY (autor_id) 
        REFERENCES autores(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 5. TABELA DE USUÁRIOS (LEITORES / ASSOCIADOS)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    cpf VARCHAR(14) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVO' 
        CHECK (status IN ('ATIVO', 'SUSPENSO', 'INATIVO')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABELA DE GESTÃO DE EMPRÉSTIMOS
CREATE TABLE emprestimos (
    id SERIAL PRIMARY KEY,
    livro_id INT NOT NULL,
    usuario_id INT NOT NULL,
    data_emprestimo DATE NOT NULL DEFAULT CURRENT_DATE,
    data_prevista_devolucao DATE NOT NULL,
    data_devolucao_real DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'EM_ANDAMENTO' 
        CHECK (status IN ('EM_ANDAMENTO', 'CONCLUIDO', 'ATRASADO', 'EXTRAVIADO')),
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Regra temporal: devolução prevista não pode ser anterior à data de empréstimo
    CONSTRAINT chk_datas_devolucao CHECK (data_prevista_devolucao >= data_emprestimo),
    CONSTRAINT fk_emprestimos_livro FOREIGN KEY (livro_id) 
        REFERENCES livros(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_emprestimos_usuario FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ========================================================
-- ÍNDICES ESTRATÉGICOS (Otimização para consultas da API)
-- ========================================================

-- Busca de livros por título e categoria
CREATE INDEX idx_livros_titulo ON livros(titulo);
CREATE INDEX idx_livros_categoria ON livros(categoria_id);

-- Busca rápida de empréstimos em aberto e consultas por usuário
CREATE INDEX idx_emprestimos_status ON emprestimos(status);
CREATE INDEX idx_emprestimos_usuario ON emprestimos(usuario_id);
CREATE INDEX idx_emprestimos_livro ON emprestimos(livro_id);