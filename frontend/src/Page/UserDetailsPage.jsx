import React, { useEffect, useState } from "react";
import { accountService } from "../services/accountService";
import { useNavigate } from "react-router-dom";

const UserDetailsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await accountService.getAccountDetails();
        console.log("Response:", res);
        const userData = res.data?.data || res.data;
        if (res.success && userData) {
          setUser(userData);
        } else {
          setError(res.message || "Failed to load user details");
        }
      } catch (err) {
        setError("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, []);

  if (loading)
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  if (error)
    return (
      <div style={{ padding: 40, color: "red", textAlign: "center" }}>
        {error}
      </div>
    );

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        padding: 32,
      }}
    >
      <h2 style={{ textAlign: "center", color: "#1e3c72", marginBottom: 24 }}>
        Account Details
      </h2>

      {/* Display current user information */}
      <div
        style={{
          marginBottom: 24,
          padding: 16,
          background: "#f8fafc",
          borderRadius: 8,
        }}
      >
        <h3 style={{ marginBottom: 16, color: "#1e3c72" }}>
          Current Information
        </h3>
        <div style={{ marginBottom: 8 }}>
          <b>Username:</b> {user?.username || ""}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Name:</b> {user?.name || ""}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Phone:</b> {user?.phone || ""}
        </div>
        <div style={{ marginBottom: 8 }}>
          <b>Role:</b> {user?.role?.name || ""}
        </div>
      </div>

      <button
        style={{
          padding: "8px 24px",
          borderRadius: 6,
          background: "#eee",
          color: "#1e3c72",
          border: "none",
          fontWeight: 600,
          cursor: "pointer",
        }}
        onClick={() => navigate(-1)}
      >
        Back
      </button>
    </div>
  );
};

export default UserDetailsPage;
