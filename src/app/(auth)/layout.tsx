export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <main id="main-content">{children}</main>
    </>
  );
}
