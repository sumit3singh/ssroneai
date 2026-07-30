import sys
from pathlib import Path
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from scripts import seed

class DummyConnection:
    def __init__(self, calls):
        self.calls = calls

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def run_sync(self, fn):
        fn(self)

    def exec_driver_sql(self, sql):
        self.calls.append("exec_driver_sql")

class DummyEngine:
    def __init__(self, calls):
        self.calls = calls

    def begin(self):
        return DummyConnection(self.calls)

@pytest.mark.asyncio
async def test_create_tables_resets_schema_before_create(monkeypatch):
    calls = []

    def fake_drop_all(connection):
        calls.append("drop")

    def fake_create_all(connection):
        calls.append("create")

    monkeypatch.setattr(seed.Base.metadata, "drop_all", fake_drop_all)
    monkeypatch.setattr(seed.Base.metadata, "create_all", fake_create_all)
    monkeypatch.setattr(seed, "engine", DummyEngine(calls))

    await seed.create_tables(reset=True)

    assert "exec_driver_sql" in calls
    assert "create" in calls
