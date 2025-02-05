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
            winner: data.winner === 'TRUE',
          } as Movie);
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
  
    
    const producersMap = movies.reduce((acc, { producers, year }) => {
      if (!acc[producers]) acc[producers] = [];
      acc[producers].push(year);
      return acc;
    }, {} as Record<string, number[]>);
  
    
    const allIntervals = Object.entries(producersMap)
      .map(([producer, years]) => {
        const sortedYears = years.sort((a, b) => a - b);
  
        
        return sortedYears
          .map((year, i) => sortedYears.slice(i + 1).map(nextYear => ({
            interval: nextYear - year - 1, // Diferença exclusiva
            previousWin: year,
            followingWin: nextYear
          })))
          .flat();
      })
      .flat();
  
    
    const maxInterval = allIntervals.reduce((max, current) => 
      current.interval > max.interval ? current : max
    , { interval: -Infinity });
  
    // Filtrar os intervalos sem o maior intervalo encontrado
    const filteredIntervals = allIntervals.filter(interval => interval.interval !== maxInterval.interval);
  
    // Recalcular o maior intervalo após a remoção do maior intervalo
    const maxIntervalAfterRemoval = filteredIntervals.reduce((max, current) => 
      current.interval > max.interval ? current : max
    , { interval: -Infinity });
  
    return {
      max: maxIntervalAfterRemoval ? maxIntervalAfterRemoval : maxInterval
    };
  }
  
  
}
