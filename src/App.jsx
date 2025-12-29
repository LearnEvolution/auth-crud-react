import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3001/api";
// quando subir pro Render, troca pra:
// https://auth-crud-api.onrender.com/api

const STATUS_FLOW = ["novo", "preparando", "pronto", "entregue"];

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
    const t = localStorage.getItem("token");
    const n = localStorage.getItem("name");
    const e = localStorage.getItem("email");

    if (t) {
      setToken(t);
      setName(n || "");
      setEmail(e || "");
      loadItems(t);
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

    if (!data.token) {
      alert(data.msg || "Erro no login");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("name", data.user.name);
    localStorage.setItem("email", data.user.email);

    setToken(data.token);
    setName(data.user.name);

    loadItems(data.token);
  }

  async function handleRegister() {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!data.id) {
      alert(data.msg || "Erro no cadastro");
      return;
    }

    alert("Cadastro realizado! Faça login.");
    setMode("login");
    setPassword("");
  }

  async function loadItems(tok) {
    const res = await fetch(`${API_URL}/items`, {
      headers: { Authorization: `Bearer ${tok}` }
    });

    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
  }

  async function addItem() {
    if (!newItem.trim()) return;

    await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ description: newItem })
    });

    setNewItem("");
    loadItems(token);
  }

  async function updateStatus(item) {
    const index = STATUS_FLOW.indexOf(item.status);
    if (index === -1 || index === STATUS_FLOW.length - 1) return;

    const next = STATUS_FLOW[index + 1];

    await fetch(`${API_URL}/items/${item._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: next })
    });

    loadItems(token);
  }

  async function deleteItem(id) {
    await fetch(`${API_URL}/items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    loadItems(token);
  }

  function logout() {
    localStorage.clear();
    setToken(null);
    setItems([]);
    setEmail("");
    setName("");
    setPassword("");
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">Carregando...</h1>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">Pizzaria App</h1>

          {mode === "login" ? (
            <>
              <h2 className="subtitle">Login</h2>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" />
              <button onClick={handleLogin}>Entrar</button>
              <p className="link" onClick={() => setMode("register")}>Não tem conta? Cadastre-se</p>
            </>
          ) : (
            <>
              <h2 className="subtitle">Cadastro</h2>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" />
              <button onClick={handleRegister}>Cadastrar</button>
              <p className="link" onClick={() => setMode("login")}>Já tenho conta</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Pedidos de Pizza</h1>
        <h2 className="subtitle">Cliente: {name}</h2>

        <div className="add">
          <input
            placeholder="Descrição do pedido"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
          />
          <button className="add-btn" onClick={addItem}>+</button>
        </div>

        <ul>
          {items.map(item => (
            <li key={item._id} style={{ flexDirection: "column", gap: "6px" }}>
              <strong>🍕 Pedido</strong>
              <span><b>Descrição:</b> {item.description}</span>
              <span><b>Status:</b> {item.status}</span>

              {item.status !== "entregue" && (
                <button onClick={() => updateStatus(item)}>
                  Avançar status
                </button>
              )}

              <button className="delete" onClick={() => deleteItem(item._id)}>
                ❌ Cancelar
              </button>
            </li>
          ))}
        </ul>

        <button className="logout" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default App;
