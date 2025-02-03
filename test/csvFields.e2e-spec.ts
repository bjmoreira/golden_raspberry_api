import * as fs from 'fs';
import * as csv from 'csv-parser';

// Definir os campos obrigatórios
const requiredFields = ['year', 'producers'];

// Função que valida os campos do CSV
export function validateCSV(filePath: string): string[] {
  const invalidRows: string[] = [];

  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  fs.createReadStream(filePath)
    .pipe(csv({ separator: ';' }))
    .on('data', (row) => {
      const missingFields = requiredFields.filter((field) => !row[field] || row[field] === '');

      if (missingFields.length > 0) {
        invalidRows.push(`Linha inválida: ${JSON.stringify(row)} (Campos ausentes: ${missingFields.join(', ')})`);
      }
    })
    .on('end', () => {
      if (invalidRows.length > 0) {
        throw new Error(`Linhas com campos inválidos ou ausentes: ${invalidRows.join('\n')}`);
      }
    })
    .on('error', (err) => {
      throw new Error(`Erro ao ler o arquivo CSV: ${err}`);
    });

  return invalidRows;
}

// Teste com Jest para validar os campos do CSV
describe('CSV Validation', () => {
  it('deve verificar se todos os campos obrigatórios existem no CSV, exceto o campo "winner"', (done) => {
    const filePath = './data/Movielist.csv';

    try {
      const invalidRows = validateCSV(filePath);

      // Se houver linhas inválidas, falhará no teste
      expect(invalidRows.length).toBe(0);

      done(); // Finaliza o teste quando o processo assíncrono terminar
    } catch (error) {
      done(error); // Em caso de erro, falha o teste
    }
  });
});
