// packages/hide-about/src/browser/hide-about-frontend-module.ts
import { ContainerModule } from "@theia/core/shared/inversify";
import { MenuContribution } from "@theia/core/lib/common/menu";
import { HideAboutMenuContribution } from "./empty-contribution";
import { CommandContribution } from "@theia/core/lib/common";

export default new ContainerModule((bind) => {
  bind(MenuContribution).to(HideAboutMenuContribution).inSingletonScope();
  bind(CommandContribution).to(HideAboutMenuContribution).inSingletonScope();
});
