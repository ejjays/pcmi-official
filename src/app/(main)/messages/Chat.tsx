"use client";

import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Chat as StreamChat } from "stream-chat-react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import useInitializeChatClient from "./useInitializeChatClient";

function TopBar() {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-[2vh] bg-card z-20"></div>
  );
}

function BottomBar() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[2vh] bg-card z-20"></div>
  );
}

function LoadingState({ status }: { status: string }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4" 
      style={{ backgroundColor: `hsl(var(--background))` }} 
    >
      <Loader2 className="h-8 w-8 animate-spin" /> 
      <p className="text-sm text-muted-foreground">
        {status === 'connecting' ? 'Connecting to chat...' : 'Reconnecting...'}
      </p>
    </div>
  );
}

function ChatErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full">
      {children}
    </div>
  );
}

export default function Chat() {
  const chatClient = useInitializeChatClient();
  const { resolvedTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // Persist sidebar state
  useEffect(() => {
    const savedSidebarState = localStorage.getItem('chat-sidebar-state');
    if (savedSidebarState) {
      setSidebarOpen(JSON.parse(savedSidebarState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chat-sidebar-state', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Handle connection status
  useEffect(() => {
    if (chatClient) {
      // Set initial connection status based on connection state
      setConnectionStatus(chatClient.wsConnection?.isHealthy ? 'connected' : 'connecting');

      const handleConnectionChange = ({ online = false }) => {
        setConnectionStatus(online ? 'connected' : 'disconnected');
      };

      chatClient.on('connection.changed', handleConnectionChange);

      return () => {
        chatClient.off('connection.changed', handleConnectionChange);
      };
    }
  }, [chatClient]);

  if (!chatClient) {
    return <LoadingState status={connectionStatus} />;
  }

  return (
    <ChatErrorBoundary>
      <main className="fixed inset-0 z-10 overflow-hidden bg-card md:relative md:w-full md:h-auto">
        <TopBar />
        <div className="absolute inset-0 flex pt-[2vh] pb-[2vh] md:pt-0 md:pb-0">
          <StreamChat
            client={chatClient}
            theme={resolvedTheme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"}
          >
            <ChatSidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <ChatChannel
              open={!sidebarOpen}
              openSidebar={() => setSidebarOpen(true)}
            />
          </StreamChat>
        </div>
        <BottomBar />

        {connectionStatus === 'disconnected' && (
          <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm">
            Connection lost. Reconnecting...
          </div>
        )}
      </main>
    </ChatErrorBoundary>
  );
}