import { injectable, inject } from "inversify";
import { Application } from 'express';
import { BackendApplicationContribution } from '@theia/core/lib/node/backend-application';
import { ILogger } from '@theia/core/lib/common/';
import { Server } from 'http';
import * as HttpProxy from 'http-proxy';

@injectable()
export class TheiaMiddlewareContribution implements BackendApplicationContribution {
 
    @inject(ILogger)
    readonly logger: ILogger;
    proxy  = HttpProxy.createProxyServer({ target: 'http://localhost:8081', ws: true });

    configure(app: Application): void {
        const p = this.proxy;
        const l = this.logger;
        l.debug("PROXY CFG");

        app.get("/*/proxy/8081/", (req, res) =>{
            l.debug("PROXY proxying GET request", req.url);
            p.web(req, res, {});
        });
        app.post("/*/proxy/8081/", (req, res) =>{
            l.debug("PROXY proxying POST request", req.url);
            p.web(req, res, {});
        });
    }

    onStart(server: Server): void {
        const p = this.proxy;
        const l = this.logger;
        l.debug("PROXY START");

        // Proxy websockets
        server.on('upgrade', function (req, socket, head) {
           if (req.url && req.url.endsWith("/proxy/8081/")) {
               l.debug("PROXY proxying upgrade request", req.url);
               p.ws(req, socket, head);
           } else {
               l.debug("PROXY ignoring upgrade request", req.url);
           }
        });
    }

}
