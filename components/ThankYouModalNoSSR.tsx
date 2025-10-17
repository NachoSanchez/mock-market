// components/ThankYouModal.lazy.tsx
"use client";
import dynamic from "next/dynamic";

const ThankYouModal = dynamic(() => import("./ThankYouModal"), { ssr: false });

export default ThankYouModal;
