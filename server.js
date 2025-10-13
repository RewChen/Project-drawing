// server.js
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ helper: gen id
function genId(len = 6) {
  const c = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

// ✅ middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // <- สำคัญถ้า submit form
app.use(express.static(path.join(__dirname, "frontend"))); // <- ใช้ __dirname ให้ชัวร์

const DB_PATH = path.join(__dirname, "db.json");

// ✅ db helpers
function ensureDB() {
  if (!fs.existsSync(DB_PATH)) {
    const seed = {
      reservations: [
        { id: "RSV001", table: "1", name: "ไอเติ้ล", phone: "0999999999", date: "18/04/2023", email: "12345@gmail.com", status: "pending" },
        { id: "RSV002", table: "2", name: "ออมสิน", phone: "0812345678", date: "05/05/2024", email: "aomsin@example.com", status: "pending" }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(seed, null, 2));
  }
}
function loadDB() {
  ensureDB();
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}
function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ✅ default route -> main.html
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "main.html"));
});

// ✅ list
app.get("/api/reservations", (_req, res) => {
  const db = loadDB();
  res.json(db.reservations);
});

// ✅ search by name/phone (รองรับทั้ง JSON และ form-urlencoded)
app.post("/api/reservations/search", (req, res) => {
  const { name = "", phone = "" } = req.body || {};
  const db = loadDB();
  const results = db.reservations.filter(
    (r) => (!name || r.name.includes(name)) && (!phone || r.phone.includes(phone))
  );
  res.json(results);
});

// ✅ get by id
app.get("/api/reservations/:id", (req, res) => {
  const db = loadDB();
  const item = db.reservations.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: "ไม่พบข้อมูล" });
  res.json(item);
});

// ✅ confirm
app.post("/api/reservations/:id/confirm", (req, res) => {
  const db = loadDB();
  const item = db.reservations.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: "ไม่พบข้อมูล" });
  item.status = "confirmed";
  saveDB(db);
  res.json({ message: "ยืนยันการจองสำเร็จ", item });
});

// ✅ cancel
app.post("/api/reservations/:id/cancel", (req, res) => {
  const db = loadDB();
  const item = db.reservations.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: "ไม่พบข้อมูล" });
  item.status = "canceled";
  item.reason = req.body?.reason || "-";
  saveDB(db);
  res.json({ message: "ยกเลิกการจองสำเร็จ", item });
});

// ✅ restore
app.post("/api/reservations/:id/restore", (req, res) => {
  const db = loadDB();
  const item = db.reservations.find((r) => r.id === req.params.id);
  if (!item) return res.status(404).json({ error: "ไม่พบข้อมูล" });
  item.status = "pending";
  saveDB(db);
  res.json({ message: "กู้คืนรายการสำเร็จ", item });
});

// ✅ create
app.post("/api/reservations", (req, res) => {
  const { table, name, phone, email, date } = req.body || {};
  if (!table || !name || !phone || !date) {
    return res.status(400).json({ error: "กรอกข้อมูลให้ครบ: table, name, phone, date" });
  }
  const db = loadDB();
  const newItem = {
    id: "RSV" + genId(4),
    table,
    name,
    phone,
    email: email || "",
    date,
    status: "pending",
  };
  db.reservations.push(newItem);
  saveDB(db);
  res.json({ message: "บันทึกการจองสำเร็จ", newItem });
});

// ✅ start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
