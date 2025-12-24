import React from "react";
import UniversalSignIn from "../../components/UniversalSignIn";

export default function HrSignIn() {
  return (
    <UniversalSignIn
      role="HR"
      roleDisplayName="HR"
      redirectPath="/hr"
      gradientFrom="from-pink-400"
      gradientTo="to-rose-600"
      description="Human Resources & Staff Management"
    />
  );
}
