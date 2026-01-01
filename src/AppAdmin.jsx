import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://auth-crud-api.onrender.com/api";

function AppAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  // 💻 LOGIN DO ADMIN
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
        alert("Erro no login");
        setLoading(false);
        return;
      }

      const data = await res.json();

      // 🚫 Bloquear se não for admin
      if (data.user && data.user.role !== "admin") {
        alert("Acesso restrito a administradores");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      loadUsers();
    } catch (err) {
      console.log(err);
      alert("Erro no login");
      setLoading(false);
    }
  }

  // 👥 CARREGAR USUÁRIOS
  async function loadUsers() {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        alert("Erro ao carregar usuários");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.log("Erro:", err);
      setLoading(false);
    }
  }

  function logout() {
    localStorage.clear();
    setToken(null);
    setUsers([]);
  }

  if (loading) return <h1 style={{ color: "#fff" }}>Carregando...</h1>;

  // 🛑 LOGIN DO ADMIN
  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">Admin Login</h1>
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
          <button onClick={handleLogin}>Entrar</button>
        </div>
      </div>
    );
  }

  // ✅ PAINEL ADMIN
  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Painel Admin</h1>
        <h3 style={{ marginTop: 15 }}>👥 Usuários cadastrados</h3>
        <ul>
          {users.map((u) => (
            <li key={u._id} style={{ marginBottom: 8 }}>
              <b>{u.name}</b> — {u.email} — <i>{u.role}</i>
            </li>
          ))}
        </ul>
        <button className="logout" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default AppAdmin;
