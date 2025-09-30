class DataFormatter:
    @staticmethod
    def standardize_date_format(date_str, current_format, target_format="%Y-%m-%d"):
        from datetime import datetime
        
        try:
            date_obj = datetime.strptime(date_str, current_format)
            return date_obj.strftime(target_format)
        except ValueError:
            return date_str  # Return original if parsing fails

    @staticmethod
    def normalize_string(value):
        if isinstance(value, str):
            return value.strip().lower()
        return value

    @staticmethod
    def format_phone_number(phone_str):
        import re
        
        if not isinstance(phone_str, str):
            return phone_str
        
        # Remove all non-digit characters
        digits = re.sub(r'\D', '', phone_str)
        
        if len(digits) == 10:  # Assuming US phone number format
            return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
        return phone_str  # Return original if not matching expected format

    @staticmethod
    def format_email(email_str):
        import re
        
        if isinstance(email_str, str):
            email_str = email_str.strip()
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if re.match(email_regex, email_str):
                return email_str.lower()
        return email_str  # Return original if not matching expected format