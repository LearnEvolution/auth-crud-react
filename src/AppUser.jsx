import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://auth-crud-api.onrender.com/api";

function AppUser({ user, logout }) {
  const [pedido, setPedido] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // 🔄 Carregar pedidos do cliente
  useEffect(() => {
    loadPedidos();
  }, []);

  async function loadPedidos() {
    try {
      const res = await fetch(`${API_URL}/items`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) return;

      const data = await res.json();
      setPedidos(data);
    } catch (err) {
      console.log("Erro ao carregar pedidos");
    }
  }

  // 📝 Criar pedido
  async function criarPedido() {
    if (!pedido) {
      alert("Digite o pedido");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          description: pedido
        })
      });

      if (!res.ok) {
        alert("Erro ao criar pedido");
        setLoading(false);
        return;
      }

      setPedido("");
      loadPedidos();
      setLoading(false);
    } catch (err) {
      alert("Erro no pedido");
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Área do Cliente</h1>

        <p>
          👤 <b>{user.name}</b> <br />
          📧 {user.email}
        </p>

        <hr />

        <h3>📝 Novo Pedido</h3>
        <input
          placeholder="Descreva seu pedido"
          value={pedido}
          onChange={(e) => setPedido(e.target.value)}
        />
        <button onClick={criarPedido}>
          {loading ? "Enviando..." : "Enviar Pedido"}
        </button>

        <hr />

        <h3>📦 Meus Pedidos</h3>
        <ul>
          {pedidos.length === 0 && <li>Nenhum pedido ainda</li>}
          {pedidos.map((p) => (
            <li key={p._id}>
              {p.description} — <i>{p.status}</i>
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

export default AppUser;
