from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Connector(Base):
    __tablename__ = "connectors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="disconnected")
    last_synced_at = Column(DateTime(timezone=True), nullable=True)

class SyncRun(Base):
    __tablename__ = "sync_runs"
    id = Column(Integer, primary_key=True, index=True)
    connector_id = Column(Integer, ForeignKey("connectors.id"))
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="running")
    records_changed = Column(Integer, default=0)

class Record(Base):
    __tablename__ = "records"
    id = Column(Integer, primary_key=True, index=True)
    connector_id = Column(Integer, ForeignKey("connectors.id"))
    external_id = Column(String, nullable=False)
    title = Column(String)
    status = Column(String)
    owner = Column(String)
    data_hash = Column(String)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class RecordChange(Base):
    __tablename__ = "record_changes"
    id = Column(Integer, primary_key=True, index=True)
    record_id = Column(Integer, ForeignKey("records.id"))
    sync_run_id = Column(Integer, ForeignKey("sync_runs.id"))
    change_type = Column(String)
    changed_at = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())