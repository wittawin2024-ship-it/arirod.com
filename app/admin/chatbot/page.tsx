"use client";

import React, { useState, useEffect } from "react";
import { ChatbotSettings, ChatbotSkill } from "@/lib/chatbot-settings";

export default function ChatbotSettingsPage() {
  const [settings, setSettings] = useState<ChatbotSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // States for adding a new custom skill
  const [newSkillTitle, setNewSkillTitle] = useState("");
  const [newSkillDesc, setNewSkillDesc] = useState("");
  const [newSkillPrompt, setNewSkillPrompt] = useState("");
  const [showAddSkill, setShowAddSkill] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/chatbot");
        if (!res.ok) {
          throw new Error("ไม่สามารถดึงการตั้งค่าแชทบอทได้");
        }
        const json = await res.json();
        setSettings(json);
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }

      setSuccess("บันทึกการตั้งค่าแชทบอทและบทบาทเรียบร้อยแล้ว!");
      setSettings(json.settings);
    } catch (err: any) {
      setError(err.message || "เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const handleSkillToggle = (skillId: string) => {
    if (!settings) return;

    const updatedSkills = settings.skills.map((skill) =>
      skill.id === skillId ? { ...skill, enabled: !skill.enabled } : skill
    );

    setSettings({ ...settings, skills: updatedSkills });
  };

  const handleSkillDelete = (skillId: string) => {
    if (!settings) return;

    const updatedSkills = settings.skills.filter((skill) => skill.id !== skillId);
    setSettings({ ...settings, skills: updatedSkills });
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !newSkillTitle.trim() || !newSkillPrompt.trim()) return;

    const newSkill: ChatbotSkill = {
      id: `custom-${Date.now()}`,
      title: newSkillTitle.trim(),
      description: newSkillDesc.trim() || "ทักษะเสริมเพิ่มเติมโดยผู้ดูแลระบบ",
      prompt: newSkillPrompt.trim(),
      enabled: true,
    };

    setSettings({
      ...settings,
      skills: [...settings.skills, newSkill],
    });

    // Reset inputs
    setNewSkillTitle("");
    setNewSkillDesc("");
    setNewSkillPrompt("");
    setShowAddSkill(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 font-mitr">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--electric-blue)]"></div>
        <p className="text-[var(--pewter)] text-sm">กำลังโหลดข้อมูลตั้งค่าแชทบอท...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mitr max-w-5xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--carbon-dark)]">ตั้งค่าแชทบอท (AraiRod AI Settings)</h1>
        <p className="text-sm text-[var(--pewter)] mt-1">
          ปรับแต่งบทบาทแชทบอท ระบบโมเดลประมวลผล และเปิดใช้งาน Skill พิเศษเพื่อให้ได้คำตอบที่สั้นกระชับตรงใจที่สุด
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded text-emerald-700 text-sm">
          {success}
        </div>
      )}

      {settings && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Model & Params */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-lg border border-[var(--cloud-gray)] p-6 shadow-xs space-y-4">
                <h2 className="text-md font-bold text-[var(--carbon-dark)] border-b border-gray-100 pb-3">โมเดลและพารามิเตอร์</h2>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--pewter)]">ชื่อเรียกผู้ช่วย AI</label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[var(--electric-blue)] focus:outline-none text-sm text-[var(--graphite)]"
                    placeholder="เช่น AraiRod AI"
                    required
                  />
                </div>

                {/* Model */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--pewter)]">โมเดล AI (Model ID)</label>
                  <select
                    value={settings.model}
                    onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-[var(--electric-blue)] focus:outline-none text-sm text-[var(--graphite)] bg-white"
                  >
                    <option value="openrouter/free">Auto Free Model (แนะนำ - ฟรีชั่วกัลปาวสาน)</option>
                    <option value="google/gemma-2-9b-it:free">Google Gemma 2 9B (ฟรี)</option>
                    <option value="meta-llama/llama-3-8b-instruct:free">Meta Llama 3 8B (ฟรี)</option>
                    <option value="deepseek/deepseek-chat">DeepSeek Chat V3 (จ่ายตามใช้จริง - เสียค่าบริการ)</option>
                    <option value="openai/gpt-4o-mini">OpenAI GPT-4o Mini (เสียค่าบริการ)</option>
                  </select>
                  <p className="text-[11px] text-[var(--silver-fog)]">
                    *โมเดลประเภทฟรีจะไม่เสียค่าเครดิต API ในการรัน
                  </p>
                </div>

                {/* Temperature */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-xs font-semibold text-[var(--pewter)]">ความสร้างสรรค์ (Temperature)</label>
                    <span className="text-xs font-bold text-[var(--electric-blue)]">{settings.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[var(--silver-fog)]">
                    <span>ตรรกะตรงเป๊ะ (0.0)</span>
                    <span>อิสระสร้างสรรค์ (1.0)</span>
                  </div>
                </div>
              </div>

              {/* Tips block */}
              <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-5 text-sm text-blue-800 space-y-2">
                <h3 className="font-semibold flex items-center gap-1.5">
                  💡 คำแนะนำในการปรับจูน
                </h3>
                <p className="text-xs leading-relaxed text-blue-700/90">
                  หากต้องการควบคุมคำตอบให้มีความกระชับ ให้ปรับค่า <strong className="text-blue-900">Temperature ไปที่ 0.3 - 0.5</strong> และทำการเปิดใช้ทักษะ (Skill) "ตอบคำถามอย่างกระชับ" ด้านขวา
                </p>
              </div>
            </div>

            {/* Right Column: Roles & Skills */}
            <div className="lg:col-span-2 space-y-6">
              {/* Role / System Prompt */}
              <div className="bg-white rounded-lg border border-[var(--cloud-gray)] p-6 shadow-xs space-y-4">
                <h2 className="text-md font-bold text-[var(--carbon-dark)] border-b border-gray-100 pb-3">บทบาทและคำสั่งระบบหลัก (System Prompt)</h2>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--pewter)]">คำสั่งพื้นฐานควบคุมพฤติกรรม AI</label>
                  <textarea
                    rows={12}
                    value={settings.systemPrompt}
                    onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                    className="w-full px-3.5 py-3 border border-gray-300 rounded-md focus:border-[var(--electric-blue)] focus:outline-none text-sm text-[var(--graphite)] leading-relaxed font-mono"
                    placeholder="ใส่ System Prompt ควบคุมระบบ..."
                    required
                  />
                </div>
              </div>

              {/* Skills section */}
              <div className="bg-white rounded-lg border border-[var(--cloud-gray)] p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h2 className="text-md font-bold text-[var(--carbon-dark)]">ทักษะความรู้เฉพาะทาง (Active Skills)</h2>
                  <button
                    type="button"
                    onClick={() => setShowAddSkill(!showAddSkill)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-[var(--electric-blue)] rounded-md hover:bg-blue-700 transition-colors"
                  >
                    + เพิ่มทักษะใหม่
                  </button>
                </div>

                {/* Add Custom Skill Form */}
                {showAddSkill && (
                  <div className="p-4 border border-blue-200 bg-blue-50/20 rounded-lg space-y-3">
                    <h3 className="text-sm font-bold text-blue-900">เพิ่มทักษะความประพฤติ AI ใหม่</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-500">ชื่อทักษะ (Title)</label>
                        <input
                          type="text"
                          value={newSkillTitle}
                          onChange={(e) => setNewSkillTitle(e.target.value)}
                          placeholder="เช่น ตอบเฉพาะภาษาใต้"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-gray-500">คำอธิบายย่อ (Description)</label>
                        <input
                          type="text"
                          value={newSkillDesc}
                          onChange={(e) => setNewSkillDesc(e.target.value)}
                          placeholder="เช่น ให้ AI ใช้สำเนียงภาคใต้"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-500">ข้อความบังคับบทบาท (Prompt Command)</label>
                      <textarea
                        rows={3}
                        value={newSkillPrompt}
                        onChange={(e) => setNewSkillPrompt(e.target.value)}
                        placeholder="เช่น ให้พูดลงท้ายว่า 'ตอ' หรือ 'แหล่ะ' และเขียนบทวิเคราะห์เป็นภาษาใต้เพื่อเพิ่มความเป็นกันเอง..."
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs bg-white focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddSkill(false)}
                        className="px-3 py-1.5 text-xs text-gray-500 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700"
                      >
                        เพิ่มทักษะ
                      </button>
                    </div>
                  </div>
                )}

                {/* Skills Check List */}
                <div className="space-y-3">
                  {settings.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className={`p-4 border rounded-lg flex items-start justify-between gap-4 transition-all ${
                        skill.enabled
                          ? "border-blue-200 bg-blue-50/10"
                          : "border-gray-200 bg-gray-50/20"
                      }`}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[var(--carbon-dark)]">{skill.title}</h3>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              skill.enabled
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {skill.enabled ? "เปิดใช้" : "ปิด"}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--pewter)]">{skill.description}</p>
                        <p className="text-[11px] text-[var(--silver-fog)] bg-gray-50 p-2 rounded border border-gray-100 font-mono mt-2">
                          Command: "{skill.prompt}"
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {/* Switch Switch */}
                        <button
                          type="button"
                          onClick={() => handleSkillToggle(skill.id)}
                          className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                            skill.enabled ? "bg-blue-600" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                              skill.enabled ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        
                        {/* Delete btn */}
                        <button
                          type="button"
                          onClick={() => handleSkillDelete(skill.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="ลบทักษะนี้"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-gray-200 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[var(--electric-blue)] text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่าทั้งหมด"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
