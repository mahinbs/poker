import React from "react";
import UniversalSignIn from "../../components/UniversalSignIn";

export default function AdminSignIn() {
  return (
    <UniversalSignIn
      role="ADMIN"
      roleDisplayName="Admin"
      redirectPath="/admin"
      gradientFrom="from-purple-400"
      gradientTo="to-pink-600"
      description="Club Administration & Management"
    />
  );
}
