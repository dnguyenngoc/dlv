import os

from app.api.routes.auth import router as auth_router
from app.api.routes.dashboards import router as dashboards_router
from app.api.routes.lineage import router as lineage_router
from app.api.routes.nodes import router as nodes_router
from app.core.database import Base, SessionLocal, engine
from app.models.user import User, UserRole
from app.security import get_password_hash
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


def create_app() -> FastAPI:
    """Create and configure FastAPI application instance."""
    app = FastAPI(title="DLV Backend", version="1.0.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    # DB init (simple create_all for first release)
    Base.metadata.create_all(bind=engine)

    # Seed admin if configured
    admin_user = os.getenv("ADMIN_USERNAME")
    admin_pass = os.getenv("ADMIN_PASSWORD")
    if admin_user and admin_pass:
        db = SessionLocal()
        try:
            if not db.query(User).filter(User.username == admin_user).first():
                db.add(
                    User(
                        username=admin_user,
                        password_hash=get_password_hash(admin_pass),
                        role=UserRole.ADMIN,
                    )
                )
                db.commit()
        finally:
            db.close()

    # Routes
    app.include_router(auth_router)
    app.include_router(nodes_router)
    app.include_router(lineage_router)
    app.include_router(dashboards_router)

    return app


app = create_app()


def main():
    """Main function to run the backend server."""
    print("Hello from backend!")


if __name__ == "__main__":
    main()
