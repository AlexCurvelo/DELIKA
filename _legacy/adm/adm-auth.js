/* Delika ADM auth helpers.
 * Important: without a backend this is only a basic client-side gate.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "delika_adm_session_v1";
  var SESSION_MS = 8 * 60 * 60 * 1000; // 8 hours
  var VALID_USER = "karina";
  var VALID_PASS_SHA256 = "d880e32816cf14cd799f59a910be2340fc04c648b30704755fded6ea62d57b40";

  function parseJson(value) {
    try {
      return JSON.parse(value);
    } catch (err) {
      return null;
    }
  }

  function readSession() {
    return parseJson(localStorage.getItem(STORAGE_KEY));
  }

  function writeSession(username) {
    var now = Date.now();
    var session = {
      username: username,
      createdAt: now,
      expiresAt: now + SESSION_MS,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function isSessionValid(session) {
    return !!(
      session &&
      typeof session.username === "string" &&
      typeof session.expiresAt === "number" &&
      session.username === VALID_USER &&
      session.expiresAt > Date.now()
    );
  }

  function getSession() {
    var session = readSession();
    if (!isSessionValid(session)) {
      clearSession();
      return null;
    }
    return session;
  }

  async function sha256Hex(input) {
    var bytes = new TextEncoder().encode(input);
    var digest = await window.crypto.subtle.digest("SHA-256", bytes);
    var arr = Array.from(new Uint8Array(digest));
    return arr.map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }

  async function login(username, password) {
    var normalizedUser = String(username || "").trim().toLowerCase();
    if (normalizedUser !== VALID_USER) {
      return false;
    }

    if (!(window.crypto && window.crypto.subtle)) {
      return false;
    }

    var hash = await sha256Hex(String(password || ""));
    if (hash !== VALID_PASS_SHA256) {
      return false;
    }

    writeSession(normalizedUser);
    return true;
  }

  function logout() {
    clearSession();
  }

  function requireAuth() {
    if (!getSession()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  window.DelikAuth = {
    getSession: getSession,
    login: login,
    logout: logout,
    requireAuth: requireAuth,
  };
// MOVIDO PARA /adm/adm-auth.js
})();

