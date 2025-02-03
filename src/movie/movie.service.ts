import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Movie } from "./movie.entity";
import * as fs from 'fs';
import * as csv from 'csv-parser';

@Injectable()
export class MovieService implements OnModuleInit {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  // Função para importar os filmes do CSV
  async importMoviesFromCSV(): Promise<void> {
    const movies: Movie[] = [];
  
    const filePath = './data/Movielist.csv'; // Caminho fixo para o arquivo
  
    if (!fs.existsSync(filePath)) {
      console.error(`O arquivo CSV não foi encontrado: ${filePath}`);
      return;
    }
  
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => {
        if (data.year && data.title && data.producers) {
          const movie = {
            year: parseInt(data.year),
            title: data.title,
            studios: data.studios,
            producers: data.producers,
            winner: data.winner === 'TRUE',
          } as Movie;
          movies.push(movie);
        } else {
          console.warn('Dados incompletos ou inválidos encontrados no CSV:', data);
        }
      })
      .on('end', async () => {
        if (movies.length > 0) {
          console.log(`Sucesso foram importandos ${movies.length} filmes para o banco de dados.`);
          await this.movieRepository.save(movies);
        } else {
          console.log('Nenhum filme válido encontrado no arquivo CSV.');
        }
      })
      .on('error', (err) => {
        console.error('Erro ao ler o arquivo CSV:', err);
      });
  }

  async onModuleInit() {
    console.log('Iniciando a importação dos filmes...');
    await this.importMoviesFromCSV();  // Importa os filmes quando o módulo é carregado
  }

  // Função que usa o repositório para buscar filmes e chama getPrizeIntervals
  async getPrizeIntervalsFromRepo() {
    const movies = await this.movieRepository.find();

    // Chama a função getPrizeIntervals passando os filmes do banco de dados
    return this.getPrizeIntervals(movies);
  }

  // Recebe movies como parâmetro externo
  async getPrizeIntervals(movies: Movie[]) {
    if (!movies || movies.length === 0) {
      throw new Error('Nenhum filme fornecido');
    }
  
    const intervals = {
      min: [] as { producer: string; interval: number; previousWin: number; followingWin: number }[] ,
      max: [] as { producer: string; interval: number; previousWin: number; followingWin: number }[] ,
    };
  
    const producers = {};
  
    movies.forEach((movie) => {
      if (!movie || !movie.producers || !movie.year) {
        console.warn(`Filme com dados incompletos: ${JSON.stringify(movie)}`);
        return;
      }
  
      if (!producers[movie.producers]) {
        producers[movie.producers] = [];
      }
      producers[movie.producers].push(movie);
    });
  
    for (const producer in producers) {
      const producerMovies = producers[producer];
  
      producerMovies.sort((a, b) => (a.year || 0) - (b.year || 0));
  
      let minInterval = Infinity;
      let maxInterval = -Infinity;
      let minPreviousWin: number | null = null;
      let minFollowingWin: number | null = null;
      let maxPreviousWin: number | null = null;
      let maxFollowingWin: number | null = null;
  
      for (let i = 1; i < producerMovies.length; i++) {
        const currentYear = producerMovies[i].year;
        const previousYear = producerMovies[i - 1].year;
  
        const interval = currentYear - previousYear;
  
        if (interval < minInterval) {
          minInterval = interval;
          minPreviousWin = previousYear;
          minFollowingWin = currentYear;
        }
  
        if (interval > maxInterval) {
          maxInterval = interval;
          maxPreviousWin = previousYear;
          maxFollowingWin = currentYear;
        }
      }
  
      if (minInterval !== Infinity && producerMovies.length > 1) {
        intervals.min.push({
          producer: producer,
          interval: minInterval,
          previousWin: minPreviousWin!,
          followingWin: minFollowingWin!,
        });
      }
  
      if (maxInterval !== -Infinity && producerMovies.length > 1) {
        intervals.max.push({
          producer: producer,
          interval: maxInterval,
          previousWin: maxPreviousWin!,
          followingWin: maxFollowingWin!,
        });
      }
    }
  
    // Encontrar os valores de menor e maior intervalo
    let globalMinInterval = Infinity;
    let globalMaxInterval = -Infinity;
  
    for (const interval of intervals.min) {
      if (interval.interval < globalMinInterval) {
        globalMinInterval = interval.interval;
      }
    }
  
    for (const interval of intervals.max) {
      if (interval.interval > globalMaxInterval) {
        globalMaxInterval = interval.interval;
      }
    }
  
    // Encontrar os produtores com os menores intervalos (tratando empates)
    let minProducers = [] as { producer: string; interval: number; previousWin: number; followingWin: number }[];
  
    for (const interval of intervals.min) {
      if (interval.interval === globalMinInterval) {
        minProducers.push(interval);
      }
    }
  
    // Encontrar os produtores com os maiores intervalos (tratando empates)
    let maxProducers = [] as { producer: string; interval: number; previousWin: number; followingWin: number }[];
  
    for (const interval of intervals.max) {
      if (interval.interval === globalMaxInterval) {
        maxProducers.push(interval);
      }
    }
  
    const result = {
      min: minProducers,
      max: maxProducers,
    };
  
    return result;
  }
}
