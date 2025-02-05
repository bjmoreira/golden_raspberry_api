import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Movie } from "./movie.entity";
import * as fileSystem from "fs";
import * as csvParser from "csv-parser";

@Injectable()
export class MovieRepository implements OnModuleInit {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>
  ) {}

  private movies: Movie[] = [];

  async importMoviesFromCSV(): Promise<void> {
    return new Promise((resolve, reject) => {
      const filePath = "./data/Movielist.csv";
      if (!fileSystem.existsSync(filePath)) {
        console.error(`O arquivo CSV não foi encontrado: ${filePath}`);
        return reject(new Error("Arquivo CSV não encontrado"));
      }
  
      const movies: Movie[] = [];
      fileSystem
        .createReadStream(filePath)
        .pipe(csvParser({ separator: ";" }))
        .on("data", (data) => {
          if (data.year && data.title && data.producers) {
            movies.push({
              year: parseInt(data.year),
              title: data.title,
              studios: data.studios,
              producers: data.producers,
              winner: data.winner.trim().toUpperCase() === "YES",
            } as unknown as Movie);
          }
        })
        .on("end", async () => {
          if (movies.length > 0) {
            await this.movieRepository.save(movies);
            this.movies = movies.filter((movie) => movie.winner);
            console.log(`Importação concluída: ${this.movies.length} filmes vencedores carregados.`);
          }
          resolve();
        })
        .on("error", (error) => {
          console.error("Erro ao ler o arquivo CSV:", error);
          reject(error);
        });
    });
  }
  
  async onModuleInit() {
    await this.importMoviesFromCSV();
  }

  async findAllWinners(): Promise<Movie[]> {
    return this.movies;
  }
}
