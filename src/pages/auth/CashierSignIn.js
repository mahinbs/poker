import React from "react";
import UniversalSignIn from "../../components/UniversalSignIn";

export default function CashierSignIn() {
  return (
    <UniversalSignIn
      role="CASHIER"
      roleDisplayName="Cashier"
      redirectPath="/cashier"
      gradientFrom="from-green-400"
      gradientTo="to-emerald-600"
      description="Financial Operations & Transactions"
    />
  );
}
