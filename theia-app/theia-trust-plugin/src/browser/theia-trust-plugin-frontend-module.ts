import { ContainerModule } from "@theia/core/shared/inversify";
import { injectable } from "@theia/core/shared/inversify";
import { WorkspaceTrustService } from "@theia/workspace/lib/browser/workspace-trust-service";

@injectable()
class AlwaysTrustedWorkspaceService extends WorkspaceTrustService {
  async isWorkspaceTrusted(): Promise<boolean> {
    console.log("[TrustPlugin] Workspace trusted ✅");
    return true;
  }

  async requestWorkspaceTrust(): Promise<boolean> {
    console.log("[TrustPlugin] Request skipped, always trusted ✅");
    return true;
  }
}

export default new ContainerModule((bind, unbind, isBound, rebind) => {
  rebind(WorkspaceTrustService).to(AlwaysTrustedWorkspaceService).inSingletonScope();
});
