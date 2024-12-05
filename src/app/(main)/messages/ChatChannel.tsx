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
  
  const { channel } = useChannelStateContext();
  const { message } = useMessageContext();

  // Handle long press to show custom reactions
  const handleTouchStart = useCallback(() => {
    touchStartTime.current = Date.now();
    longPressTimer.current = setTimeout(() => {
      setShowCustomReactions(true);
      setUseDefaultReactions(false); // Disable default reactions
    }, 500);
  }, []);

  // Handle normal click for default reactions
  const handleClick = (e: any) => {
    if (!showCustomReactions) {
      setUseDefaultReactions(true);
      // Let the default Stream reaction handler work
      return;
    }
    // If custom reactions are showing, prevent default
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
        <div className="absolute bottom-full left-0 mb-2 flex gap-3 p-3 bg-background/80 backdrop-blur-sm rounded-lg shadow-lg">
          {customReactionOptions.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => handleReactionClick(reaction.type)}
              className="hover:scale-125 transition-transform"
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