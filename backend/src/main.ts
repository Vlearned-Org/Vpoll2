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
  
  // Enable helmet with GDPR-compliant security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        // Allow iframe for consent management platforms if needed
        frameSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disabled for development
    // Add GDPR-relevant security headers
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    // Prevent information disclosure
    hidePoweredBy: true,
    noSniff: true,
    // Privacy-focused headers
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  }));
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: false
    })
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  const tokensManager = app.get<TokensManager>(TokensManager);
  app.useGlobalFilters(new BrioExceptionFilter("backend"), new TokenExpiredExceptionListener(httpAdapter, tokensManager));
  
  // GDPR-compliant CORS configuration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://vpoll.com.my', 'https://www.vpoll.com.my'] 
      : true, // Allow all origins in development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept', 
      'Origin', 
      'X-Requested-With',
      'DNT', // Do Not Track header for privacy
      'X-Privacy-Settings' // Custom header for privacy preferences
    ]
  });
  
  // Log server startup with privacy compliance
  console.log(`Backend server starting on port 8001...`);
  console.log(`GDPR-compliant CORS and security headers enabled`);
  console.log(`Privacy endpoints available at /api/privacy/*`);
  console.log(`Data retention service enabled with daily scheduled tasks`);
  await app.listen(8001);
  console.log(`Backend server is running on http://localhost:8001`);
  console.log(`API endpoints available at http://localhost:8001/api`);
  console.log(`Privacy compliance features:`);
  console.log(`  - Data subject rights endpoints`);
  console.log(`  - Consent management API`);
  console.log(`  - Automated data retention`);
  console.log(`  - Security headers (helmet)`);
}

setGlobalOptions({
  schemaOptions: { versionKey: false, timestamps: true },
  globalOptions: { useNewEnum: true },
  options: { allowMixed: Severity.ALLOW }
});

bootstrap();
