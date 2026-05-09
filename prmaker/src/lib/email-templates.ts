/**
 * Castfolio branded email templates.
 * Each function returns { subject, html } ready to pass to sendEmail().
 *
 * Design system:
 * - Background: #f7f4ee (warm off-white)
 * - Card: white, border-radius 24px
 * - Brand: #7C5CFC (purple)
 * - CTA button: #0f172a (slate-950)
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://castfolio.wideget.net";

// ────────────────────────────────────────────────────────────────────────────
// Shared layout wrapper
// ────────────────────────────────────────────────────────────────────────────
function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Castfolio</title>
</head>
<body style="margin:0;padding:0;background:#f7f4ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ee;padding:40px 16px;">
    <tr><td align="center">
      <!-- Brand header -->
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;margin-bottom:16px;">
        <tr>
          <td style="padding:0 0 12px 4px;">
            <span style="display:inline-flex;align-items:center;gap:8px;">
              <span style="display:inline-block;width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#7C5CFC 0%,#5A3FD8 100%);color:white;font-size:12px;font-weight:700;text-align:center;line-height:26px;">C</span>
              <span style="font-size:14px;font-weight:600;color:#0f172a;letter-spacing:-0.02em;">Castfolio</span>
            </span>
          </td>
        </tr>
      </table>
      <!-- Main card -->
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:white;border-radius:24px;border:1px solid rgba(0,0,0,0.08);overflow:hidden;">
        <tr><td style="padding:36px 40px 32px;">
          ${content}
        </td></tr>
      </table>
      <!-- Footer -->
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;margin-top:20px;">
        <tr>
          <td style="text-align:center;padding:0 4px;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
              Castfolio &middot; <a href="${APP_URL}" style="color:#94a3b8;text-decoration:none;">${APP_URL}</a>
              <br />이 이메일은 Castfolio 파트너 서비스 이용에 따라 발송되었습니다.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, href: string, color = "#0f172a"): string {
  return `<a href="${href}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:${color};color:white;font-size:14px;font-weight:600;border-radius:12px;text-decoration:none;letter-spacing:-0.01em;">${label} →</a>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #f1f5f9;margin:24px 0;" />`;
}

// ────────────────────────────────────────────────────────────────────────────
// 1. 자료 수집 링크 발송 (파트너 → 방송인)
// ────────────────────────────────────────────────────────────────────────────
export function intakeRequestTemplate({
  talentName,
  partnerName,
  intakeUrl,
  expiresAt,
}: {
  talentName: string;
  partnerName: string;
  intakeUrl: string;
  expiresAt?: Date | null;
}) {
  const expiry = expiresAt
    ? `<p style="margin:8px 0 0;font-size:12px;color:#f59e0b;font-weight:500;">⏱ 제출 기한: ${expiresAt.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</p>`
    : "";

  const html = baseLayout(`
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#7C5CFC;letter-spacing:0.06em;text-transform:uppercase;">자료 제출 요청</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;">${talentName}님,<br/>PR 홈페이지 자료를 제출해주세요</h1>
    <p style="margin:0;font-size:14px;line-height:1.8;color:#475569;">
      안녕하세요, <strong>${talentName}</strong>님.<br/>
      <strong>${partnerName}</strong>에서 PR 홈페이지 제작을 진행하고 있습니다.<br/>
      아래 링크를 통해 자료를 제출해주시면 빠르게 제작을 시작하겠습니다.
    </p>
    ${expiry}
    ${divider()}
    <div style="background:#f8f7ff;border-radius:12px;padding:16px 20px;border-left:3px solid #7C5CFC;">
      <p style="margin:0;font-size:12px;font-weight:600;color:#7C5CFC;margin-bottom:6px;">제출 항목 안내</p>
      <ul style="margin:0;padding-left:16px;font-size:13px;color:#64748b;line-height:1.9;">
        <li>이름 · 영문 이름 · 소속</li>
        <li>자기소개 및 방송 경력</li>
        <li>강점/특기, 대표 방송 영상 URL</li>
        <li>연락처 (이메일, 카카오톡 ID 등)</li>
      </ul>
    </div>
    ${ctaButton("자료 제출하기", intakeUrl, "#7C5CFC")}
    <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">버튼이 작동하지 않으면 아래 주소를 복사해 브라우저에 붙여넣으세요:<br/><span style="color:#64748b;">${intakeUrl}</span></p>
  `);

  return {
    subject: `[Castfolio] ${talentName}님, PR 홈페이지 자료 제출을 부탁드립니다`,
    html,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 2. 검수 요청 (파트너 → 방송인)
// ────────────────────────────────────────────────────────────────────────────
export function reviewRequestTemplate({
  talentName,
  partnerName,
  reviewUrl,
}: {
  talentName: string;
  partnerName: string;
  reviewUrl: string;
}) {
  const html = baseLayout(`
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#0ea5e9;letter-spacing:0.06em;text-transform:uppercase;">검수 요청</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;">${talentName}님의<br/>PR 홈페이지가 준비되었습니다</h1>
    <p style="margin:0;font-size:14px;line-height:1.8;color:#475569;">
      안녕하세요, <strong>${talentName}</strong>님.<br/>
      <strong>${partnerName}</strong>에서 제작한 PR 홈페이지를 검토해주세요.<br/>
      페이지를 확인하고 승인하거나 수정이 필요한 부분을 알려주시면 빠르게 반영하겠습니다.
    </p>
    ${divider()}
    <table cellpadding="0" cellspacing="0" style="width:100%">
      <tr>
        <td style="width:50%;padding-right:8px;">
          <div style="background:#f0fdf4;border-radius:12px;padding:14px 16px;border:1px solid #bbf7d0;">
            <p style="margin:0;font-size:12px;font-weight:700;color:#15803d;">✓ 최종 승인</p>
            <p style="margin:4px 0 0;font-size:12px;color:#166534;line-height:1.5;">현재 구성 그대로 납품 진행</p>
          </div>
        </td>
        <td style="width:50%;padding-left:8px;">
          <div style="background:#fffbeb;border-radius:12px;padding:14px 16px;border:1px solid #fde68a;">
            <p style="margin:0;font-size:12px;font-weight:700;color:#b45309;">✎ 수정 요청</p>
            <p style="margin:4px 0 0;font-size:12px;color:#92400e;line-height:1.5;">수정 내용 메모 후 전달</p>
          </div>
        </td>
      </tr>
    </table>
    ${ctaButton("PR 페이지 검수하기", reviewUrl, "#0f172a")}
    <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">링크: <span style="color:#64748b;">${reviewUrl}</span></p>
  `);

  return {
    subject: `[Castfolio] ${talentName}님의 PR 홈페이지 검수를 요청드립니다`,
    html,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 3. 배포 완료 알림 (방송인에게)
// ────────────────────────────────────────────────────────────────────────────
export function deliveryCompleteTemplate({
  talentName,
  pageUrl,
  partnerName,
}: {
  talentName: string;
  pageUrl: string;
  partnerName: string;
}) {
  const html = baseLayout(`
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#10b981;letter-spacing:0.06em;text-transform:uppercase;">배포 완료</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;">🎉 ${talentName}님의<br/>PR 홈페이지가 공개되었습니다!</h1>
    <p style="margin:0;font-size:14px;line-height:1.8;color:#475569;">
      <strong>${partnerName}</strong>에서 제작한 PR 홈페이지가 정식 공개되었습니다.<br/>
      아래 링크를 소셜 미디어, 명함, 이메일 서명 등에 자유롭게 활용해주세요.
    </p>
    ${divider()}
    <div style="background:#f0fdf4;border-radius:14px;padding:18px 20px;border:1px solid #bbf7d0;">
      <p style="margin:0;font-size:12px;font-weight:600;color:#15803d;margin-bottom:6px;">나의 PR 페이지 주소</p>
      <p style="margin:0;font-size:15px;font-weight:700;color:#0f172a;word-break:break-all;">${pageUrl}</p>
    </div>
    ${ctaButton("내 PR 페이지 보기", pageUrl, "#10b981")}
    <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#94a3b8;">
      수정이 필요하거나 궁금한 점이 있으면 <strong>${partnerName}</strong>으로 연락해주세요.
    </p>
  `);

  return {
    subject: `[Castfolio] ${talentName}님의 PR 홈페이지가 공개되었습니다 🎉`,
    html,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 4. 정산 안내 (플랫폼 → 파트너)
// ────────────────────────────────────────────────────────────────────────────
export function settlementNoticeTemplate({
  partnerName,
  periodLabel,
  totalAmount,
  commissionAmount,
  settlementAmount,
  orderCount,
  dashboardUrl,
}: {
  partnerName: string;
  periodLabel: string;    // e.g. "2026년 5월"
  totalAmount: number;
  commissionAmount: number;
  settlementAmount: number;
  orderCount: number;
  dashboardUrl: string;
}) {
  const fmt = (n: number) => n.toLocaleString("ko-KR");

  const html = baseLayout(`
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#8b5cf6;letter-spacing:0.06em;text-transform:uppercase;">정산 안내</p>
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;">${partnerName}님,<br/>${periodLabel} 정산 내역을 안내드립니다</h1>
    <p style="margin:0;font-size:14px;line-height:1.8;color:#475569;">
      이번 정산 기간의 매출 내역입니다. 정산 금액은 영업일 기준 3~5일 이내 입금됩니다.
    </p>
    ${divider()}
    <table cellpadding="0" cellspacing="0" style="width:100%;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
      <tr style="background:#f8fafc;">
        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;">항목</td>
        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#64748b;border-bottom:1px solid #e2e8f0;text-align:right;">금액</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9;">처리 주문 수</td>
        <td style="padding:12px 16px;font-size:13px;color:#0f172a;text-align:right;border-bottom:1px solid #f1f5f9;">${orderCount}건</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9;">총 매출</td>
        <td style="padding:12px 16px;font-size:13px;color:#0f172a;text-align:right;border-bottom:1px solid #f1f5f9;">₩${fmt(totalAmount)}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;font-size:13px;color:#475569;border-bottom:1px solid #f1f5f9;">플랫폼 수수료</td>
        <td style="padding:12px 16px;font-size:13px;color:#ef4444;text-align:right;border-bottom:1px solid #f1f5f9;">-₩${fmt(commissionAmount)}</td>
      </tr>
      <tr style="background:#f0fdf4;">
        <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#15803d;">정산 금액</td>
        <td style="padding:14px 16px;font-size:16px;font-weight:800;color:#15803d;text-align:right;">₩${fmt(settlementAmount)}</td>
      </tr>
    </table>
    ${ctaButton("정산 내역 확인하기", dashboardUrl, "#7C5CFC")}
    <p style="margin:12px 0 0;font-size:12px;color:#94a3b8;">문의사항이 있으시면 Castfolio 고객센터로 연락해주세요.</p>
  `);

  return {
    subject: `[Castfolio] ${periodLabel} 정산 안내 — ₩${fmt(settlementAmount)}`,
    html,
  };
}
