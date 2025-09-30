import pytest
from src.cleaning.validators import validate_data_types, validate_values

def test_validate_data_types():
    # Test valid data types
    assert validate_data_types({'age': 25, 'name': 'John'}) == True
    assert validate_data_types({'age': '25', 'name': 'John'}) == False
    assert validate_data_types({'age': None, 'name': 'John'}) == False

def test_validate_values():
    # Test valid values
    assert validate_values({'gender': 'male'}, 'gender', ['male', 'female']) == True
    assert validate_values({'gender': 'unknown'}, 'gender', ['male', 'female']) == False
    assert validate_values({'status': 'active'}, 'status', ['active', 'inactive']) == True
    assert validate_values({'status': 'pending'}, 'status', ['active', 'inactive']) == False