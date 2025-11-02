// src/app/login/page.tsx

import { LoginForm } from "@/components/login/LoginForm";
import LoginImage from "@/components/login/LoginImage";


export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <LoginForm />
      <LoginImage />
    </div>
  );
}
