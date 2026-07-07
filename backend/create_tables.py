from database import engine, Base
from models import Connector, SyncRun, Record, RecordChange

Base.metadata.create_all(bind=engine)
print("Tables created successfully!")