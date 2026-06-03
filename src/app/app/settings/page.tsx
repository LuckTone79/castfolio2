"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, Input, FormField } from "@/components/ui";
import { Save } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  companyName: string;
  brandColor: string;
  commissionRate: number;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "", email: "", phone: "", companyName: "", brandColor: "#ffffff", commissionRate: 15,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/users/me")
      .then((r) => r.json())
      .then((d) => {
        setProfile({
          name: d.name || "",
          email: d.email || "",
          phone: d.phone || "",
          companyName: d.companyName || "",
          brandColor: d.brandColor || "#ffffff",
          commissionRate: d.commissionRate || 15,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    // TODO: implement PATCH /api/users/me
    await new Promise((r) => setTimeout(r, 500));
    setMessage("설정이 저장되었습니다");
    setSaving(false);
  };

  if (loading) {
    return (
      <>
        <PageHeader title="설정" />
        <div className="space-y-4 max-w-lg">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 rounded-lg bg-gray-800 animate-pulse" />)}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="설정" description="계정 및 브랜드 설정을 관리합니다" />

      <div className="max-w-lg space-y-8">
        {/* Account */}
        <section>
          <h3 className="text-base font-semibold text-white mb-4">계정 정보</h3>
          <div className="space-y-4">
            <FormField label="이름">
              <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </FormField>
            <FormField label="이메일">
              <Input value={profile.email} disabled className="opacity-60" />
            </FormField>
            <FormField label="전화번호">
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="010-0000-0000" />
            </FormField>
          </div>
        </section>

        {/* Brand */}
        <section>
          <h3 className="text-base font-semibold text-white mb-4">브랜드</h3>
          <div className="space-y-4">
            <FormField label="회사/브랜드명">
              <Input value={profile.companyName} onChange={(e) => setProfile({ ...profile, companyName: e.target.value })} placeholder="방송인 매니지먼트" />
            </FormField>
            <FormField label="브랜드 컬러">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={profile.brandColor}
                  onChange={(e) => setProfile({ ...profile, brandColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-gray-700"
                />
                <Input value={profile.brandColor} onChange={(e) => setProfile({ ...profile, brandColor: e.target.value })} className="w-28" />
              </div>
            </FormField>
          </div>
        </section>

        {/* Commission */}
        <section>
          <h3 className="text-base font-semibold text-white mb-4">수수료</h3>
          <FormField label="수수료율 (%)" hint="플랫폼 수수료율입니다. 관리자만 변경 가능합니다.">
            <Input type="number" value={profile.commissionRate} disabled className="w-28 opacity-60" />
          </FormField>
        </section>

        {message && (
          <p className="text-sm text-emerald-400 bg-emerald-900/20 rounded-lg px-3 py-2">{message}</p>
        )}

        <Button onClick={handleSave} loading={saving}>
          <Save size={14} /> 저장
        </Button>
      </div>
    </>
  );
}
