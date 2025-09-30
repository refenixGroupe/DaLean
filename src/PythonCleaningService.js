class PythonCleaningService {
  static BASE_URL = "http://localhost:5001/api";

  static async health() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const response = await fetch(`${this.BASE_URL}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  static async smartCleanData(data) {
    try {
      const response = await fetch(`${this.BASE_URL}/smart-clean`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        return {
          cleanedData: result.cleaned_data,
          columnTypes: result.column_types,
          qualityAssessment: result.quality_assessment,
          cleaningSummary: result.cleaning_summary,
          success: true,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Python smart cleaning error:", error);
      throw error;
    }
  }

  static async inferColumnTypes(data) {
    try {
      const response = await fetch(`${this.BASE_URL}/infer-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();

      if (result.success) {
        return {
          columnTypes: result.column_types,
          success: true,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Column type inference error:", error);
      throw error;
    }
  }

  static async getQualityAssessment(data) {
    try {
      const response = await fetch(`${this.BASE_URL}/quality-assessment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data }),
      });

      const result = await response.json();

      if (result.success) {
        return {
          qualityAssessment: result.quality_assessment,
          success: true,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Quality assessment error:", error);
      throw error;
    }
  }
}

export default PythonCleaningService;
