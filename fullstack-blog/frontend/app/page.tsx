"use client";
import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
}

export default function Home() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const queryClient = useQueryClient();

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => api.get("api/posts").then((r) => r.data),
  });

  // Create post
  const createMutation = useMutation({
    mutationFn: (data) => api.post("api/posts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Đăng bài thành công!");
      setTitle("");
      setContent("");
      setAuthor("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Không thể kết nối server");
    },
  });

  // Update post
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`api/posts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Sửa bài thành công!");
      setTitle("");
      setContent("");
      setAuthor("");
      setEditingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Không thể cập nhật");
    },
  });

  // Delete post
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Đã xóa bài viết");
    },
    onError: () => toast.error("Xóa thất bại!"),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { title, content, author };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (post: Post) => {
    setTitle(post.title);
    setContent(post.content);
    setAuthor(post.author);
    setEditingId(post.id);
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setAuthor("");
    setEditingId(null);
  };

  return (
    <div>
      <form action="" onSubmit={handleSubmit}>
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
        <button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {editingId ? "Cập nhật bài viết" : "Đăng bài"}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancel}>
            Hủy sửa
          </button>
        )}
      </form>

      {isLoading ? (
        <p>Đang tải...</p>
      ) : (
        posts.map((p) => (
          <div key={p.id}>
            <div>
              <Link href={`/posts/${p.id}`}>
                <h3>{p.title}</h3>
              </Link>
              <p>{p.content}</p>
              <small>Tác giả: {p.author}</small>
              <p>Số bình luận: {p.comments?.length || 0}</p>
            </div>
            <div>
              <button onClick={() => handleEdit(p)}>Sửa</button>
              <button
                onClick={() => deleteMutation.mutate(p.id)}
                disabled={deleteMutation.isPending}
              >
                Xóa
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
