import { useEffect, useState } from "react";
import axios from "axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(""); // ✅ new state for error

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderRes = await axios.get("http://localhost:5000/orders");
        const prodRes = await axios.get("http://localhost:5000/products");

        setOrders(orderRes.data);
        setProducts(prodRes.data);
        if (prodRes.data.length > 0) setProductId(prodRes.data[0]._id);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const createOrder = async () => {
    if (!productId || quantity < 1) return;

    setError(""); // reset error on new attempt

    try {
      await axios.post("http://localhost:5000/orders", {
        productId,
        quantity: Number(quantity),
      });

      setQuantity(1);

      // refresh orders
      const orderRes = await axios.get("http://localhost:5000/orders");
      setOrders(orderRes.data);
    } catch (err) {
      // check if backend returned a 400 (insufficient stock)
      if (err.response && err.response.status === 400) {
        setError("Insufficient stock for this product!");
      } else {
        setError("Failed to create order. Try again.");
      }
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Orders</h1>

      {products.length === 0 ? (
        <p>No products available. Please create products first.</p>
      ) : (
        <>
          <select
            value={productId}
            onChange={e => setProductId(e.target.value)}
          >
            {products.map((p) => (
              <option
                key={p._id}
                value={p._id}
                disabled={p.stock === 0} // show as disabled if no stock
              >
                {p.name} (Stock: {p.stock})
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
          />

          <button onClick={createOrder}>Create Order</button>

          {/* ✅ Display error message */}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="4">No orders yet.</td>
            </tr>
          ) : (
            orders.map((o) => (
              <tr key={o._id}>
                <td>{o.productName}</td>
                <td>{o.quantity}</td>
                <td>${o.total}</td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "N/A"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
