describe('Ejemplo de Test Unitario', () => {
  test('debe sumar dos números correctamente', () => {
    expect(1 + 1).toBe(2);
  });

  test('debe validar string', () => {
    const texto = 'DICRI';
    expect(texto).toBe('DICRI');
    expect(texto.length).toBe(5);
  });
});
