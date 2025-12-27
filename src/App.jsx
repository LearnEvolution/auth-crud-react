import { useState } from "react";
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

  // LOGIN
  async function handleLogin() {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      setToken(data.token);
      loadItems(data.token);
    } else {
      alert(data.msg || "Erro no login");
    }
  }

  // CADASTRO
  async function handleRegister() {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (data.id) {
      alert("Cadastro realizado! Agora faça login.");
      setMode("login");
      setName("");
      setPassword("");
    } else {
      alert(data.msg || "Erro no cadastro");
    }
  }

  // ITENS
  async function loadItems(tok = token) {
    const res = await fetch(`${API_URL}/items`, {
      headers: { Authorization: `Bearer ${tok}` }
    });
    const data = await res.json();
    setItems(data);
  }

  async function addItem() {
    if (!newItem) return;

    await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: newItem })
    });

    setNewItem("");
    loadItems();
  }

  async function deleteItem(id) {
    await fetch(`${API_URL}/items/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    loadItems();
  }

  function logout() {
    setToken(null);
    setItems([]);
    setEmail("");
    setPassword("");
  }

  // ======================
  // LOGIN / CADASTRO
  // ======================
  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">Auth + CRUD</h1>

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

  // ======================
  // ITENS
  // ======================
  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Meus Itens</h1>

        <div className="add">
          <input
            placeholder="Novo item"
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
          />
          <button className="add-btn" onClick={addItem}>
            +
          </button>
        </div>

        <ul>
          {items.map(item => (
            <li key={item._id}>
              <span>{item.title}</span>
              <button
                className="delete"
                onClick={() => deleteItem(item._id)}
              >
                ✕
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
