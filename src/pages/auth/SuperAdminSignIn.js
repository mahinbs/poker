import React from "react";
import UniversalSignIn from "../../components/UniversalSignIn";

export default function SuperAdminSignIn() {
  return (
    <UniversalSignIn
      role="SUPER_ADMIN"
      roleDisplayName="Super Admin"
      redirectPath="/super-admin"
      gradientFrom="from-blue-400"
      gradientTo="to-indigo-600"
      description="Tenant-level Administration"
    />
  );
}
