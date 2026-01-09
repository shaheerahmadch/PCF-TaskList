import { IInputs, IOutputs } from "./generated/ManifestTypes";
import "./css/style.css"; // Custom CSS file for Tailwind styles
import "./css/tailwind.min.css";

export class TaskList implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement;
    private tasks: { title: string; status: string; color: string }[] = [];

    constructor() {}

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ) {
        this.container = container;

        // Sample data, ideally loaded from a Power Apps variable or external source
        this.tasks = [
            { title: "Complete project setup", status: "Start", color: "blue" },
            { title: "Design UI", status: "In Progress", color: "green" },
            { title: "Test functionality", status: "Pending", color: "yellow" },
            { title: "Fix bugs", status: "Urgent", color: "red" }
        ];

        // Initial render
        this.renderList();
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // Render list with any new data or updates
        this.renderList();
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {}

    private renderList() { // max-w-md
        this.container.innerHTML = `
            <div class="bg-white shadow-lg rounded-lg w-full p-6"> 
              <!--  <h2 class="text-2xl font-semibold text-gray-800 mb-4">Task List</h2>-->
                <ul class="space-y-4">
                    ${this.tasks
                        .map(
                            (task) => `
                        <li class="flex items-center justify-between p-4 bg-${task.color}-50 rounded-lg">
                            <span class="text-lg font-medium text-${task.color}-600">${task.title}</span>
                            <button class="px-3 py-1 text-sm font-medium text-white bg-${task.color}-500 rounded hover:bg-${task.color}-600">${task.status}</button>
                        </li>`
                        )
                        .join("")}
                </ul>
            </div>
        `;
    }
}
