import { IInputs, IOutputs } from "./generated/ManifestTypes";
import "./css/style.css"; // Custom CSS file for Tailwind styles
import "./css/tailwind.min.css";
import { json } from "stream/consumers";

export class TaskList implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private tasks: {
        title: string;
        status: string;
        color: string;
        sortOrder: number;
        description?: string;
    }[] = [];
    private sampleTaks = [
        { uuid: "1", title: "Complete project setup", status: "Start", color: "blue", sortOrder: 1, description: "Set up the project structure and dependencies." },
        { uuid: "2", title: "Design UI", status: "In Progress", color: "green", sortOrder: 2, description: "Create wireframes and implement design." },
        { uuid: "3", title: "Test functionality", status: "Pending", color: "yellow", sortOrder: 3 },
        { uuid: "4", title: "Fix bugs", status: "Urgent", color: "red", sortOrder: 4, description: "Resolve known issues from testing." }
    ];
    private fontSize: string; // Default font size
    private notifyOutput: () => void;
    constructor() { }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ) {
        this.container = container;
        this.addFontAwesome();
        this.notifyOutput = notifyOutputChanged;
        this.fontSize = context.parameters.fontSize.raw ?  context.parameters.fontSize.raw : "text-base"; 
        // Sample data, ideally loaded from a Power Apps variable or external source
        this.tasks = window.location.href.includes("localhost") ? this.sampleTaks : context.parameters.Data.raw.rows ? context.parameters.Data.raw.rows : this.sampleTaks;

        // Initial render
        this.renderList();
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Render list with any new data or updates
        this.fontSize = context.parameters.fontSize.raw ?  context.parameters.fontSize.raw : "text-base";  
        this.tasks = window.location.href.includes("localhost") ? this.sampleTaks : context.parameters.Data.raw.rows ? context.parameters.Data.raw.rows : this.sampleTaks;

        this.renderList();
    }

    public getOutputs(): IOutputs {
        return {
            UpdatedData: JSON.stringify(this.tasks)
        };
    }

    public destroy(): void { }

    private renderList() {
        const fontSizeClass = `${this.fontSize}`; // Dynamically setting the class

        this.container.innerHTML = `
        <div class="bg-white shadow-lg rounded-lg w-full p-6">
            <ul class="space-y-4">
                ${this.tasks
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map(
                    (task) => `
                        <li class="p-4 bg-${task.color}-50 rounded-lg flex flex-col"
                            draggable="true"
                            data-sort-order="${task.sortOrder}"
                            ondragstart="event.dataTransfer.setData('text/plain', event.target.dataset.sortOrder)"
                            ondragover="event.preventDefault()"
                            ondrop="this.parentNode.parentNode.dispatchEvent(new CustomEvent('reorder', { detail: { from: event.dataTransfer.getData('text'), to: event.target.closest('li').dataset.sortOrder }}))"
                        >
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-4">
                                    <span class="cursor-move">☰</span>
                                    <span class="font-medium text-${task.color}-600 ${fontSizeClass}">${task.title}</span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button class="px-3 py-1 text-sm font-medium text-white bg-${task.color}-500 rounded hover:bg-${task.color}-600">${task.status}</button>
                                    ${task.description ? ` 
                                    <span class="cursor-pointer expand-arrow text-${task.color}-600 text-lg">
                                        <i class="fas fa-chevron-down transition-transform duration-300 ease-in-out"></i>
                                    </span>
                                    ` : ""}
                                </div>
                            </div>
                            ${task.description ? `
                            <p class="description hidden mt-2 text-sm text-${task.color}-700">${task.description}</p>
                            ` : ""}
                        </li>`
                )
                .join("")}
            </ul>
        </div>
    `;


        // Attach event listeners for expand/collapse arrows
        this.container.querySelectorAll(".expand-arrow").forEach((arrow) => {
            arrow.addEventListener("click", (event) => {
                // Ensure the clicked element is the span containing the icon or its parent
                const target = event.target as HTMLElement;
                const icon = target.closest("span")?.querySelector("i");

                if (icon) {
                    const desc = target.closest("li")?.querySelector(".description");
                    if (desc) {
                        const isHidden = desc.classList.toggle("hidden");

                        // Toggle between fa-chevron-down and fa-chevron-up
                        icon.classList.toggle("fa-chevron-down", isHidden);
                        icon.classList.toggle("fa-chevron-up", !isHidden);
                        // Rotate the icon by 180 degrees
                        icon.classList.toggle("rotate-180", !isHidden);
                    }
                }
            });
        });

        // Attach the reorder event handler
        this.container.querySelector("div")?.addEventListener("reorder", (event) => {
            const { from, to } = (event as CustomEvent).detail;
            this.handleReorder(Number(from), Number(to));
        });
    }





    private addFontAwesome() {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css";
        document.head.appendChild(link);
    }

    private handleReorder(fromOrder: number, toOrder: number) {
        const fromIndex = this.tasks.findIndex((task) => task.sortOrder === fromOrder);
        const toIndex = this.tasks.findIndex((task) => task.sortOrder === toOrder);

        if (fromIndex !== -1 && toIndex !== -1) {
            // Swap the sortOrder values
            [this.tasks[fromIndex].sortOrder, this.tasks[toIndex].sortOrder] = [
                this.tasks[toIndex].sortOrder,
                this.tasks[fromIndex].sortOrder
            ];

            this.notifyOutput();
            // Re-render the list to reflect new order
            this.renderList();
        }
    }
}
