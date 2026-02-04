.PHONY: install run test lint type

install:
	python -m pip install -e .[dev]

run:
	evennia start

test:
	pytest

lint:
	ruff check .
	ruff format --check .

type:
	mypy core evennia_adapter typeclasses commands tests
