import { Injectable } from "@nestjs/common";
import { MovieRepository } from "./movie.repository";
import { Movie } from "./movie.entity";

@Injectable()
export class MovieService {
  constructor(private readonly movieRepository: MovieRepository) {}

  async getPrizeIntervalsFromRepo() {
    return this.getPrizeIntervals(await this.movieRepository.findAllWinners());
  }

  async getPrizeIntervals(movies: Movie[]) {
    if (movies.length === 0) throw new Error("Nenhum filme foi fornecido");

    const expandedMovies = movies.flatMap(({ producers, year, studios, winner }) => {
      const producersList = producers.split(/,| and /).map((producer) => producer.trim());

      return producersList.map((producer) => ({
        producer,
        year: Number(year),
        studios,
        winner,
      }));
    });

    const producersMap = expandedMovies.reduce((acc, { producer, year }) => {
      if (!acc[producer]) acc[producer] = [];
      acc[producer].push(year);
      return acc;
    }, {} as Record<string, number[]>);

    const allIntervals: { producer: string; interval: number; previousWin: number; followingWin: number }[] = [];

    Object.entries(producersMap).forEach(([producer, years]) => {
      const sortedYears = years.sort((a, b) => a - b);

      for (let i = 0; i < sortedYears.length - 1; i++) {
        allIntervals.push({
          producer,
          interval: sortedYears[i + 1] - sortedYears[i],
          previousWin: sortedYears[i],
          followingWin: sortedYears[i + 1],
        });
      }
    });

    const maxInterval = allIntervals.reduce(
      (max, current) => (current.interval > max.interval ? current : max),
      { producer: "", interval: -Infinity, previousWin: 0, followingWin: 0 }
    );

    const minInterval = allIntervals.reduce(
      (min, current) => (current.interval < min.interval ? current : min),
      { producer: "", interval: Infinity, previousWin: 0, followingWin: 0 }
    );

    return {
      min: [minInterval],
      max: [maxInterval],
    };
  }
}
