import 'reflect-metadata';
import { App } from "./web/app";

console.clear();

function bootstrap() {
    new App({
        defaultScope: "Singleton"
    })
};

bootstrap();