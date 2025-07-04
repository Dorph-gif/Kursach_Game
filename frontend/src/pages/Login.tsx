import { client } from "../api/client";

const Login = () => {
  const handleLogin = () => {
    window.location.href = `${client.get_base_url()}/api/auth/login`;
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Авторизация</h1>
      <button onClick={handleLogin}>Войти через Яндекс</button>
    </div>
  );
};

export default Login;