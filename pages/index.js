export default function HomePage() {
  return (
    <main style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: 900,
      margin: '3rem auto',
      padding: '0 1.5rem',
      color: '#0f172a',
    }}>
      <h1>Flyrank A4 Auth API</h1>
      <p>
        This project implements the authentication flow required by the PRD using Supabase Auth,
        bearer-token protected routes, and Swagger documentation at <strong>/docs</strong>.
      </p>
      <ul>
        <li>Public route: /public/info</li>
        <li>Auth route: /auth/signup</li>
        <li>Auth route: /auth/login</li>
        <li>Protected route: /protected/profile</li>
        <li>Protected route: /protected/dashboard</li>
      </ul>
    </main>
  );
}
