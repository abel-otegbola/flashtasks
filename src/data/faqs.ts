export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "what-is-flashtasks",
    question: "What is Flashtasks?",
    answer:
      "Flashtasks is a task management app for organizing work, tracking priorities, and keeping projects moving in one place.",
  },
  {
    id: "pricing",
    question: "Is there a free plan available?",
    answer:
      "Yes. Flashtasks offers a free plan so you can try the core task management features before upgrading.",
  },
  {
    id: "create-tasks",
    question: "What can I manage in Flashtasks?",
    answer:
      "You can create tasks, organize them by organization or project, set priorities, and keep everything updated as work changes.",
  },
  {
    id: "collaboration",
    question: "Can I use Flashtasks with a team?",
    answer:
      "Yes. Flashtasks is built to support team workflows, making it easier to keep work organized across shared projects and responsibilities.",
  },
  {
    id: "features",
    question: "What features are included?",
    answer:
      "Flashtasks includes task creation, organization management, search, reminders, and productivity tools designed to keep daily work simple and focused.",
  },
  {
    id: "billing",
    question: "Can I change my plan later?",
    answer:
      "Yes. You can upgrade or adjust your plan when your needs change, and billing updates based on the subscription you choose.",
  },
  {
    id: "support",
    question: "What if I need help getting started?",
    answer:
      "If you need help, our support team can guide you through setup, billing, and using the app effectively.",
  },
];
