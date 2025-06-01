import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'; // Adicionado ClassSerializerInterceptor
import { NestFactory, Reflector } from '@nestjs/core'; // Adicionado Reflector
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))); 

  
  const config = new DocumentBuilder()
    .setTitle('Sistema de Compras Online API')
    .setDescription('Documentação da API para o sistema de compras online.')
    .setVersion('1.0')
    .addTag('products', 'Operações relacionadas a produtos') 
    .addTag('cart', 'Operações relacionadas ao carrinho de compras')
    .addTag('orders', 'Operações relacionadas a pedidos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, { 
    customSiteTitle: 'Backend Compras API Docs',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg', 
    customCss: '.swagger-ui .topbar { display: none }', 
    swaggerOptions: {
      persistAuthorization: true, 
      tagsSorter: 'alpha', 
      operationsSorter: 'alpha', 
    },
  });

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation is available at: ${await app.getUrl()}/api-docs`);
}
bootstrap();