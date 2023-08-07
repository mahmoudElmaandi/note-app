declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      JWT_SECRET: string,
      PASSWORD_SALT: string
    }
  }
}

export { }
