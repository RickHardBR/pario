import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../services/supabaseClient';

// ===== PROTEÇÃO CONTRA MÚLTIPLAS REQUISIÇÕES =====
let registrationInProgress = false;
let loginInProgress = false;

export const useAuthStore = defineStore('auth', () => {
  // ===== STATE =====
  const user = ref(null);
  const userProfile = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // ===== COMPUTED =====
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => userProfile.value?.role === 'admin');

  // ===== ACTIONS =====

  /**
   * Registrar novo usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   * @param {string} name - Nome completo
   * @param {string} phone - Telefone
   * @param {string} address - Endereço
   * @param {string} reference - Referência (opcional)
   */
  const register = async (email, password, name, phone, address, reference = '') => {
    // PROTEÇÃO: Evitar múltiplas requisições simultâneas
    if (registrationInProgress) {
      error.value = 'Aguarde... A requisição anterior ainda está sendo processada.';
      return { success: false, error: error.value };
    }

    registrationInProgress = true;
    isLoading.value = true;
    error.value = null;

    try {
      // ===== VALIDAÇÕES BÁSICAS =====
      if (!email || !password || !name || !phone || !address) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      if (password.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres');
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Email inválido');
      }

      // ===== 1. CRIAR USUÁRIO NO SUPABASE AUTH =====
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Erro ao criar conta');
      }

      if (!authData.user) {
        throw new Error('Falha ao criar usuário');
      }

      // ===== 2. CRIAR PERFIL DO USUÁRIO NA TABELA 'users' =====
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            name,
            phone,
            address,
            reference,
          },
        ]);

      if (profileError) {
        // Se falhar ao criar perfil, deletar o usuário de auth
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(profileError.message || 'Erro ao criar perfil do usuário');
      }

      // ===== 3. ATUALIZAR STATE =====
      user.value = authData.user;
      userProfile.value = {
        id: authData.user.id,
        email,
        name,
        phone,
        address,
        reference,
      };

      return { success: true };
    } catch (err) {
      error.value = err.message || 'Erro desconhecido ao criar conta';
      console.error('Erro no registro:', err);
      return { success: false, error: error.value };
    } finally {
      registrationInProgress = false;
      isLoading.value = false;
    }
  };

  /**
   * Fazer login do usuário
   * @param {string} email - Email do usuário
   * @param {string} password - Senha do usuário
   */
  const login = async (email, password) => {
    // PROTEÇÃO: Evitar múltiplas requisições simultâneas
    if (loginInProgress) {
      error.value = 'Aguarde... A requisição anterior ainda está sendo processada.';
      return { success: false, error: error.value };
    }

    loginInProgress = true;
    isLoading.value = true;
    error.value = null;

    try {
      // ===== VALIDAÇÕES BÁSICAS =====
      if (!email || !password) {
        throw new Error('Preencha email e senha');
      }

      // ===== 1. FAZER LOGIN NO SUPABASE AUTH =====
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message || 'Email ou senha inválidos');
      }

      if (!authData.user) {
        throw new Error('Falha ao fazer login');
      }

      user.value = authData.user;

      // ===== 2. BUSCAR PERFIL DO USUÁRIO =====
      try {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.warn('Erro ao buscar perfil:', profileError.message);
          // Usar dados padrão se perfil não existir
          userProfile.value = {
            id: authData.user.id,
            email: authData.user.email,
            name: 'Usuário',
            phone: '',
            address: '',
            reference: '',
            role: 'user',
          };
        } else {
          userProfile.value = profile;
        }
      } catch (profileErr) {
        console.warn('Erro ao buscar perfil:', profileErr);
        userProfile.value = {
          id: authData.user.id,
          email: authData.user.email,
          name: 'Usuário',
          phone: '',
          address: '',
          reference: '',
          role: 'user',
        };
      }

      return { success: true };
    } catch (err) {
      error.value = err.message || 'Erro desconhecido ao fazer login';
      console.error('Erro no login:', err);
      return { success: false, error: error.value };
    } finally {
      loginInProgress = false;
      isLoading.value = false;
    }
  };

  /**
   * Fazer logout do usuário
   */
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      user.value = null;
      userProfile.value = null;
      error.value = null;
    } catch (err) {
      error.value = err.message || 'Erro ao fazer logout';
      console.error('Erro no logout:', err);
    }
  };

  /**
   * Verificar autenticação ao carregar a página
   */
  const checkAuth = async () => {
    try {
      // ===== 1. OBTER SESSÃO ATUAL =====
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.warn('Erro ao obter sessão:', sessionError);
        user.value = null;
        userProfile.value = null;
        return;
      }

      // ===== 2. SE HOUVER USUÁRIO AUTENTICADO =====
      if (sessionData.session?.user) {
        user.value = sessionData.session.user;

        // ===== 3. BUSCAR PERFIL DO USUÁRIO =====
        try {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();

          if (profileError) {
            console.warn('Perfil não encontrado, usando dados padrão');
            userProfile.value = {
              id: sessionData.session.user.id,
              email: sessionData.session.user.email,
              name: 'Usuário',
              phone: '',
              address: '',
              reference: '',
              role: 'user',
            };
          } else {
            userProfile.value = profile;
          }
        } catch (err) {
          console.warn('Erro ao buscar perfil:', err);
          userProfile.value = {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email,
            name: 'Usuário',
            phone: '',
            address: '',
            reference: '',
            role: 'user',
          };
        }
      } else {
        // ===== SEM USUÁRIO AUTENTICADO =====
        user.value = null;
        userProfile.value = null;
      }
    } catch (err) {
      console.error('Erro ao verificar autenticação:', err);
      error.value = null;
      user.value = null;
      userProfile.value = null;
    }
  };

  /**
   * Atualizar perfil do usuário
   * @param {object} updates - Dados a atualizar
   */
  const updateProfile = async (updates) => {
    if (!user.value) {
      error.value = 'Usuário não autenticado';
      return { success: false, error: error.value };
    }

    isLoading.value = true;
    error.value = null;

    try {
      // ===== ATUALIZAR NA TABELA users =====
      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.value.id);

      if (updateError) {
        throw new Error(updateError.message || 'Erro ao atualizar perfil');
      }

      // ===== ATUALIZAR STATE LOCAL =====
      userProfile.value = { ...userProfile.value, ...updates };

      return { success: true };
    } catch (err) {
      error.value = err.message || 'Erro desconhecido ao atualizar perfil';
      console.error('Erro ao atualizar perfil:', err);
      return { success: false, error: error.value };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Limpar mensagem de erro
   */
  const clearError = () => {
    error.value = null;
  };

  // ===== RETORNAR STORE =====
  return {
    // State
    user,
    userProfile,
    isLoading,
    error,

    // Computed
    isAuthenticated,
    isAdmin,

    // Actions
    register,
    login,
    logout,
    checkAuth,
    updateProfile,
    clearError,
  };
});