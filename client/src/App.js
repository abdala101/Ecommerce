import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Analytics from "./pages/Analytics";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Login from "./pages/Login"; // your login page
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale);

function App() {
  // Store token from localStorage
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(""); // add state

  // If we have a token, attach it to axios headers
  useEffect(() => {
  if (token) {
    axios.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}, [token]);


  // Fetch dashboard data
  const fetchData = async () => {
  if (!token) return;

  try {
    const analyticsRes = await axios.get(`${process.env.REACT_APP_API_URL}/analytics`)
;
    setAnalytics(analyticsRes.data);

    const productsRes = await axios.get(`${process.env.REACT_APP_API_URL}/products`);
    setProducts(productsRes.data);
  } catch (err) {
    console.error(err);
  }
};


  useEffect(() => {
    if (token) fetchData();
  }, [token]); // only fetch if logged in

 const addProduct = async () => {
  if (!name || !price || !stock) return;

  await axios.post("http://localhost:5000/products", {
    name,
    price: Number(price),
    stock: Number(stock), // ✅ send stock to backend
  });

  setName("");
  setPrice("");
  setStock(""); // reset
  fetchData();
};

  // If no token, show Login component
  if (!token) return <Login setToken={setToken} />;

  // If data is loading
  if (!analytics) return <h2>Loading...</h2>;

  const data = {
    labels: ["Products", "Orders", "Revenue"],
    datasets: [{
      label: "Dashboard Stats",
      data: [
        analytics.totalProducts,
        analytics.totalOrders,
        analytics.revenue,
      ],
    }],
  };

  return (
  <BrowserRouter>
    <div style={{ display: "flex" }}>
      <Sidebar setToken={setToken} />

      <div style={{ padding: "20px", flex: 1 }}>
       <Topbar />
        <Routes>

            <Route
              path="/"
              element={
                <div>
                  <h1>E-Commerce Admin Dashboard</h1>

                  <Bar data={data} />

                  <h2>Products</h2>

                <input
  placeholder="Product name"
  value={name}
  onChange={e => setName(e.target.value)}
/>

<input
  placeholder="Price"
  type="number"
  value={price}
  onChange={e => setPrice(e.target.value)}
/>

<input
  placeholder="Stock"
  type="number"
  value={stock}
  onChange={e => setStock(e.target.value)}
/>

<button onClick={addProduct}>Add</button>


                  <table border="1" cellPadding="8">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                      </tr>
                    </thead>

                    <tbody>
                      {products.map(p => (
                        <tr key={p._id}>
                          <td>{p._id}</td>
                          <td>{p.name}</td>
                          <td>${p.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              }
            />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
