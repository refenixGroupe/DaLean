# settings.py

class Config:
    DATA_PATH = 'data/'
    RAW_DATA_PATH = f'{DATA_PATH}raw/'
    PROCESSED_DATA_PATH = f'{DATA_PATH}processed/'
    LOGGING_LEVEL = 'INFO'
    DEFAULT_DATE_FORMAT = '%Y-%m-%d'
    MISSING_VALUE_REPLACEMENT = 'Unknown'
    OUTLIER_THRESHOLD = 1.5
    VALIDATION_RULES = {
        'email': r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
        'phone': r'^[\d\s\-+()]{8,}$',
    }