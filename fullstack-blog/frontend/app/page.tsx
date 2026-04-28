"use client";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");

  const fetchPosts = async () => {
    const res = await fetch("http://localhost:5000/api/posts");
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSudmbit = async (e) => {
    e.preventDefault();
    try {
      await api.post("api/posts", {
        title,
        content,
        author,
      });
      toast.success("Đăng bài thành công!");
      setTitle("");
      setContent("");
      setAuthor("");
      await fetchPosts();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Không thể kết nối server");
      console.error(err);
    }
  };

  return (
    <div>
      <form action="" onSubmit={handleSudmbit}>
        <input
          type="text"
          value={title}
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          value={content}
          placeholder="Context"
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="text"
          value={author}
          placeholder="Author"
          onChange={(e) => setAuthor(e.target.value)}
        />
        <button type="submit">Đăng bài</button>
      </form>
      {posts.map((p) => (
        <div key={p.id}>
          <h3>{p.title}</h3>
          <p>{p.content}</p>
          <small>Tác giả: {p.author}</small>
        </div>
      ))}
    </div>
  );
}
