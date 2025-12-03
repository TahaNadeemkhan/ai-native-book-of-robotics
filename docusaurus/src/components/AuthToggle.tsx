import React, { useEffect } from 'react';
import { useSession, signIn, signOut } from '@site/src/lib/auth-client';

const AuthToggle: React.FC = () => {
  const { data: session, isPending, error } = useSession();

  useEffect(() => {
    console.log("🤖 [CYBERNETIC SYSTEM] Auth State Check:");
    console.log("   > Session Data:", session);
    console.log("   > Loading:", isPending);
    console.log("   > Error:", error);
    console.log("   > Cookie Check:", document.cookie);
  }, [session, isPending, error]);

  const handleLogin = () => {
    // Standardized on localhost
    window.location.href = "http://localhost:8000/api/auth/sign-in/github";
  };

  const handleLogout = async () => {
    await signOut({
      callbackURL: window.location.href,
    });
  };

  return (
    <button
      className={`cyber-button ${session ? '' : 'offline'}`}
      onClick={session ? handleLogout : handleLogin}
      title={session ? "Sever Neural Link" : "Establish Neural Link"}
      style={{ marginLeft: '15px' }}
    >
      <span className="cyber-indicator" />
      {session ? "NEURAL LINK: ACTIVE" : "SYSTEM: OFFLINE"}
    </button>
  );
};

export default AuthToggle;
