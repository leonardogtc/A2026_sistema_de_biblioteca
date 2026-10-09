require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const prisma = require('./prisma');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares essenciais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessão de usuário
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'biblioteca_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 8 // 8 horas
    }
  })
);

// Servir arquivos estáticos do Bootstrap do node_modules e da pasta public
app.use('/vendor/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname, '../public')));

// Middleware de proteção de rotas
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ success: false, message: 'Acesso não autorizado. Faça login.' });
    }
    return res.redirect('/login');
  }
  next();
}

// ==========================================
// ROTAS DE PÁGINAS (HTML)
// ==========================================
app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/login');
});

app.get('/login', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  return res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/dashboard', requireAuth, (req, res) => {
  return res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// ==========================================
// ROTAS DE API - AUTENTICAÇÃO
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, informe seu e-mail e senha de acesso.'
      });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas: e-mail não encontrado no sistema.'
      });
    }

    if (usuario.status !== 'ATIVO') {
      return res.status(403).json({
        success: false,
        message: `Acesso negado: seu usuário está com status "${usuario.status}". Contate o administrador.`
      });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas: senha incorreta.'
      });
    }

    // Login bem-sucedido: grava na sessão
    req.session.userId = usuario.id;
    req.session.userName = usuario.nome;
    req.session.userEmail = usuario.email;

    return res.json({
      success: true,
      message: 'Autenticado com sucesso!',
      redirect: '/dashboard',
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Ocorreu um erro no servidor ao validar suas credenciais.'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro no logout:', err);
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true, redirect: '/login' });
  });
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
        status: true,
        criadoEm: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não localizado.' });
    }

    return res.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário logado:', error);
    return res.status(500).json({ error: 'Erro interno ao consultar perfil.' });
  }
});

// ==========================================
// ROTA PARA SERVIR FOTO DO ROSTO (BINÁRIO / BYTEA)
// ==========================================
app.get('/api/usuarios/:id/foto', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).send('ID de usuário inválido.');
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: { foto: true, fotoMimeType: true }
    });

    if (!usuario || !usuario.foto) {
      // Retorna avatar SVG padrão elegante caso não tenha foto
      const svgPadrao = `
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="64" fill="#e9ecef"/>
          <circle cx="64" cy="48" r="26" fill="#6c757d"/>
          <path d="M18 114c0-25 20-42 46-42s46 17 46 42z" fill="#6c757d"/>
        </svg>
      `.trim();
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(svgPadrao);
    }

    res.setHeader('Content-Type', usuario.fotoMimeType || 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(usuario.foto);
  } catch (error) {
    console.error('Erro ao buscar foto do usuário:', error);
    return res.status(500).send('Erro ao carregar foto.');
  }
});

// ==========================================
// ROTA DE ESTATÍSTICAS E DADOS DO DASHBOARD
// ==========================================
app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const [
      totalLivros,
      totalAutores,
      totalCategorias,
      totalUsuarios,
      emprestimosAtivos,
      emprestimosAtrasados,
      ultimosEmprestimos,
      ultimosLivros
    ] = await Promise.all([
      prisma.livro.count(),
      prisma.autor.count(),
      prisma.categoria.count(),
      prisma.usuario.count(),
      prisma.emprestimo.count({ where: { status: 'EM_ANDAMENTO' } }),
      prisma.emprestimo.count({ where: { status: 'ATRASADO' } }),
      prisma.emprestimo.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        include: {
          livro: { select: { titulo: true } },
          usuario: { select: { nome: true } }
        }
      }),
      prisma.livro.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        include: {
          categoria: { select: { nome: true } }
        }
      })
    ]);

    return res.json({
      totalLivros,
      totalAutores,
      totalCategorias,
      totalUsuarios,
      emprestimosAtivos,
      emprestimosAtrasados,
      ultimosEmprestimos,
      ultimosLivros
    });
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error);
    return res.status(500).json({ error: 'Erro ao calcular métricas do dashboard.' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor da Biblioteca em execução em http://localhost:${PORT}`);
  console.log(`📌 Tela de Login: http://localhost:${PORT}/login`);
});
