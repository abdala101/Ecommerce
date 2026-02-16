import { useEffect, useState } from "react";
import axios from "axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(""); // ✅ added
  const [editingId, setEditingId] = useState(null);

  const fetchProducts = () => {
    axios.get("http://localhost:5000/products")
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  };

  useEffect(fetchProducts, []);

  const saveProduct = async () => {
    if (!name || !price || !stock) return;

    if (editingId) {
      await axios.put(`http://localhost:5000/products/${editingId}`, {
        name,
        price: Number(price),
        stock: Number(stock), // ✅ send stock
      });
    } else {
      await axios.post("http://localhost:5000/products", {
        name,
        price: Number(price),
        stock: Number(stock), // ✅ send stock
      });
    }

    setName("");
    setPrice("");
    setStock(""); // ✅ reset
    setEditingId(null);
    fetchProducts();
  };

  const deleteProduct = async (id) => {
    await axios.delete(`http://localhost:5000/products/${id}`);
    fetchProducts();
  };

  const editProduct = (p) => {
    setName(p.name);
    setPrice(p.price);
    setStock(p.stock); // ✅ set stock when editing
    setEditingId(p._id);
  };

  return (
    <div>
      <h1>Products</h1>

      <input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={e => setPrice(e.target.value)}
      />

      <input
        type="number"
        placeholder="Stock"
        value={stock}
        onChange={e => setStock(e.target.value)}
      />

      <button onClick={saveProduct}>
        {editingId ? "Update" : "Add"}
      </button>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map(p => (
            <tr key={p._id}>
              <td>{p._id}</td>
              <td>{p.name}</td>
              <td>${p.price}</td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => editProduct(p)}>Edit</button>
                <button onClick={() => deleteProduct(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
