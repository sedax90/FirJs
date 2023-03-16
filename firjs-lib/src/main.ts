import { Workspace } from "./core/workspace";
import { WorkspaceInit } from "./models";

export async function init(options: WorkspaceInit): Promise<Workspace> {
    return Workspace.init(options);
}