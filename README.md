
# Argo

**Argo** is a local-first AI-powered desktop app that lets you chat with your `.txt` and `.md` files using a local LLM via [Ollama](https://ollama.com). Built with **Tauri**, **Rust**, and **React**, it runs entirely offline for full privacy and performance.

---

## ✨ Features

- 💬 Chat interface powered by a local LLM via **Ollama**
- 📂 Load and parse local text/markdown files
- 🧠 Chunking and retrieval (RAG)
- ⚡ Streaming responses (WIP)
- 🗃️ Embeddings stored in local SQLite

---

## 🧱 Tech Stack

- **Frontend:** React + Mantine UI (inside Tauri)
- **Backend:** Rust + Tauri commands
- **Model Backend:** Ollama (runs local models like Qwen, LLaMA3, etc.)
- **Vector Store:** SQLite with raw cosine similarity (for now)

---

## 🚧 Roadmap

- [X] Basic chat interface
- [X] Connect to Ollama via `ollama-rs`
- [ ] Streaming token-based responses
- [ ] File ingestion and embedding
- [ ] Context-aware RAG pipeline
- [ ] Persistent chat and file index
- [ ] Tool call support (e.g. shell commands, reminders)

---

## 📦 Getting Started

> TODO

## 🧠 Philosophy

Argo is designed to be small, private, and transparent — a tool that helps you think, write, and explore without ever leaving your machine.

---

## License

MIT
