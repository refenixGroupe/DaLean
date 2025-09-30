import pytest
import pandas as pd
from src.cleaning.smart_data_cleaner import SmartDataCleaner

def test_clean_data():
    # Sample data for testing
    data = {
        'name': ['Alice', 'Bob', 'Charlie', None],
        'age': ['25', '30', '35', 'invalid'],
        'date_of_birth': ['1995-01-01', '1990-02-02', '1985-03-03', 'not_a_date'],
        'salary': [50000, None, 70000, 80000]
    }
    df = pd.DataFrame(data)

    cleaner = SmartDataCleaner(df)
    cleaned_df = cleaner.clean_data()

    # Check if the cleaned DataFrame has the expected values
    assert cleaned_df['name'].isnull().sum() == 0  # No missing names
    assert cleaned_df['age'].isnull().sum() == 1  # One invalid age should be NaN
    assert cleaned_df['date_of_birth'].isnull().sum() == 1  # One invalid date should be NaN
    assert cleaned_df['salary'].isnull().sum() == 1  # One missing salary should be NaN

def test_log_cleaning_steps(caplog):
    data = {
        'name': ['Alice', 'Bob'],
        'age': ['25', '30'],
        'date_of_birth': ['1995-01-01', '1990-02-02'],
        'salary': [50000, 60000]
    }
    df = pd.DataFrame(data)

    cleaner = SmartDataCleaner(df)
    cleaner.clean_data()

    # Check if the log contains expected messages
    assert "Cleaning steps completed" in caplog.text
    assert "Standardized age values" in caplog.text
    assert "Formatted date_of_birth" in caplog.text

def test_invalid_dataframe():
    with pytest.raises(ValueError, match="Invalid DataFrame provided"):
        cleaner = SmartDataCleaner(None)
        cleaner.clean_data()