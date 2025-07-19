// CSS module declarations
declare module '*.css' {
  const content: any;
  export default content;
}

// Environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production';
    DATABASE_URL: string;
    JWT_SECRET: string;
    GOOGLE_GENAI_API_KEY: string;
    FRONTEND_URL?: string;
  }
}
