import { useState } from "react";
import AppAdmin from "./AppAdmin";
import AppUser from "./AppUser";
import "./App.css";

const API_URL = "https://auth-crud-api.onrender.com/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  function logout() {
    localStorage.clear();
    setToken(null);
    setUser(null);
  }

  // 🔐 NÃO LOGADO
  if (!token || !user) {
    return <Auth setToken={setToken} setUser={setUser} />;
  }

  // 🔑 ADMIN
  if (user.role === "admin") {
    return <AppAdmin logout={logout} />;
  }

  // 👤 CLIENTE
  return <AppUser user={user} logout={logout} />;
}

export default App;

/* ======================================================
   AUTH (LOGIN + CADASTRO)
   ====================================================== */

function Auth({ setToken, setUser }) {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="container">
      <div className="card">
        {isRegister ? (
          <Register
            setIsRegister={setIsRegister}
          />
        ) : (
          <Login
            setToken={setToken}
            setUser={setUser}
            setIsRegister={setIsRegister}
          />
        )}
      </div>
    </div>
  );
}

/* =========================
   LOGIN
   ========================= */

function Login({ setToken, setUser, setIsRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      alert("Preencha email e senha");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        alert("Login inválido");
        setLoading(false);
        return;
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
    } catch {
      alert("Erro ao logar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="title">Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <p style={{ marginTop: 10 }}>
        Não tem conta?{" "}
        <span
          style={{ color: "#4da6ff", cursor: "pointer" }}
          onClick={() => setIsRegister(true)}
        >
          Cadastrar
        </span>
      </p>
    </>
  );
}

/* =========================
   REGISTER
   ========================= */

function Register({ setIsRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.msg || "Erro ao cadastrar");
        setLoading(false);
        return;
      }

      alert("Cadastro realizado! Faça login.");
      setIsRegister(false);
    } catch {
      alert("Erro no cadastro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="title">Cadastro</h1>

      <input
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleRegister}>
        {loading ? "Cadastrando..." : "Cadastrar"}
      </button>

      <p style={{ marginTop: 10 }}>
        Já tem conta?{" "}
        <span
          style={{ color: "#4da6ff", cursor: "pointer" }}
          onClick={() => setIsRegister(false)}
        >
          Voltar para login
        </span>
      </p>
    </>
  );
}
