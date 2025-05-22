import { ValidationPipe } from "@nestjs/common";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { setGlobalOptions, Severity } from "@typegoose/typegoose";
import { BrioExceptionFilter } from "@vpoll-shared/errors/global-exception.filter";
import "source-map-support/register";
import { AppModule } from "./app.module";
import { TokenExpiredExceptionListener } from "./core/auth/exceptions/listeners/token-expired-exception.listener";
import { TokensManager } from "./core/auth/managers/tokens.manager";
import helmet = require("helmet");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: false
    })
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  const tokensManager = app.get<TokensManager>(TokensManager);
  app.useGlobalFilters(new BrioExceptionFilter("backend"), new TokenExpiredExceptionListener(httpAdapter, tokensManager));
  app.enableCors({
    origin: ['https://vpoll.com.my','https://localhost:4200'], // Replace with your frontend domain
    methods: ['GET', 'POST', 'PUT', 'PATCH','DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true // Allow cookies or credentials
  });
  await app.listen(8001);
}

setGlobalOptions({
  schemaOptions: { versionKey: false, timestamps: true },
  globalOptions: { useNewEnum: true },
  options: { allowMixed: Severity.ALLOW }
});

bootstrap();
