import { Test } from "@nestjs/testing";
import { MovieService } from "../src/movie/movie.service";
import { MovieRepository } from "../src/movie/movie.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Movie } from "../src/movie/movie.entity";
import { join } from "path";

describe("MovieService (Integração)", () => {
  let service: MovieService;
  let repository: MovieRepository;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: "sqlite",
          database: ":memory:",
          entities: [Movie],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([Movie]),
      ],
      providers: [MovieService, MovieRepository],
    }).compile();
  
    service = module.get<MovieService>(MovieService);
    repository = module.get<MovieRepository>(MovieRepository);
  
    // Garante que a importação do CSV termine antes do teste rodar
    await repository.importMoviesFromCSV();
  });
  
  it("deve ler os dados reais do CSV e validar o retorno da função", async () => {
    const csvData = await repository.findAllWinners();
  
    // Espera que tenha filmes vencedores
    expect(csvData.length).toBeGreaterThan(0);
  
    const result = await service.getPrizeIntervalsFromRepo();
    
    const expectedOutput = {
      min: [
        { producer: "Joel Silver", interval: 1, previousWin: 1990, followingWin: 1991 },
      ],
      max: [
        { producer: "Matthew Vaughn", interval: 13, previousWin: 2002, followingWin: 2015 },
      ],
    };
  
    expect(result).toEqual(expectedOutput);
  });
  
});
