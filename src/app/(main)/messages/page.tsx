import { Metadata } from "next";
import { Suspense } from "react";
import Chat from "./Chat";
import { ChatErrorBoundary } from "./ChatErrorBoundary";

export const metadata: Metadata = {
  title: "Messages",
};

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-pulse">Loading messages...</div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ChatErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Chat />
      </Suspense>
    </ChatErrorBoundary>
  );
}