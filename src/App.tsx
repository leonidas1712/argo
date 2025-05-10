import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [result, setResult] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function greet() {
    setLoading(true);
    const res = await invoke<string>("chat_request", { name });
    setResult(res ?? "");
    setLoading(false);
  }

  return (
    <main className="container">
      <h1>Welcome to Argo</h1>

      <p>Enter your name below!</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>

      {loading ? <p>Loading...</p> : <p>Result: {result.length > 0 ? result : "Empty result."}</p>}
    </main>
  );
}

export default App;
