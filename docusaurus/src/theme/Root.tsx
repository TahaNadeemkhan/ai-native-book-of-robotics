import React from 'react';
import AuthToggle from '@site/src/components/AuthToggle';

// This component wraps the entire application.
// It can be used for global context providers or layout implementation.
export default function Root({children}: {children: React.ReactNode}) {
  return (
    <>
      {children}
      <AuthToggle />
    </>
  );
}
