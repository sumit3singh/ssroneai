import importlib


def test_core_form_builder_router_imports() -> None:
    module = importlib.import_module("src.core.form_builder.router")
    assert module is not None
