import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://auth-crud-api.onrender.com/api";
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
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.msg || "Erro no login");
        return;
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("email", data.user.email);

      setToken(data.token);
      setName(data.user.name);
      loadItems(data.token);
    } catch {
      alert("Erro de conexão com o servidor");
    }
  }

  async function handleRegister() {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.msg || "Erro no cadastro");
        return;
      }

      alert("Cadastro realizado. Faça login.");
      setMode("login");
      setPassword("");
    } catch {
      alert("Erro de conexão com o servidor");
    }
  }

  async function loadItems(tok) {
    const res = await fetch(`${API_URL}/items`, {
      headers: { Authorization: `Bearer ${tok}` }
    });

    if (!res.ok) return;
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

    await fetch(`${API_URL}/items/${item._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: STATUS_FLOW[index + 1] })
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

  if (loading) return <h1 style={{ color: "#fff" }}>Carregando...</h1>;

  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <h1 className="title">Pizzaria App</h1>

          {mode === "login" ? (
            <>
              <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
              <button onClick={handleLogin}>Entrar</button>
              <p className="link" onClick={() => setMode("register")}>Cadastrar</p>
            </>
          ) : (
            <>
              <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
              <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
              <button onClick={handleRegister}>Cadastrar</button>
              <p className="link" onClick={() => setMode("login")}>Login</p>
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
          <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Descrição do pedido" />
          <button className="add-btn" onClick={addItem}>+</button>
        </div>

        <ul>
          {items.map(item => (
            <li key={item._id}>
              <b>{item.description}</b> — {item.status}
              <button onClick={() => updateStatus(item)}>Avançar</button>
              <button className="delete" onClick={() => deleteItem(item._id)}>❌</button>
            </li>
          ))}
        </ul>

        <button className="logout" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default App;
