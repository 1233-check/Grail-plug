// ===== AUTH.JS — Supabase Auth =====

const GrailAuth = {
  async register(name, email, password) {
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };
    const { data, error } = await _supabaseClient.auth.signUp({
      email, password,
      options: { data: { name } }
    });
    if (error) return { success: false, error: error.message };
    return { success: true, user: { name, email, role: ADMIN_EMAILS.includes(email) ? 'admin' : 'customer' } };
  },

  async login(email, password) {
    const { data, error } = await _supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    const user = data.user;
    return {
      success: true,
      user: {
        id: user.id,
        name: user.user_metadata?.name || email.split('@')[0],
        email: user.email,
        role: ADMIN_EMAILS.includes(user.email) ? 'admin' : 'customer'
      }
    };
  },

  async logout() {
    await _supabaseClient.auth.signOut();
  },

  async getCurrentUser() {
    const { data: { user } } = await _supabaseClient.auth.getUser();
    if (!user) return null;
    return {
      id: user.id,
      name: user.user_metadata?.name || user.email.split('@')[0],
      email: user.email,
      role: ADMIN_EMAILS.includes(user.email) ? 'admin' : 'customer'
    };
  },

  async isLoggedIn() {
    const user = await this.getCurrentUser();
    return !!user;
  },

  async isAdmin() {
    const user = await this.getCurrentUser();
    return user && user.role === 'admin';
  },

  async getUserInitial() {
    const user = await this.getCurrentUser();
    return user ? user.name.charAt(0).toUpperCase() : '';
  }
};
