import { Command, CommandContribution, CommandRegistry } from "@theia/core/lib/common";
import { inject, injectable } from "@theia/core/shared/inversify";
import { HelloBackendWithClientService, HelloBackendService } from "../common/protocol";
import axios from "axios";

const SayHelloViaBackendCommandWithCallBack: Command = {
  id: "sayHelloOnBackendWithCallBack.command",
  label: "Say hello on the backend with a callback to the client",
};

const SayHelloViaBackendCommand: Command = {
  id: "sayHelloOnBackend.command",
  label: "Say hello on the backend",
};

const TestProxyCommand: Command = {
  id: "test.proxy.command",
  label: "Test Proxy /proxy/8081",
};

@injectable()
export class TheiaProxyPluginCommandContribution implements CommandContribution {
  constructor(
    @inject(HelloBackendWithClientService)
    private readonly helloBackendWithClientService: HelloBackendWithClientService,
    @inject(HelloBackendService) private readonly helloBackendService: HelloBackendService
  ) {}

  registerCommands(registry: CommandRegistry): void {
    registry.registerCommand(SayHelloViaBackendCommandWithCallBack, {
      execute: () => this.helloBackendWithClientService.greet().then((r) => console.log(r)),
    });
    registry.registerCommand(SayHelloViaBackendCommand, {
      execute: () => this.helloBackendService.sayHelloTo("World").then((r) => console.log(r)),
    });
    registry.registerCommand(TestProxyCommand, {
      execute: async () => {
        try {
          const response = await axios.get("http://localhost:8080/proxy/8081/");
          console.log("Proxy response:", response.data);
        } catch (err) {
          console.error("Proxy test failed:", err);
        }
      },
    });
  }
}
