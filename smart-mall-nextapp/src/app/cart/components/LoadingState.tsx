"use client";

import React from "react";
import CartHeader from "./CartHeader";

export default function LoadingState() {
  return (
    <>
      <CartHeader />
      <div className="bg-gray-50 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading cart...</p>
        </div>
      </div>
    </>
  );
}