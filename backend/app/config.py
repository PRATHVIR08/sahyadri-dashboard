from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Sahyadri Student Portal"
    secret_key: str = "change-me-in-production-sahyadri-portal"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    database_url: str = "sqlite:///./sahyadri.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    lost_and_found_url: str = "https://lost-and-found.sahyadri.edu.in"
    college_email_domain: str = "sahyadri.edu.in"


settings = Settings()
