import moduleAlias from "module-alias";

moduleAlias.addAlias("@", __dirname + "/");
moduleAlias();

// import './process'

import { Express } from "@/Infra/Express";
import { Application } from "@/Infra/Application";

new Application(new Express());
