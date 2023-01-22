import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.enableCors();
    const PORT = Number(process.env.PORT || 8080);
    await app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}
bootstrap();
