import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useState, useCallback, useRef } from "react";
import {
  Channel,
  ChannelHeader,
  ChannelHeaderProps,
  MessageInput,
  MessageList,
  MessageSimple,
  Window,
  useChannelStateContext,
  useMessageContext,
} from "stream-chat-react";

interface ChatChannelProps {
  open: boolean;
  openSidebar: () => void;
}

const customReactionOptions = [
  {
    type: "love",
    Component: () => <>❤️</>,
    name: "Love",
  },
  {
    type: "like",
    Component: () => <>👍</>,
    name: "Like",
  },
  {
    type: "haha",
    Component: () => <>😂</>,
    name: "Haha",
  },
  {
    type: "wow",
    Component: () => <>😮</>,
    name: "Wow",
  },
  {
    type: "sad",
    Component: () => <>😢</>,
    name: "Sad",
  },
  {
    type: "angry",
    Component: () => <>😠</>,
    name: "Angry",
  },
];

const CustomMessage = (props: any) => {
  const [showCustomReactions, setShowCustomReactions] = useState(false);
  const [useDefaultReactions, setUseDefaultReactions] = useState(true);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const touchStartTime = useRef<number>(0);
  const reactionsPanelRef = useRef<HTMLDivElement>(null);
  
  const { channel } = useChannelStateContext();
  const { message } = useMessageContext();

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reactionsPanelRef.current && 
        !reactionsPanelRef.current.contains(event.target as Node)
      ) {
        setShowCustomReactions(false);
        setUseDefaultReactions(true);
      }
    };

    if (showCustomReactions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCustomReactions]);

  const handleTouchStart = useCallback(() => {
    touchStartTime.current = Date.now();
    longPressTimer.current = setTimeout(() => {
      setShowCustomReactions(true);
      setUseDefaultReactions(false);
    }, 500);
  }, []);

  const handleClick = (e: any) => {
    if (!showCustomReactions) {
      setUseDefaultReactions(true);
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTouchEnd = useCallback(() => {
    const pressDuration = Date.now() - touchStartTime.current;
    if (pressDuration < 500) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        setUseDefaultReactions(true);
      }
    }
  }, []);

  const handleReactionClick = async (reactionType: string) => {
    try {
      const existing = message.own_reactions?.find(
        (reaction) => reaction.type === reactionType
      );

      if (existing) {
        await channel.deleteReaction(message.id, reactionType);
      } else {
        await channel.sendReaction(message.id, {
          type: reactionType,
        });
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
    }
    setShowCustomReactions(false);
    setUseDefaultReactions(true);
  };

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
    >
      <MessageSimple 
        {...props} 
        handleReaction={useDefaultReactions ? props.handleReaction : undefined}
      />
      
      {/* Custom Reactions Panel */}
      {showCustomReactions && (
        <div 
          ref={reactionsPanelRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-4 p-4 bg-background/95 backdrop-blur-sm rounded-xl shadow-lg border"
        >
          {customReactionOptions.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReactionClick(reaction.type)}
              className="text-xl hover:scale-125 transition-transform p-2"
            >
              <reaction.Component />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ChatChannel({ open, openSidebar }: ChatChannelProps) {
  return (
    <div className={cn("w-full md:block", !open && "hidden")}>
      <Channel 
        reactionOptions={customReactionOptions}
      >
        <Window>
          <CustomChannelHeader openSidebar={openSidebar} />
          <MessageList Message={CustomMessage} />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}

interface CustomChannelHeaderProps extends ChannelHeaderProps {
  openSidebar: () => void;
}

function CustomChannelHeader({
  openSidebar,
  ...props
}: CustomChannelHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-full p-2 md:hidden">
        <Button size="icon" variant="ghost" onClick={openSidebar}>
          <Menu className="size-5" />
        </Button>
      </div>
      <ChannelHeader {...props} />
    </div>
  );
}