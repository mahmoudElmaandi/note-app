import { injectable } from "inversify";
import { DBPool } from "./pool";

@injectable()
export class DBContext {
    constructor(public db: DBPool) { }
};