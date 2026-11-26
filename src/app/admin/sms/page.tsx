import { redirect } from "next/navigation";

/** O SMS agora fica junto com o WhatsApp (Configurações › WhatsApp e SMS). */
export default function SmsPage() {
  redirect("/admin/whatsapp#sms");
}
