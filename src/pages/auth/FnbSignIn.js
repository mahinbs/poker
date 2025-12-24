import React from "react";
import UniversalSignIn from "../../components/UniversalSignIn";

export default function FnbSignIn() {
  return (
    <UniversalSignIn
      role="FNB_STAFF"
      roleDisplayName="F&B Staff"
      redirectPath="/fnb"
      gradientFrom="from-orange-400"
      gradientTo="to-red-600"
      description="Food & Beverage Operations"
    />
  );
}
