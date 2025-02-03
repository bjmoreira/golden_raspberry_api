import { Test } from '@nestjs/testing';
import { MovieService } from '../src/movie/movie.service';
import { Movie } from '../src/movie/movie.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('MovieService', () => {
  let service: MovieService;
  let movieRepository: jest.Mocked<Repository<Movie>>;

  beforeAll(async () => {
    const mockMovieRepository = {
      find: jest.fn(),
      save: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    movieRepository = module.get<jest.Mocked<Repository<Movie>>>(getRepositoryToken(Movie));
  });

  it('should return correct prize intervals for mock data', async () => {
    // Dados mockados de filmes
    const mockMovies: Movie[] = [
      {
        year: 2000,
        title: 'Movie 1',
        producers: 'Producer A',
        studios: 'Studio 1',
        winner: true,
        id: 1
      },
      {
        year: 2003,
        title: 'Movie 2',
        producers: 'Producer A',
        studios: 'Studio 2',
        winner: true,
        id: 2
      },
      {
        year: 2010,
        title: 'Movie 3',
        producers: 'Producer B',
        studios: 'Studio 3',
        winner: false,
        id: 3
      },
      {
        year: 2015,
        title: 'Movie 4',
        producers: 'Producer A',
        studios: 'Studio 4',
        winner: true,
        id: 4
      },
    ];

    // Mockando o comportamento do repositório para retornar os filmes mockados
    movieRepository.find.mockResolvedValue(mockMovies);

    // Chamar a função getPrizeIntervals diretamente com os filmes mockados
    const result = await service.getPrizeIntervals(mockMovies);

    // Verificar se a resposta segue o padrão esperado
    expect(result).toHaveProperty('min');
    expect(result).toHaveProperty('max');

    // Verificar se a lista "min" tem o formato correto
    expect(result.min).toHaveLength(1); // Espera-se 1 produtor com o menor intervalo
    expect(result.min[0].producer).toBe('Producer A');
    expect(result.min[0].interval).toBe(3); // O menor intervalo é 3 anos (2000-2003)
    expect(result.min[0].previousWin).toBe(2000);
    expect(result.min[0].followingWin).toBe(2003);

    // Verificar se a lista "max" tem o formato correto
    expect(result.max).toHaveLength(1); // Espera-se 1 produtor com o maior intervalo
    expect(result.max[0].producer).toBe('Producer A');
    expect(result.max[0].interval).toBe(12); // O maior intervalo é 12 anos (2003-2015)
    expect(result.max[0].previousWin).toBe(2003);
    expect(result.max[0].followingWin).toBe(2015);
  });
});
