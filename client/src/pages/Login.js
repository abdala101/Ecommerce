import { useState } from "react";
import axios from "axios";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // ✅ added error state

  const login = async () => {
    try {
      setError(""); // ✅ clear previous errors

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/login`,
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);

    } catch (err) {
      if (err.response) {
        setError(err.response.data.error); // ✅ backend error message
      } else {
        setError("Server error"); // ✅ network/server issue
      }
    }
  };

  return (
    <div>
      <h1>Admin Login</h1>

      {/* ✅ Show error message */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={login}>Login</button>
    </div>
  );
}
