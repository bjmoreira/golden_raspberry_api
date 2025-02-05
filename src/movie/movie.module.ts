import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieService } from './movie.service';
import { MovieController } from './movie.controller';
import { Movie } from './movie.entity';
import { MovieRepository } from './movie.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, MovieRepository])],
  providers: [MovieService, MovieRepository],
  controllers: [MovieController],
})
export class MovieModule {}

