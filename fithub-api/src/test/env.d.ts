declare namespace NodeJS {
  interface ProcessEnv {
    MONGODB_URI_TEST: string;
    JWT_SECRET: string;
    NODE_ENV: 'test' | 'development' | 'production';
  }
} 