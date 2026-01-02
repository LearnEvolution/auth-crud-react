import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://auth-crud-api.onrender.com/api";

function AppAdmin({ logout }) {
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [usersRes, itemsRes] = await Promise.all([
        fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/admin/items`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!usersRes.ok || !itemsRes.ok) {
        alert("Acesso negado");
        logout();
        return;
      }

      const usersData = await usersRes.json();
      const itemsData = await itemsRes.json();

      setUsers(usersData);
      setItems(itemsData);
      setLoading(false);
    } catch (err) {
      alert("Erro ao carregar painel admin");
      logout();
    }
  }

  if (loading) {
    return <h1 style={{ color: "#fff" }}>Carregando...</h1>;
  }

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Painel Admin</h1>

        <h3>👥 Usuários cadastrados</h3>
        <ul>
          {users.map((u) => (
            <li key={u._id}>
              <b>{u.name}</b> — {u.email} — <i>{u.role}</i>
            </li>
          ))}
        </ul>

        <hr />

        <h3>📦 Pedidos</h3>
        <ul>
          {items.length === 0 && <li>Nenhum pedido</li>}
          {items.map((p) => (
            <li key={p._id} style={{ marginBottom: 8 }}>
              <b>{p.userId?.name}</b> ({p.userId?.email}) <br />
              📝 {p.description} <br />
              📌 Status: <i>{p.status}</i>
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
