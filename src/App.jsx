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
  const [pizzas, setPizzas] = useState([]);
  const [newItem, setNewItem] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const n = localStorage.getItem("name");
    const e = localStorage.getItem("email");

    loadPizzas();

    if (t) {
      setToken(t);
      setName(n || "");
      setEmail(e || "");
      loadItems(t);
    }
    setLoading(false);
  }, []);

  async function loadPizzas() {
    try {
      const res = await fetch(`${API_URL}/pizzas`);
      const data = await res.json();
      setPizzas(Array.isArray(data) ? data : []);
    } catch {
      console.log("Erro ao carregar pizzas");
    }
  }

  async function handleLogin() {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      alert("Erro no login");
      return;
    }

    const data = await res.json();
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

    if (!res.ok) {
      alert("Erro no cadastro");
      return;
    }

    alert("Cadastro realizado!");
    setMode("login");
  }

  async function loadItems(tok) {
    const res = await fetch(`${API_URL}/items`, {
      headers: { Authorization: `Bearer ${tok}` }
    });

    if (!res.ok) return;
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
      body: JSON.stringify({ description: newItem })
    });

    setNewItem("");
    loadItems(token);
  }

  function logout() {
    localStorage.clear();
    setToken(null);
    setItems([]);
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

        {/* 🍕 CARDÁPIO */}
        <h3 style={{ marginTop: 15 }}>🍕 Cardápio</h3>
        <ul>
          {pizzas.map(p => (
            <li
              key={p._id}
              style={{ cursor: "pointer" }}
              onClick={() =>
                setNewItem(`Pizza ${p.nome} (${p.tamanho}) — R$ ${p.preco}`)
              }
            >
              <b>{p.nome}</b> ({p.tamanho}) — R$ {p.preco}
            </li>
          ))}
        </ul>

        {/* 📦 PEDIDOS */}
        <div className="add">
          <input
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            placeholder="Descrição do pedido"
          />
          <button className="add-btn" onClick={addItem}>+</button>
        </div>

        <ul>
          {items.map(item => (
            <li key={item._id}>
              <b>{item.description}</b> — {item.status}
            </li>
          ))}
        </ul>

        <button className="logout" onClick={logout}>Logout</button>
      </div>
    </div>
  );
}

export default App;
