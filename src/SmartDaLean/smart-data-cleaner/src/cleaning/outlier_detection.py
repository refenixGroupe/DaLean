class OutlierDetection:
    def __init__(self, threshold=1.5):
        self.threshold = threshold

    def detect_outliers_iqr(self, data, column):
        Q1 = data[column].quantile(0.25)
        Q3 = data[column].quantile(0.75)
        IQR = Q3 - Q1
        lower_bound = Q1 - (self.threshold * IQR)
        upper_bound = Q3 + (self.threshold * IQR)
        return data[(data[column] < lower_bound) | (data[column] > upper_bound)]

    def detect_outliers_zscore(self, data, column):
        mean = data[column].mean()
        std_dev = data[column].std()
        z_scores = (data[column] - mean) / std_dev
        return data[abs(z_scores) > self.threshold]

    def handle_outliers(self, data, column, method='iqr'):
        if method == 'iqr':
            return self.detect_outliers_iqr(data, column)
        elif method == 'zscore':
            return self.detect_outliers_zscore(data, column)
        else:
            raise ValueError("Method must be 'iqr' or 'zscore'")