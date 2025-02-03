import { Controller, Get } from '@nestjs/common';
import { MovieService } from './movie.service';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('prizes')
  async getPrizeIntervalsFromRepo() {
    const intervals = await this.movieService.getPrizeIntervalsFromRepo();
    return intervals;
  }
}
