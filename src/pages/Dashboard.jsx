import { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [prompts, setPrompts] = useState([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    const res = await api.get("prompts/");
    setPrompts(res.data);
  };

  const savePrompt = async () => {
    if (!title || !text) return;

    await api.post("prompts/", {
      title,
      text,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setTitle("");
    setText("");
    setTags("");
    loadPrompts();
  };

  const copyPrompt = (text, id) => {
    navigator.clipboard.writeText(text);
    api.post(`prompts/${id}/increment_use/`).catch(() => {});
  };

  const deletePrompt = async (id) => {
    await api.delete(`prompts/${id}/`);
    loadPrompts();
  };

  return (
    <div className="container">
      <h1>CommandVault</h1>

      {/* Create Prompt */}
      <div className="card" style={{ marginTop: 20 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          placeholder="Write your prompt..."
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ marginTop: 10 }}
        />
        <input
          placeholder="tags: logo, react, sql"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          style={{ marginTop: 10 }}
        />
        <button onClick={savePrompt} style={{ marginTop: 10 }}>
          Save Prompt
        </button>
      </div>

      {/* List Prompts */}
      <div style={{ marginTop: 30, display: "grid", gap: 20 }}>
        {prompts.map((p) => (
          <div key={p.id} className="card">
            <h3>{p.title}</h3>

            <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
              {p.tags?.map((t) => (
                <div key={t} className="tag">#{t}</div>
              ))}
            </div>

            <pre style={{ whiteSpace: "pre-wrap" }}>{p.text}</pre>

            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <button onClick={() => copyPrompt(p.text, p.id)}>Copy</button>
              <button onClick={() => deletePrompt(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
