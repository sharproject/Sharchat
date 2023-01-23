import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './util/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // setup class Validation
    app.useGlobalPipes(new ValidationPipe());

    // setup cors
    app.enableCors();

    const DocumentConfig = new DocumentBuilder()
        .setTitle('Chat app Server doc')
        .setDescription('document')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, DocumentConfig);
    SwaggerModule.setup('docs', app, document);

    // error handling
    app.useGlobalFilters(new HttpExceptionFilter());

    const PORT = Number(process.env.PORT || 8080);
    await app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}
bootstrap();
