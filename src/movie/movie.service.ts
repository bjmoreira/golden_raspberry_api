import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Movie } from "./movie.entity";
import * as fileSystem from 'fs';
import * as csvParser from 'csv-parser';

@Injectable()
export class MovieService implements OnModuleInit {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async importMoviesFromCSV(): Promise<void> {
    const filePath = './data/Movielist.csv';
    if (!fileSystem.existsSync(filePath)) return console.error(`O arquivo CSV não foi encontrado: ${filePath}`);

    const movies: Movie[] = [];
    fileSystem.createReadStream(filePath)
      .pipe(csvParser({ separator: ';' }))
      .on('data', (data) => {
        if (data.year && data.title && data.producers) {
          movies.push({
            year: parseInt(data.year),
            title: data.title,
            studios: data.studios,
            producers: data.producers,
            winner: data.winner.trim().toUpperCase() === 'YES'
          } as unknown as Movie);
        }
      })
      .on('end', async () => {
        if (movies.length > 0) await this.movieRepository.save(movies);
      })
      .on('error', (error) => console.error('Erro ao ler o arquivo CSV:', error));
  }

  async onModuleInit() {
    await this.importMoviesFromCSV();
  }

  async getPrizeIntervalsFromRepo() {
    return this.getPrizeIntervals(await this.movieRepository.find());
  }

  async getPrizeIntervals(movies: Movie[]) {
    if (movies.length === 0) throw new Error('Nenhum filme foi fornecido');
  
    const expandedMovies = movies.flatMap(({ producers, year, studios, winner }) => {
      const producersList = producers
        .split(/,| and /)
        .map(producer => producer.trim());
  
      return producersList.map(producer => ({
        producer,
        year: Number(year),
        studios,
        winner
      }));
    }).filter(movie => Number(movie.winner) === 1);
  
    const producersMap = expandedMovies.reduce((acc, { producer, year }) => {
      if (!acc[producer]) acc[producer] = [];
      acc[producer].push(year);
      return acc;
    }, {} as Record<string, number[]>);
  
    const allIntervals: { producer: string, interval: number, previousWin: number, followingWin: number }[] = [];
  
    // Percorrer os anos de cada produtor e calcular os intervalos corretamente
    Object.entries(producersMap).forEach(([producer, years]) => {
      const sortedYears = years.sort((a, b) => a - b);
  
      for (let i = 0; i < sortedYears.length - 1; i++) {
        allIntervals.push({
          producer,
          interval: sortedYears[i + 1] - sortedYears[i],
          previousWin: sortedYears[i],
          followingWin: sortedYears[i + 1]
        });
      }
    });
  
    // Encontrar os valores mínimo e máximo
    const maxInterval = allIntervals.reduce((max, current) => 
      current.interval > max.interval ? current : max
    , { producer: '', interval: -Infinity, previousWin: 0, followingWin: 0 });
  
    const minInterval = allIntervals.reduce((min, current) => 
      current.interval < min.interval ? current : min
    , { producer: '', interval: Infinity, previousWin: 0, followingWin: 0 });
  
    return {
      min: [minInterval],
      max: [maxInterval]
    };
  }
}
