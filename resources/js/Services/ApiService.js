import axios from "@/bootstrap"; // 👈 axios instance from bootstrap.js
import { router } from "@inertiajs/react";

const ApiService = {
  get(resource, params = {}) {
    return axios.get(resource, { params });
  },

  post(resource, data) {
    return axios.post(resource, data);
  },

  put(resource, data) {
    return axios.put(resource, data);
  },

  patch(resource, data) {
    return axios.patch(resource, data);
  },

  delete(resource) {
    return axios.delete(resource);
  },
};

// ----------------------------
// 🔹 Global Axios Interceptors
// ----------------------------

// Response Interceptor
axios.interceptors.response.use(
  (response) => response, // return successful response as is
  async (error) => {
    const { response } = error;

    if (!response) {
      console.error("Network/Server error:", error);
      return Promise.reject(error);
    }

    // 🔸 Handle 401 Unauthorized → redirect to login
    if (response.status === 401) {
      console.warn("Unauthorized. Redirecting to login...");
      router.visit(route("login")); // inertia redirect
    }

    // 🔸 Handle 419 CSRF Token expired → refresh token & retry request
    if (response.status === 419) {
      console.warn("CSRF token expired. Refreshing...");

      try {
        await axios.get("/sanctum/csrf-cookie"); // refresh CSRF
        return axios.request(error.config); // retry original request
      } catch (csrfError) {
        console.error("Failed to refresh CSRF token:", csrfError);
        return Promise.reject(csrfError);
      }
    }

    // 🔸 Other errors → just reject
    console.error("API Error:", response.status, response.data);
    return Promise.reject(error);
  }
);

export default ApiService;
