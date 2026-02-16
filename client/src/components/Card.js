export default function Card({ title, value }) {
  return (
    <div style={{
      background: "white",
      padding: "20px",
      borderRadius: "8px",
      flex: 1,
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
    }}>
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}
