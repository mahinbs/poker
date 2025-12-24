import React from "react";
import UniversalSignIn from "../../components/UniversalSignIn";

export default function MasterAdminSignIn() {
  return (
    <UniversalSignIn
      role="MASTER_ADMIN"
      roleDisplayName="Master Admin"
      redirectPath="/master-admin"
      gradientFrom="from-indigo-400"
      gradientTo="to-purple-600"
      description="System-wide Administration"
    />
  );
}
