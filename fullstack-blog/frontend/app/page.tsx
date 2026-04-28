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
  const [editingId, setEditingId] = useState<number | null>(null);

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
      if (editingId) {
        await api.put(`api/posts/${editingId}`, {
          title,
          content,
          author,
        });

        toast.success("Sửa bài thành công!");
        setTitle("");
        setContent("");
        setAuthor("");
        await fetchPosts();
        setEditingId(null);
      } else {
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
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Không thể kết nối server");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/posts/${id}`);

      setPosts((prev) => prev.filter((p) => p.id !== id));

      toast.success("Đã xóa thành công");
    } catch (error) {
      toast.error("Xóa thất bại");
      fetchPosts();
    }
  };

  const handleEdit = (post: Post) => {
    setTitle(post.title);
    setContent(post.content);
    setAuthor(post.author);
    setEditingId(post.id);
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
        <button type="submit">
          {editingId ? "Cập nhật bài viết" : "Đăng bài"}
        </button>
      </form>
      {posts.map((p) => (
        <div key={p.id}>
          <div>
            <h3>{p.title}</h3>
            <p>{p.content}</p>
            <small>Tác giả: {p.author}</small>
          </div>
          <div>
            <button onClick={() => handleEdit(p)}>Sửa</button>
            <button onClick={() => handleDelete(p.id)}>Xóa</button>
          </div>
        </div>
      ))}
    </div>
  );
}
