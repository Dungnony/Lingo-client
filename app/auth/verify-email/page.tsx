"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Card, PageHeading, Spinner } from "@/components/ui";
import { api } from "@/lib/api";

function VerifyInner() {
  const token = useSearchParams().get("token") ?? "";
  const [result, setResult] = useState<"loading" | "ok" | "fail">("loading");
  // A link without a token can never verify, so there is nothing to wait for.
  const state = token ? result : "fail";

  useEffect(() => {
    if (!token) return;
    void api
      .post("/auth/verify-email", { token })
      .then(() => setResult("ok"))
      .catch(() => setResult("fail"));
  }, [token]);

  return (
    <Card className="mt-6 text-sm">
      {state === "loading" && <Spinner />}
      {state === "ok" && (
        <p>
          Đã xác minh email.{" "}
          <Link href="/dashboard" className="text-primary hover:underline">
            Vào học
          </Link>
        </p>
      )}
      {state === "fail" && (
        <p className="text-primary">
          Liên kết không hợp lệ hoặc đã hết hạn.
        </p>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <PageHeading
        icon="check"
        tone="good"
        eyebrow="Tài khoản Lingo"
        title="Xác minh email"
        description="Xác nhận địa chỉ email để tiếp tục hành trình học của bạn."
      />
      <Suspense fallback={<Spinner />}>
        <VerifyInner />
      </Suspense>
    </div>
  );
}
