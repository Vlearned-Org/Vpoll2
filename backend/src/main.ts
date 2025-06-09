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
  
  // Temporarily disable helmet entirely for testing
  // app.use(helmet({
  //   contentSecurityPolicy: false, // Disable CSP entirely for testing
  //   crossOriginEmbedderPolicy: false,
  // }));
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: false
    })
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  const tokensManager = app.get<TokensManager>(TokensManager);
  app.useGlobalFilters(new BrioExceptionFilter("backend"), new TokenExpiredExceptionListener(httpAdapter, tokensManager));
  
  // Simple CORS configuration that won't conflict with nginx
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
  });
  
  // Log server startup
  console.log(`Backend server starting on port 8001...`);
  console.log(`CORS enabled with simple configuration`);
  await app.listen(8001);
  console.log(`Backend server is running on http://localhost:8001`);
  console.log(`API endpoints available at http://localhost:8001/api`);
}

setGlobalOptions({
  schemaOptions: { versionKey: false, timestamps: true },
  globalOptions: { useNewEnum: true },
  options: { allowMixed: Severity.ALLOW }
});

bootstrap();
