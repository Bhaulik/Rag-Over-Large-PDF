import { AccountantCopilot } from "@/components/accountant-copilot";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accountant Copilot",
  description: "AI-powered assistant for accounting queries",
};

export default function Home() {
  return <AccountantCopilot />;
}
