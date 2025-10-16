
// ===== API ส่วนกลางของระบบจองโต๊ะ Tasty Bar =====
// ใช้ร่วมกันได้ทุกหน้า เช่น notifications.html, reservation-detail.html, results.html, ฯลฯ

window.API = {
  // ดึงรายการจองทั้งหมด (ใช้ในหน้าแจ้งเตือน)
  async list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`/api/reservations${qs ? "?" + qs : ""}`);
    if (!res.ok) throw new Error("โหลดรายการไม่สำเร็จ");
    return res.json();
  },

  // ดึงรายละเอียดการจอง (ใช้ใน reservation-detail.html)
  async get(id) {
    const res = await fetch(`/api/reservations/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error("ไม่พบข้อมูล");
    return res.json();
  },

  // ค้นหาการจองจากชื่อหรือเบอร์โทร (ใช้ใน results.html)
  async search({ name = "", phone = "" }) {
    const res = await fetch(`/api/reservations/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    if (!res.ok) throw new Error("ค้นหาไม่สำเร็จ");
    return res.json();
  },

  // เพิ่มข้อมูลการจองใหม่ (ใช้ใน reserve.html)
  async create(payload) {
    const res = await fetch(`/api/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("สร้างการจองไม่สำเร็จ");
    return res.json();
  },

  // ยืนยันการจอง
  async confirm(id) {
    const r = await fetch(`/api/reservations/${encodeURIComponent(id)}/confirm`, { method: "POST" });
    if (!r.ok) throw new Error("ยืนยันไม่สำเร็จ");
    return r.json();
  },

  // ยกเลิกการจอง
  async cancel(id, reason = "-") {
    const r = await fetch(`/api/reservations/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (!r.ok) throw new Error("ยกเลิกไม่สำเร็จ");
    return r.json();
  },

  // กู้คืนการจองที่ถูกยกเลิก
  async restore(id) {
    const r = await fetch(`/api/reservations/${encodeURIComponent(id)}/restore`, { method: "POST" });
    if (!r.ok) throw new Error("กู้คืนไม่สำเร็จ");
    return r.json();
  },

  // แปลงสถานะเป็นข้อความภาษาไทย
  statusText(s) {
    switch (s) {
      case "pending": return "รอดำเนินการ";
      case "confirmed": return "ยืนยันแล้ว";
      case "cancelled": return "ยกเลิกแล้ว";
      default: return s;
    }
  }
};

console.log("✅ API.js loaded successfully");
