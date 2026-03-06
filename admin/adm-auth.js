/**
 * ═══════════════════════════════════════════════════════════════════
 * ADM Deliká - Módulo de Autenticação v1.0
 * Arquiteto: Alexandre Curvelo
 * Paradigma: Local-First (Zero-Server)
 * ═══════════════════════════════════════════════════════════════════
 */

const AUTH_CONFIG = {
  SESSION_KEY: 'delika_adm_session_v1',
  SESSION_DURATION: 8 * 60 * 60 * 1000, // 8 horas em ms
  USERS: [
    { username: 'karina', passwordHash: 'd880e32816cf14cd799f59a910be2340fc04c648b30704755fded6ea62d57b40' }
  ]
};

/**
 * ═══════════════════════════════════════════════════════════════════
 * CRIPTOGRAFIA - SHA-256
 * ═══════════════════════════════════════════════════════════════════
 */

async function sha256Hex(message) {
  // Use Web Crypto API for SHA-256
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * GERENCIAMENTO DE SESSÃO
 * ═══════════════════════════════════════════════════════════════════
 */

function writeSession(username) {
  const session = {
    username: username,
    timestamp: Date.now(),
    expiresAt: Date.now() + AUTH_CONFIG.SESSION_DURATION
  };
  localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(session));
  return session;
}

function readSession() {
  const sessionData = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
  if (!sessionData) return null;

  try {
    const session = JSON.parse(sessionData);

    // Verificar expiração
    if (Date.now() > session.expiresAt) {
      destroySession();
      return null;
    }

    return session;
  } catch (e) {
    destroySession();
    return null;
  }
}

function destroySession() {
  localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * AUTENTICAÇÃO
 * ═══════════════════════════════════════════════════════════════════
 */

async function login(username, password) {
  // Validar input
  if (!username || !password) {
    return { success: false, message: 'Usuário e senha são obrigatórios' };
  }

  // Gerar hash da senha fornecida
  const passwordHash = await sha256Hex(password);

  // Buscar usuário
  const user = AUTH_CONFIG.USERS.find(u =>
    u.username.toLowerCase() === username.toLowerCase()
  );

  if (!user) {
    // Usuário não encontrado - mas não revelar isso por segurança
    await sha256Hex('fake'); // Delay para evitar timing attack
    return { success: false, message: 'Credenciais inválidas' };
  }

  // Verificar senha
  if (passwordHash !== user.passwordHash) {
    await sha256Hex('fake'); // Delay para evitar timing attack
    return { success: false, message: 'Credenciais inválidas' };
  }

  // Login bem-sucedido
  const session = writeSession(user.username);
  return { success: true, user: session };
}

function logout() {
  destroySession();
  window.location.href = 'login.html';
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * PROTEÇÃO DE ROTAS
 * ═══════════════════════════════════════════════════════════════════
 */

function requireAuth() {
  const session = readSession();

  if (!session) {
    window.location.href = 'login.html';
    return false;
  }

  return true;
}

function getCurrentUser() {
  return readSession();
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * UTILITÁRIOS
 * ═══════════════════════════════════════════════════════════════════
 */

function isAuthenticated() {
  return readSession() !== null;
}

function getSessionTimeRemaining() {
  const session = readSession();
  if (!session) return 0;

  const remaining = session.expiresAt - Date.now();
  return Math.max(0, remaining);
}

function formatTimeRemaining(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}

// Auto-refresh de sessão enquanto a página estiver aberta
function startSessionMonitor() {
  setInterval(() => {
    const session = readSession();
    if (!session) return;

    // Verificar se sessão ainda é válida
    if (Date.now() > session.expiresAt) {
      logout();
    }
  }, 60000); // Verificar a cada minuto
}

// Exportar para uso global
window.auth = {
  login,
  logout,
  requireAuth,
  getCurrentUser,
  isAuthenticated,
  getSessionTimeRemaining,
  formatTimeRemaining,
  startSessionMonitor,
  sha256Hex
};
