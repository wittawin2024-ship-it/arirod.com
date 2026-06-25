"use client";

import React, { useState, useEffect } from "react";
import ConfirmModal from "@/components/admin/ConfirmModal";

interface User {
  id: string;
  email: string;
  role: "admin" | "editor";
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        throw new Error("ไม่สามารถโหลดรายชื่อผู้ใช้ได้ (กรุณาใช้บัญชี Admin)");
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (
    userId: string,
    currentRole: "admin" | "editor"
  ) => {
    const newRole = currentRole === "admin" ? "editor" : "admin";
    setIsUpdating(userId);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถอัปเดตบทบาทได้");

      setUsers(
        users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/users?id=${selectedUser.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบผู้ใช้ได้");

      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการลบผู้ใช้งาน");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 font-mitr">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--carbon-dark)]">
            ผู้ใช้งานระบบ (User Management)
          </h1>
          <p className="text-sm text-[var(--pewter)] mt-1">
            จัดการบทบาทสมาชิก (Admin / Editor) และสิทธิ์การใช้งานระบบ
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Users DataTable Card */}
      <div className="bg-white rounded-lg border border-[var(--cloud-gray)] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--light-ash)] text-[var(--pewter)] text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">อีเมล (Email)</th>
                <th className="px-6 py-4">บทบาท (Role)</th>
                <th className="px-6 py-4">วันที่เข้าร่วม</th>
                <th className="px-6 py-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--cloud-gray)]">
              {loading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-48" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-100 rounded w-24" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="h-4 bg-gray-100 rounded w-12 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono font-medium text-[var(--carbon-dark)]">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${
                          user.role === "admin"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--pewter)] text-xs">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {/* Toggle role button */}
                      <button
                        onClick={() => handleRoleToggle(user.id, user.role)}
                        disabled={isUpdating !== null}
                        className="px-3 py-1.5 border border-[var(--cloud-gray)] hover:border-[var(--electric-blue)] bg-white text-xs font-semibold rounded text-[var(--graphite)] hover:text-[var(--electric-blue)] focus:outline-none transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isUpdating === user.id ? "กำลังบันทึก..." : "สลับบทบาท"}
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 hover:bg-red-600 hover:text-white hover:border-transparent text-xs font-semibold rounded focus:outline-none transition-all cursor-pointer"
                      >
                        ลบออก
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-[var(--silver-fog)]"
                  >
                    ไม่พบข้อมูลผู้ใช้งานระบบ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        isLoading={isDeleting}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="ยืนยันการลบผู้ใช้"
        message={`คุณต้องการลบบัญชีผู้ใช้งาน "${selectedUser?.email}" ออกจากระบบใช่หรือไม่? การดำเนินการนี้จะลบสิทธิ์การเข้าถึงข้อมูลทั้งหมดและไม่สามารถยกเลิกได้`}
        confirmLabel="ลบผู้ใช้งาน"
      />
    </div>
  );
}
