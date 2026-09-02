/**
 * Stores the static sample data used to render task cards.
 */
const cardsData = [
    {
        id: 0,
        tag: "Technical Task",
        tagClass: "tag-teal",
        overlayTagClass: "technical-task",
        title: "CSS Architecture Planning",
        description: "Define CSS naming conventions and structure...",
        progress: 100,
        completedSubtasks: 2,
        totalSubtasks: 2,
        dueDate: "10/05/2023",
        priorityClass: "prio-urgent",
        priorityText: "Urgent",
        avatars: [
            { initials: "AN", cardColor: "av-orange", overlayColor: "orange", name: "Anton Mayer" },
            { initials: "EM", cardColor: "av-purple", overlayColor: "purple", name: "Emmanuel Mauer" },
            { initials: "MB", cardColor: "av-teal",   overlayColor: "green",  name: "Marcel Bauer" }
        ],
        subtasks: [
            { text: "Define naming conventions", checked: true },
            { text: "Setup folder structure",    checked: true }
        ]
    },
    {
        id: 1,
        tag: "User Story",
        tagClass: "tag-blue",
        overlayTagClass: "user-story",
        title: "Login Page Design",
        description: "Design and implement the login page layout...",
        progress: 50,
        completedSubtasks: 1,
        totalSubtasks: 2,
        dueDate: "15/06/2023",
        priorityClass: "prio-medium",
        priorityText: "Medium",
        avatars: [
            { initials: "AN", cardColor: "av-orange", overlayColor: "orange", name: "Anton Mayer" },
            { initials: "EM", cardColor: "av-purple", overlayColor: "purple", name: "Emmanuel Mauer" }
        ],
        subtasks: [
            { text: "Design mockup",      checked: true  },
            { text: "Implement HTML/CSS", checked: false }
        ]
    },
    {
        id: 2,
        tag: "Technical Task",
        tagClass: "tag-teal",
        overlayTagClass: "technical-task",
        title: "Database Schema Design",
        description: "Plan and create the initial database schema...",
        progress: 0,
        completedSubtasks: 0,
        totalSubtasks: 3,
        dueDate: "20/07/2023",
        priorityClass: "prio-low",
        priorityText: "Low",
        avatars: [
            { initials: "MB", cardColor: "av-teal", overlayColor: "green", name: "Marcel Bauer" }
        ],
        subtasks: [
            { text: "Define entities",   checked: false },
            { text: "Create ER diagram", checked: false },
            { text: "Review with team",  checked: false }
        ]
    }
];
