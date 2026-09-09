import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./login-form";
import styles from "../pastoral.module.css";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (user && !error) redirect("/admin");
  return (
    <main className={styles.loginPage}>
      <div className={styles.loginContent}>
        <header className={styles.loginHeader}>
          <p className={styles.brand}>Prayer Cloud</p>
          <h1 className={styles.title}>Acesso do pastor</h1>
        </header>
        <LoginForm />
      </div>
    </main>
  );
}
