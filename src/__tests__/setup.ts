// Variables d'environnement pour les tests
process.env.JWT_SECRET = 'test_secret_minimum_32_characters_long';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DATABASE_URL = 'postgresql://test@localhost:5432/test';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173';
process.env.SERVER_PORT = '3001';