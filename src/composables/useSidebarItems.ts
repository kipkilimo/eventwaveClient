import { computed } from "vue";
import {
  VideoIcon,
  MessageCircleIcon,
  Message2Icon,
  HelpCircleIcon,
  ClipboardIcon,
  ChartBarIcon,
  QuestionMarkIcon,
  RssIcon,
} from "vue-tabler-icons";
import { useEventStore } from "@/stores/event";

export interface menu {
  header?: string;
  title?: string;
  icon?: object;
  to?: string;
  divider?: boolean;
  chip?: string;
  chipColor?: string;
  chipVariant?: string;
  chipIcon?: string;
  children?: menu[];
  disabled?: boolean;
  type?: string;
  subCaption?: string;
  tool?: string;
  hideText?: boolean; // Add this prop to control text visibility
}

export function useSidebarItems() {
  const eventStore = useEventStore();

  // ✅ Event key stays reactive
  const eventSecret = computed(
    () => eventStore.currentEvent?.eventSecret ?? "Loading...",
  );

  const sidebarItems = computed<menu[]>(() => [
    { header: `Interactivity Tools | ${eventSecret.value}` },

    // 🎥 Core content
    { title: "Media", icon: VideoIcon, tool: "media" },

    // 📡 Live context
    { title: "Live Feeds", icon: RssIcon, tool: "livefeed" },

    // 💬 Continuous interaction
    { title: "Chat", icon: MessageCircleIcon, tool: "chat" },

    // ⚡ Quick engagement
    { title: "Poll", icon: ChartBarIcon, tool: "poll" },

    // 🧠 Deeper engagement
    { title: "Test", icon: ClipboardIcon, tool: "test" }, // Fixed: lowercase 'test' to match toolComponents

    // ❓ Intentional questions
    { title: "Q&A", icon: QuestionMarkIcon, tool: "qna" },

    // 📝 Post-session reflection
    { title: "Feedback", icon: Message2Icon, tool: "feedback" },

    { divider: true },
    { header: "Support" },
    {
      title: "Documentation",
      icon: HelpCircleIcon,
      to: "https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes",
      type: "external",
    },
  ]);

  return { sidebarItems };
}
