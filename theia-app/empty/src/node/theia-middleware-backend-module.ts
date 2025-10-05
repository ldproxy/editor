import { ContainerModule } from "@theia/core/shared/inversify";
import { BackendApplicationContribution } from "@theia/core/lib/node/backend-application";
import { TheiaMiddlewareContribution } from "./theia-middleware-contribution";

export default new ContainerModule(bind => {
    bind(BackendApplicationContribution).to(TheiaMiddlewareContribution);
});
