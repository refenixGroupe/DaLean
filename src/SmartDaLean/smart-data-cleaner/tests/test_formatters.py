import pytest
from src.cleaning.formatters import format_date, normalize_string

def test_format_date():
    assert format_date("2023-01-01") == "2023-01-01"
    assert format_date("01/01/2023") == "2023-01-01"
    assert format_date("01-01-2023") == "2023-01-01"
    assert format_date("2023/01/01") == "2023-01-01"
    assert format_date("Invalid Date") == "Invalid Date"

def test_normalize_string():
    assert normalize_string("  Hello World  ") == "hello world"
    assert normalize_string("Python 3.8") == "python 3.8"
    assert normalize_string("DATA SCIENCE") == "data science"
    assert normalize_string("") == ""
    assert normalize_string(None) == None