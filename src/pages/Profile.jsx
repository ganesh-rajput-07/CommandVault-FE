import { useEffect, useState } from "react";
import api from "../api";
import PromptCard from "../components/PromptCard";

export default function Profile() {
  const [prompts, setPrompts] = useState([]);

  const loadMyPrompts = async () => {
    const res = await api.get("prompts/mine/");
    setPrompts(res.data);
  };

  useEffect(() => {
    loadMyPrompts();
  }, []);

  return (
    <div>
      <h2>My Prompts</h2>
      {prompts.map((p) => (
        <PromptCard key={p.id} prompt={p} />
      ))}
    </div>
  );
}
