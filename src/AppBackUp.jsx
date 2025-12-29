import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://auth-crud-api.onrender.com/api";

function App() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState(null);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔄 RESTAURA LOGIN
  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
      loadItems(savedToken);
    }

    setLoading(false);
  }, []);

  async function handleLogin() {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      loadItems(data.token);
    } else {
      alert(data.msg || "Erro no login");
    }
  }

  async function handleRegister() {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (data.id) {
      alert("Cadastro realizado! Faça login.");
      setMode("login");
      setName("");
      setPassword("");
    } else {
      alert(data.msg || "Erro no cadastro");
    }
  }

  async function loadItems(tok) {
    const res = await fetch(`${API_URL}/items`, {
      headers: {
        Authorization: `Bearer ${tok}`
      }
    });

    const data = await res.json();
    setItems(data);
  }

  async function addItem() {
    if (!newItem.trim()) return;

    await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: newItem
      })
    });

    setNewItem("");
    loadItems(token);
  }

  async function deleteItem(id) {
    await fetch(`${API_URL}/items/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    loadItems(token);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setItems([]);
    setEmail("");
    setPassword("");
  }

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">Carregando...</h1>
        </div>
      </div>
    );
  }

  // 🔐 LOGIN / CADASTRO
  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">Pizzaria App</h1>

          {mode === "login" ? (
            <>
              <h2 className="subtitle">Login</h2>

              <input
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

              <button onClick={handleLogin}>Entrar</button>

              <p className="link" onClick={() => setMode("register")}>
                Não tem conta? Cadastre-se
              </p>
            </>
          ) : (
            <>
              <h2 className="subtitle">Cadastro</h2>

              <input
                placeholder="Nome"
                value={name}
                onChange={e => setName(e.target.value)}
              />

              <input
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

              <button onClick={handleRegister}>Cadastrar</button>

              <p className="link" onClick={() => setMode("login")}>
                Já tenho conta
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // 🍕 TELA PRINCIPAL — PEDIDOS
  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Pedidos de Pizza</h1>
        <h2 className="subtitle">Cliente: {email}</h2>

        <div className="add">
          <input
            placeholder="Descrição do pedido (ex: Calabresa + Refri)"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
          />
          <button className="add-btn" onClick={addItem}>+</button>
        </div>

        <ul>
          {items.map(item => (
            <li key={item._id} style={{ flexDirection: "column", gap: "6px" }}>
              <strong>🍕 Pedido</strong>
              <span><b>Cliente:</b> {email}</span>
              <span><b>Descrição:</b> {item.title}</span>
              <span><b>Status:</b> Novo</span>

              <button
                className="delete"
                onClick={() => deleteItem(item._id)}
              >
                ❌ Cancelar pedido
              </button>
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

export default App;
