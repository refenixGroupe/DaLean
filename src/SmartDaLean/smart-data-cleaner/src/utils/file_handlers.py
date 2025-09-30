class FileHandler:
    import pandas as pd
    import json
    import os

    @staticmethod
    def read_csv(file_path):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file {file_path} does not exist.")
        return FileHandler.pd.read_csv(file_path)

    @staticmethod
    def write_csv(dataframe, file_path):
        dataframe.to_csv(file_path, index=False)

    @staticmethod
    def read_json(file_path):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"The file {file_path} does not exist.")
        with open(file_path, 'r') as file:
            return json.load(file)

    @staticmethod
    def write_json(data, file_path):
        with open(file_path, 'w') as file:
            json.dump(data, file, indent=4)