const express = require("express");
const cors = require("cors");
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // chỉ cho phép NextJS
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

// Middleware log tổng quát
app.use((req, _, next) => {
  console.log(req.method, req.url);
  next();
});

let posts = [
  {
    id: 1,
    title: "Bài viết đầu tiên",
    content: "Nội dung bài 1",
    author: "Admin",
  },
  {
    id: 2,
    title: "Hướng dẫn NextJS",
    content: "Nội dung bài 2",
    author: "Admin",
  },
];

app.get("/api/posts", (req, res) => {
  console.log(req.body);
  res.json(posts);
});

app.post("/api/posts", (req, res) => {
  console.log(req.body);
  const { title, content, author } = req.body;
  if (!title || !content || !author) {
    return res.status(400).json({ error: "Thiếu dữ liệu" });
  }

  const newPost = {
    id: Date.now(),
    title,
    content,
    author,
    createAt: new Date().toISOString(),
  };

  posts.push(newPost);
  res.status(201).json(newPost);
});

app.delete("/api/posts/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = posts.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Không tìm thấy đối tượng" });
  }

  posts.splice(index, 1);
  res.json({
    message: "Đã xóa thành công",
  });
});

app.listen(5000, () => console.log("Backend chạy tại port :5000"));
