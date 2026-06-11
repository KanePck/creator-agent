import { useState } from "react";
import { supabase } from "./supabase";

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState("login"); // login or signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handle = async () => {
    if (!email || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("✅ สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยัน");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        onLogin(data.user);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#FAF8F3",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "'DM Sans', 'Sarabun', sans-serif",
    }}>
      <div style={{
        background: "#fff",
        border: "0.5px solid rgba(26,24,20,0.12)",
        borderRadius: 16,
        padding: "32px 28px",
        width: "100%",
        maxWidth: 380,
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 24,
            color: "#1A1814",
          }}>
            Creator <span style={{ fontStyle: "italic", color: "#C8963E" }}>Broadcast</span>
          </h1>
          <p style={{ fontSize: 13, color: "#7A7668", marginTop: 4 }}>
            {mode === "login" ? "เข้าสู่ระบบเพื่อใช้งาน" : "สร้างบัญชีใหม่ฟรี"}
          </p>
        </div>

        {/* Mode toggle */}
        <div style={{
          display: "flex",
          background: "#F5F3EE",
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
        }}>
          {["login", "signup"].map((m) => (
            <button key={m}
              onClick={() => { setMode(m); setError(""); setMessage(""); }}
              style={{
                flex: 1,
                padding: "7px",
                borderRadius: 7,
                border: "none",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#1A1814" : "#7A7668",
                boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
                transition: "all 0.15s",
              }}>
              {m === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
            </button>
          ))}
        </div>

        {/* Email */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#7A7668", marginBottom: 5 }}>
            อีเมล
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            onKeyDown={(e) => e.key === "Enter" && handle()}
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "0.5px solid rgba(26,24,20,0.12)",
              borderRadius: 8,
              fontSize: 14,
              fontFamily: "inherit",
              outline: "none",
              color: "#1A1814",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#7A7668", marginBottom: 5 }}>
            รหัสผ่าน
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "อย่างน้อย 6 ตัวอักษร" : "รหัสผ่านของคุณ"}
            onKeyDown={(e) => e.key === "Enter" && handle()}
            style={{
              width: "100%",
              padding: "9px 12px",
              border: "0.5px solid rgba(26,24,20,0.12)",
              borderRadius: 8,
              fontSize: 14,
              fontFamily: "inherit",
              outline: "none",
              color: "#1A1814",
            }}
          />
        </div>

        {/* Error / Message */}
        {error && (
          <div style={{
            fontSize: 12,
            color: "#E24B4A",
            background: "#FFF0F0",
            padding: "8px 12px",
            borderRadius: 8,
            marginBottom: 12,
          }}>{error}</div>
        )}
        {message && (
          <div style={{
            fontSize: 12,
            color: "#1D9E75",
            background: "#F0FFF8",
            padding: "8px 12px",
            borderRadius: 8,
            marginBottom: 12,
          }}>{message}</div>
        )}

        {/* Submit button */}
        <button
          onClick={handle}
          disabled={loading}
          style={{
            width: "100%",
            padding: 13,
            borderRadius: 10,
            background: loading ? "#ccc" : "#1A1814",
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}>
          {loading ? "กำลังดำเนินการ..." : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิกฟรี"}
        </button>

        {/* Free tier note */}
        {mode === "signup" && (
          <p style={{ fontSize: 11, color: "#7A7668", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
            ฟรี 10 generations/เดือน 🎨
          </p>
        )}
      </div>
    </div>
  );
}
