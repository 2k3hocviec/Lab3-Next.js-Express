// app/posts/[id]/page.tsx
"use client";

import api from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";

interface Comment {
  id: number;
  author: string;
  content: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  comments: Comment[];
}

export default function PostPage() {
  const params = useParams();
  const postId = Number(params.id);
  const queryClient = useQueryClient();

  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentContent, setCommentContent] = useState("");

  // Fetch bài viết chi tiết
  const { data: post, isLoading: isLoadingPost } = useQuery<Post>({
    queryKey: ["post", postId],
    queryFn: () => api.get(`/api/posts/${postId}`).then((res) => res.data),
    enabled: !!postId,
  });

  // Fetch comments
  const { data: comments = [], isLoading: isLoadingComments } = useQuery<
    Comment[]
  >({
    queryKey: ["comments", postId],
    queryFn: () =>
      api.get(`/api/posts/${postId}/comments`).then((res) => res.data),
    enabled: !!postId,
  });

  // Mutation để thêm comment
  const addCommentMutation = useMutation({
    mutationFn: (newComment: { author: string; content: string }) =>
      api.post(`/api/posts/${postId}/comments`, newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Đã thêm bình luận!");
      setCommentAuthor("");
      setCommentContent("");
    },
    onError: () => {
      toast.error("Thêm bình luận thất bại!");
    },
  });

  // Mutation để xóa comment
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => api.delete(`/api/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Đã xóa bình luận!");
    },
    onError: () => {
      toast.error("Xóa bình luận thất bại!");
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentAuthor || !commentContent) {
      toast.error("Vui lòng nhập đủ thông tin!");
      return;
    }
    addCommentMutation.mutate({
      author: commentAuthor,
      content: commentContent,
    });
  };

  if (isLoadingPost) return <p>Đang tải bài viết...</p>;
  if (!post) return <p>Không tìm thấy bài viết.</p>;

  return (
    <div>
      <article>
        <h1>{post.title}</h1>
        <p>Tác giả: {post.author}</p>
        <p>{post.content}</p>
      </article>

      <section>
        <h2>Bình luận ({comments.length})</h2>

        {/* Form thêm bình luận */}
        <form onSubmit={handleCommentSubmit}>
          <input
            type="text"
            value={commentAuthor}
            onChange={(e) => setCommentAuthor(e.target.value)}
            placeholder="Tên của bạn"
          />
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Viết bình luận..."
          />
          <button type="submit" disabled={addCommentMutation.isPending}>
            Gửi bình luận
          </button>
        </form>

        {/* Danh sách bình luận */}
        <div>
          {isLoadingComments ? (
            <p>Đang tải bình luận...</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id}>
                <p>
                  <strong>{comment.author}:</strong> {comment.content}
                </p>
                <button
                  onClick={() => deleteCommentMutation.mutate(comment.id)}
                >
                  Xóa
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
