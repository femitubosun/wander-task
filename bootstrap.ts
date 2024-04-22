import moduleAlias from "module-alias";

moduleAlias.addAlias("@", __dirname + "/");
moduleAlias();

import "@/Config";
import { Express } from "@/Infra/Express";
import { Application } from "@/Infra/Application";

new Application(new Express());
