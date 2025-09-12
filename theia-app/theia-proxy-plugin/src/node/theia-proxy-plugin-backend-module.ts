import { ContainerModule } from "@theia/core/shared/inversify";
import { BackendApplicationContribution } from "@theia/core/lib/node";
import { injectable } from "@theia/core/shared/inversify";
import * as httpProxy from "http-proxy";
import * as express from "express";
import { Server } from "http";

@injectable()
class ProxyBackendContribution implements BackendApplicationContribution {
  private proxy!: httpProxy;

  configure(app: express.Application): void {
    console.log("[ProxyPlugin] Backend gestartet ✅");

    this.proxy = httpProxy.createProxyServer({
      target: "http://localhost:8081",
      ws: true,
    });

    // HTTP-Proxy
    app.use("/proxy/8081", (req: any, res: any) => {
      this.proxy.web(req, res, {}, (err) => {
        console.error("[ProxyPlugin] Proxy error", err);
        res.statusCode = 500;
        res.end("Proxy error: " + err.message);
      });
    });
  }

  onStart(server: Server): void {
    // WebSocket Proxy
    server.on("upgrade", (req, socket, head) => {
      if (req.url && req.url.startsWith("/proxy/8081")) {
        this.proxy.ws(req, socket, head);
      }
    });

    console.log("[ProxyPlugin] Proxy auf /proxy/8081 aktiv");
  }
}

export default new ContainerModule((bind) => {
  bind(BackendApplicationContribution).to(ProxyBackendContribution).inSingletonScope();
});
