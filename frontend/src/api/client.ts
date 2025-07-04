import axios, {
  AxiosInstance,
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

class APIClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: this.get_base_url(),
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  get_base_url() {
    return "http://localhost:8000";
  }

  get_knowledge_base_url() {
    return "http://localhost:8005";
  }

  private setupInterceptors() {
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== "/api/auth/refresh"
        ) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            return this.instance(originalRequest);
          } catch (refreshError) {
            console.error("Refresh token failed:", refreshError);
            window.location.href = "/login";
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken() {
    await this.instance.post("/api/auth/refresh");
  }

  private getRequestConfig(path: string, config?: AxiosRequestConfig): AxiosRequestConfig {
    const isKnowledge = path.startsWith("/api/knowlege");

    return {
      ...config,
      baseURL: isKnowledge ? this.get_knowledge_base_url() : this.get_base_url(),
      withCredentials: true,
    };
  }

  get(path: string, config?: AxiosRequestConfig) {
    return this.instance.get(path, this.getRequestConfig(path, config));
  }

  post(path: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.post(path, data, this.getRequestConfig(path, config));
  }

  put(path: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.put(path, data, this.getRequestConfig(path, config));
  }

  patch(path: string, data?: any, config?: AxiosRequestConfig) {
    return this.instance.patch(path, data, this.getRequestConfig(path, config));
  }

  delete(path: string, config?: AxiosRequestConfig) {
    return this.instance.delete(path, this.getRequestConfig(path, config));
  }
}

export const client = new APIClient();
