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

  // 🔐 RESTAURA SESSÃO COM VALIDAÇÃO REAL
  useEffect(() => {
    async function restore() {
      const t = localStorage.getItem("token");
      const n = localStorage.getItem("name");

      if (!t) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/private`, {
        headers: { Authorization: `Bearer ${t}` }
      });

      if (res.ok) {
        setToken(t);
        setName(n || "");
        loadItems(t);
      } else {
        localStorage.clear();
      }

      setLoading(false);
    }

    restore();
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
    const idx = STATUS_FLOW.indexOf(item.status);
    if (idx < 0 || idx === STATUS_FLOW.length - 1) return;

    await fetch(`${API_URL}/items/${item._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: STATUS_FLOW[idx + 1] })
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
    setName("");
  }

  if (loading) return <div className="container"><h1>Carregando...</h1></div>;

  if (!token) {
    return (
      <div className="container">
        <div className="card">
          <h1>Pizzaria App</h1>

          {mode === "login" ? (
            <>
              <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
              <button onClick={handleLogin}>Entrar</button>
              <p onClick={() => setMode("register")}>Cadastrar</p>
            </>
          ) : (
            <>
              <input placeholder="Nome" onChange={e => setName(e.target.value)} />
              <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
              <button onClick={handleRegister}>Cadastrar</button>
              <p onClick={() => setMode("login")}>Login</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Pedidos de Pizza</h1>
        <h2>Cliente: {name}</h2>

        <input
          placeholder="Descrição do pedido"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
        />
        <button onClick={addItem}>+</button>

        <ul>
          {items.map(item => (
            <li key={item._id}>
              <b>🍕 Pedido</b>
              <div>Descrição: {item.description || "—"}</div>
              <div>Status: {item.status}</div>
              {item.status !== "entregue" && (
                <button onClick={() => updateStatus(item)}>Avançar status</button>
              )}
              <button onClick={() => deleteItem(item._id)}>❌</button>
            </li>
          ))}
        </ul>

        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default App;
