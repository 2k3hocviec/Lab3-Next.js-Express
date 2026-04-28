const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs").promises;
const PATH = "./data.json";

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

app.use((req, _, next) => {
  console.log(req.method, req.url);
  next();
});

async function readData() {
  const raw = await fs.readFile(PATH, "utf-8");
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(PATH, JSON.stringify(data, null, 2));
}

// GET - Lấy tất cả bài viết
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await readData();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Lỗi đọc dữ liệu" });
  }
});

// POST - Tạo bài viết mới
app.post("/api/posts", async (req, res) => {
  try {
    console.log("POST /api/posts - req.body:", req.body);
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    const posts = await readData();
    const newPost = {
      id: Date.now(),
      title,
      content,
      author,
      createAt: new Date().toISOString(),
    };

    posts.push(newPost);
    await writeData(posts);
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: "Lỗi tạo bài viết" });
  }
});

// PUT - Sửa bài viết
app.put("/api/posts/:id", async (req, res) => {
  try {
    console.log("PUT /api/posts/:id - req.body:", req.body);
    const id = Number(req.params.id);
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    const posts = await readData();
    const index = posts.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Không tìm thấy đối tượng" });
    }

    posts[index] = {
      ...posts[index],
      title,
      content,
      author,
      updatedAt: new Date().toISOString(),
    };

    await writeData(posts);
    res.json(posts[index]);
  } catch (err) {
    res.status(500).json({ error: "Lỗi sửa bài viết" });
  }
});

// DELETE - Xóa bài viết
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const posts = await readData();
    const index = posts.findIndex((p) => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Không tìm thấy đối tượng" });
    }

    posts.splice(index, 1);
    await writeData(posts);
    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi xóa bài viết" });
  }
});

app.listen(5000, () => console.log("Backend chạy tại port :5000"));
