import { ref, computed } from "vue";
import api from "../services/api";

const user = ref(null);
const token = ref(null);
const loading = ref(false);

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value);

  const initAuth = () => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      token.value = storedToken;
      user.value = JSON.parse(storedUser);
    }
  };

  const login = async (credentials) => {
    loading.value = true;
    try {
      const response = await api.login(credentials);
      const { token: authToken, user: userData } = response.data;

      token.value = authToken;
      user.value = userData;

      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, message };
    } finally {
      loading.value = false;
    }
  };

  const register = async (data) => {
    loading.value = true;
    try {
      const response = await api.register(data);
      const { token: authToken, user: userData } = response.data;

      token.value = authToken;
      user.value = userData;

      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
    }
  };

  const fetchUser = async () => {
    try {
      const response = await api.getUser();
      user.value = response.data;
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Fetch user error:", error);
      logout();
    }
  };

  return {
    user,
    token,
    loading,
    isAuthenticated,
    initAuth,
    login,
    register,
    logout,
    fetchUser,
  };
}
