// ===== AUTH.JS — Grail Plug Supply Authentication =====

const GrailAuth = {
  USERS_KEY: 'grail_users',
  SESSION_KEY: 'grail_session',

  init() {
    if (!localStorage.getItem(this.USERS_KEY)) {
      // Seed default admin account
      const users = [{
        id: 1,
        name: 'Admin',
        email: 'admin',
        password: this._hash('admin123'),
        role: 'admin',
        createdAt: new Date().toISOString()
      }];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  },

  _hash(str) {
    // Simple hash for demo — NOT cryptographically secure
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return hash.toString(36);
  },

  _getUsers() {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
  },
  _saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  register(name, email, password) {
    const users = this._getUsers();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: 'An account with this email already exists.' };
    }
    if (password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }
    const user = {
      id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: this._hash(password),
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    this._saveUsers(users);
    this._setSession(user);
    return { success: true, user };
  },

  login(email, password) {
    const users = this._getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { success: false, error: 'No account found with this email.' };
    if (user.password !== this._hash(password)) return { success: false, error: 'Incorrect password.' };
    this._setSession(user);
    return { success: true, user };
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
  },

  _setSession(user) {
    const session = { id: user.id, name: user.name, email: user.email, role: user.role };
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  },

  getCurrentUser() {
    const session = localStorage.getItem(this.SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  },

  getUserInitial() {
    const user = this.getCurrentUser();
    return user ? user.name.charAt(0).toUpperCase() : '';
  },

  getAllUsers() {
    return this._getUsers().map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt }));
  }
};

GrailAuth.init();
