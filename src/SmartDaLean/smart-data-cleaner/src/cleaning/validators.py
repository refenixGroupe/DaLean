class DataValidator:
    @staticmethod
    def validate_string(value):
        return isinstance(value, str) and bool(value.strip())

    @staticmethod
    def validate_integer(value):
        return isinstance(value, int)

    @staticmethod
    def validate_float(value):
        return isinstance(value, float)

    @staticmethod
    def validate_date(value):
        if isinstance(value, str):
            try:
                pd.to_datetime(value)
                return True
            except ValueError:
                return False
        return False

    @staticmethod
    def validate_email(value):
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return isinstance(value, str) and re.match(email_regex, value) is not None

    @staticmethod
    def validate_license_plate(value):
        current_pattern = r'^\d{3}-\d{3}-\d{2}$'
        old_pattern = r'^\d{4}\s*[A-Z]{2}\s*\d{2}$'
        return isinstance(value, str) and (re.match(current_pattern, value) or re.match(old_pattern, value)) is not None

    @staticmethod
    def validate_city(value, valid_cities):
        return value in valid_cities

    @staticmethod
    def validate_phone_number(value):
        phone_regex = r'^\+?\d{1,3}[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$'
        return isinstance(value, str) and re.match(phone_regex, value) is not None

    @staticmethod
    def validate_dataframe(df, schema):
        for column, validation_func in schema.items():
            if column in df.columns:
                if not df[column].apply(validation_func).all():
                    return False
        return True