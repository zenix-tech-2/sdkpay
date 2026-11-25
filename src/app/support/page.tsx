import Gate from "@/components/gate";
import { SectionLabel, Panel } from "@/components/ui";
import { Accordion } from "@/components/bits";
import SupportContact from "@/components/support-contact";
import { MessageCircle, ExternalLink } from "lucide-react";

const FAQS: [string, string][] = [
  ["How do I top up my account?", "Go to Deposit and choose your preferred payment method (Mobile Money or Crypto). Enter the amount, confirm the fees shown, and approve the prompt on your phone. Your balance updates as soon as the payment is confirmed."],
  ["How long does a withdrawal take?", "Withdrawals are processed within 24 business hours. Mobile Money is generally faster (a few minutes) once your request is approved. You will get an SMS and an in-app notification."],
  ["What are the fees?", "Mobile Money deposits and withdrawals: 4.00%. USDT deposits: 2.5%. USDT network fee: 1.00 USDT. Internal SDK Pay transfers: always free. A verified referral cuts your fees by 50% for 5 days."],
  ["How do payment links work?", "Create a link from My links → New link. Share the URL or QR code anywhere. Customers pay with Mobile Money — funds land on your balance, and you can track clicks, collections and export a PDF receipt per payment."],
  ["Why did my deposit fail?", "The most common cause is an insufficient Mobile Money balance or a wrong PIN. No amount was debited. Check the transaction details, then retry from the Deposit screen."],
  ["How do I get a refund?", "Refunds are issued to the original payment method after our team reviews the request (1–3 business days). Email refunds@sdkpay.com with the transaction reference (ASH-…)."],
];

export default function SupportPage() {
  return (
    <Gate>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink sm:text-[32px]">Support</h1>
      <p className="text-[13px] text-slate-500">How can we help you?</p>

      <SectionLabel><span className="mt-5 block">Contact us</span></SectionLabel>
      <div className="max-w-2xl">
        <SupportContact />
      </div>

      {/* WhatsApp channel */}
      <a href="https://wa.me/237683677872" target="_blank" rel="noreferrer" className="mt-4 flex max-w-2xl items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition hover:bg-emerald-100/70">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="#fff"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.55 4.14 1.6 5.95L2.05 22l4.33-1.13c1.73.94 3.68 1.44 5.66 1.44h.01c5.46 0 9.9-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.52 14.12c-.24.67-1.4 1.28-1.93 1.36-.49.07-1.12.1-1.8-.11-.42-.13-.95-.31-1.63-.6-2.88-1.24-4.75-4.14-4.9-4.34-.14-.2-1.16-1.55-1.16-2.95 0-1.4.73-2.09 1-2.38.26-.29.57-.36.76-.36h.55c.17 0 .4-.07.63.48.24.57.81 1.98.88 2.13.07.14.12.31.02.5-.1.2-.15.31-.3.48-.14.17-.3.37-.43.5-.15.14-.3.3-.13.58.17.29.77 1.27 1.66 2.06 1.14 1.01 2.1 1.32 2.4 1.47.29.15.46.12.63-.07.17-.2.73-.86.93-1.15.19-.29.38-.24.64-.14.26.1 1.68.79 1.97.93.29.15.48.22.55.34.07.12.07.68-.17 1.34z"/></svg>
        </span>
        <span>
          <span className="block text-[15px] font-extrabold text-ink">Join our WhatsApp channel</span>
          <span className="mt-0.5 block text-[12.5px] text-slate-500">Stay informed of the latest SDK Pay news and updates</span>
          <span className="mt-2.5 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-[13px] font-bold text-emerald-700 shadow-sm"><MessageCircle size={16} /> Join the channel <ExternalLink size={14} /></span>
        </span>
      </a>

      {/* FAQ */}
      <SectionLabel><span className="mt-6 block">Frequently asked questions</span></SectionLabel>
      <Panel className="max-w-2xl divide-y divide-slate-100 overflow-hidden">
        {FAQS.map(([q, a]) => (
          <Accordion key={q} title={<span className="text-[13.5px]">{q}</span>}>
            <p className="text-[13px] leading-relaxed text-slate-500">{a}</p>
          </Accordion>
        ))}
      </Panel>
    </Gate>
  );
}
