import React from 'react';
import AuthToggle from '@site/src/components/AuthToggle';
import DroneWidget from '@site/src/components/DroneWidget';

// This component wraps the entire application.
// It can be used for global context providers or layout implementation.
export default function Root({children}: {children: React.ReactNode}) {
  return (
    <>
      {children}
      <AuthToggle />
      <DroneWidget />
    </>
  );
}
