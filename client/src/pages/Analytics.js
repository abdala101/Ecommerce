import { useEffect, useState } from "react";
import axios from "axios";
import Card from "../components/Card"; // ✅ IMPORT CARD
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
  const fetchAnalytics = () => {
    axios.get("http://localhost:5000/analytics")
      .then(res => setAnalytics(res.data));
  };

  fetchAnalytics();

  const interval = setInterval(fetchAnalytics, 5000); // 5s refresh

  return () => clearInterval(interval);
}, []);


  if (!analytics) return <p>Loading...</p>;

  const data = {
    labels: ["Products", "Orders", "Revenue"],
    datasets: [{
      label: "Stats",
      data: [
        analytics.totalProducts,
        analytics.totalOrders,
        analytics.revenue
      ],
    }],
  };

  return (
    <div>
      <h1>Analytics</h1>

      {/* ✅ Cards MUST be inside return */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <Card title="Products" value={analytics.totalProducts} />
        <Card title="Orders" value={analytics.totalOrders} />
        <Card title="Revenue" value={`$${analytics.revenue}`} />
      </div>

      <Bar data={data} />
    </div>
  );
}
