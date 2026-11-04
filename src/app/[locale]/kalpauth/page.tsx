import { Metadata } from "next";
import LoginFormSection from '@/components/auth/LoginFormSection';

export const metadata: Metadata = {
  title: "Sign In | PeeKeeper",
  robots: { index: false, follow: false },
};

export default function KalpAuthPage() {
  return <LoginFormSection />;
}
