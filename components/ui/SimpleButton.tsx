"use client";
import React from "react";

export const SimpleButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return <button ref={ref} {...props} />;
});
SimpleButton.displayName = "SimpleButton";
