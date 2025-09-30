import _ from "lodash";

/**
 * Comprehensive data quality scoring and cleaning utility for Algerian insurance data
 * Provides advanced cleaning operations with detailed logging and quality assessment
 */
export class DataQualityScorer {
  // Static constants and regex patterns
  static EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Algerian license plate patterns
  static LICENSE_PLATE_REGEX = {
    current: /^\d{3}-\d{3}-\d{2}$/, // 123-456-78
    old: /^\d{4}\s*[A-Z]{2}\s*\d{2}$/, // 1234 AB 12
  };

  // Default weights for quality dimensions
  static DEFAULT_WEIGHTS = {
    completeness: 0.25,
    accuracy: 0.25,
    consistency: 0.25,
    uniqueness: 0.25,
  };

  // Static data constants
  static ALGERIAN_CITIES = [
    "Adrar",
    "Chlef",
    "Laghouat",
    "Oum El Bouaghi",
    "Batna",
    "Béjaïa",
    "Biskra",
    "Béchar",
    "Blida",
    "Bouira",
    "Tamanrasset",
    "Tébessa",
    "Tlemcen",
    "Tiaret",
    "Tizi Ouzou",
    "Alger",
    "Djelfa",
    "Jijel",
    "Sétif",
    "Saïda",
    "Skikda",
    "Sidi Bel Abbès",
    "Annaba",
    "Guelma",
    "Constantine",
    "Médéa",
    "Mostaganem",
    "MSila",
    "Mascara",
    "Ouargla",
    "Oran",
    "El Bayadh",
    "Illizi",
    "Bordj Bou Arreridj",
    "Boumerdès",
    "El Tarf",
    "Tindouf",
    "Tissemsilt",
    "El Oued",
    "Khenchela",
    "Souk Ahras",
    "Tipaza",
    "Mila",
    "Aïn Defla",
    "Naâma",
    "Aïn Témouchent",
    "Ghardaïa",
    "Relizane",
  ];

  static CAR_BRANDS = [
    "Toyota",
    "Renault",
    "Peugeot",
    "Hyundai",
    "Volkswagen",
    "Ford",
    "Nissan",
    "Kia",
    "Citroën",
    "Dacia",
    "Mercedes",
    "BMW",
    "Audi",
    "Seat",
    "Skoda",
    "Fiat",
    "Opel",
    "Chevrolet",
    "Suzuki",
    "Mazda",
    "Honda",
    "Mitsubishi",
  ];

  static SPELLING_CORRECTIONS = {
    // Gender corrections
    male: ["mal", "homme", "masculin", "mâle", "garcon", "homm"],
    female: ["femal", "femme", "féminin", "femelle", "fille", "fem"],

    // Common Algerian city corrections
    alger: ["algér", "algers", "algier", "algiers"],
    oran: ["orane", "whran", "wahran"],
    constantine: ["qsentina", "qosantina", "constentine"],
    annaba: ["annaba", "bona", "bone"],
    blida: ["blida", "boulaida"],
    setif: ["sétif", "stif", "setiff"],
    "sidi bel abbes": ["sidi bel abbès", "sidi belabes"],
    tlemcen: ["tlemcen", "tlemsen"],
    batna: ["batna", "batana"],
    biskra: ["biskra", "biscra"],

    // Car brand corrections
    toyota: ["tyota", "toyouta", "toyata"],
    renault: ["reno", "renaut", "renalt"],
    peugeot: ["peugeot", "peugeaot", "peujet"],
    volkswagen: ["volkswagan", "volkswagin", "vw"],
    mercedes: ["mercedez", "mersedes", "mercedes-benz"],
    hyundai: ["hyundaï", "hyunday", "hundai"],
  };

  /**
   * Format name fields with proper capitalization
   */
  formatName(value, isLastName = false, isFirstName = false) {
    if (!value || typeof value !== "string") return value;

    let formatted = value.trim().toLowerCase();

    // Handle Arabic/French transliterations
    formatted = formatted
      .replace(/ou/g, "ou")
      .replace(/ch/g, "ch")
      .replace(/kh/g, "kh");

    // Capitalize appropriately
    if (isLastName) {
      formatted = formatted
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    } else {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }

    return formatted;
  }

  /**
   * Format car brand/model fields
   */
  formatCarField(value) {
    if (!value || typeof value !== "string") return value;

    const formatted = value.trim().toLowerCase();

    // Check against known brands
    for (const brand of DataQualityScorer.CAR_BRANDS) {
      if (formatted.includes(brand.toLowerCase())) {
        return brand;
      }
    }

    // Default capitalization
    return value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  /**
   * Format gender field
   */
  formatGender(value) {
    if (!value || typeof value !== "string") return value;

    const normalized = value.trim().toLowerCase();

    // Male variations
    if (
      ["m", "male", "homme", "masculin", "mâle", "garcon", "h"].includes(
        normalized
      )
    ) {
      return "Male";
    }

    // Female variations
    if (
      ["f", "female", "femme", "féminin", "femelle", "fille"].includes(
        normalized
      )
    ) {
      return "Female";
    }

    return value;
  }

  /**
   * Format city names
   */
  formatCity(value) {
    if (!value || typeof value !== "string") return value;

    const normalized = value.trim().toLowerCase();

    // Check against Algerian cities
    for (const city of DataQualityScorer.ALGERIAN_CITIES) {
      if (normalized === city.toLowerCase()) {
        return city;
      }
    }

    // Default capitalization
    return value
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  /**
   * Format phone numbers to standard format
   */
  formatPhoneNumber(value) {
    if (!value || typeof value !== "string") return value;

    // Remove all non-digits
    const digits = value.replace(/\D/g, "");

    // Algerian phone format: +213 XX XX XX XX XX
    if (digits.length === 10 && digits.startsWith("0")) {
      return `+213 ${digits.slice(1, 3)} ${digits.slice(3, 5)} ${digits.slice(
        5,
        7
      )} ${digits.slice(7, 9)} ${digits.slice(9)}`;
    }

    if (digits.length === 9) {
      return `+213 ${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(
        4,
        6
      )} ${digits.slice(6, 8)} ${digits.slice(8)}`;
    }

    return value;
  }

  /**
   * Format date to standard YYYY-MM-DD format
   */
  formatDate(value) {
    if (!value || typeof value !== "string") return value;

    const dateStr = value.trim();

    // Try different date formats
    const formats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // DD/MM/YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // DD-MM-YYYY
      /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, // YYYY/MM/DD
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
    ];

    for (const format of formats) {
      const match = dateStr.match(format);
      if (match) {
        let day, month, year;

        if (format.source.startsWith("^(\\d{4})")) {
          // YYYY format
          year = match[1];
          month = match[2].padStart(2, "0");
          day = match[3].padStart(2, "0");
        } else {
          // DD format
          day = match[1].padStart(2, "0");
          month = match[2].padStart(2, "0");
          year = match[3];
        }

        return `${year}-${month}-${day}`;
      }
    }

    return value;
  }

  /**
   * Detect missing values in dataset
   */
  detectMissingValues(data) {
    if (!data || !Array.isArray(data)) return { total: 0, byField: {} };

    const byField = {};
    let total = 0;

    data.forEach((row) => {
      Object.keys(row).forEach((field) => {
        const value = row[field];
        const isMissing =
          value === null ||
          value === undefined ||
          value === "" ||
          (typeof value === "string" && value.trim() === "") ||
          value === "N/A" ||
          value === "null" ||
          value === "undefined";

        if (isMissing) {
          byField[field] = (byField[field] || 0) + 1;
          total++;
        }
      });
    });

    return { total, byField };
  }

  /**
   * Handle missing values with various strategies
   */
  handleMissingValues(data, options = {}) {
    const { strategy = "remove", threshold = 0.5 } = options;
    const cleaned = _.cloneDeep(data);
    let changeCount = 0;
    const log = [];

    if (strategy === "remove") {
      // Remove rows with too many missing values
      const originalLength = cleaned.length;
      const filteredData = cleaned.filter((row) => {
        const fields = Object.keys(row);
        const missingCount = fields.filter((field) => {
          const value = row[field];
          return (
            value === null ||
            value === undefined ||
            value === "" ||
            (typeof value === "string" && value.trim() === "")
          );
        }).length;

        return missingCount / fields.length < threshold;
      });

      changeCount = originalLength - filteredData.length;
      log.push(
        `Removed ${changeCount} rows with >${threshold * 100}% missing values`
      );
      return { data: filteredData, log };
    }

    if (strategy === "fill") {
      // Fill missing values with defaults
      cleaned.forEach((row) => {
        Object.keys(row).forEach((field) => {
          const value = row[field];
          if (
            value === null ||
            value === undefined ||
            value === "" ||
            (typeof value === "string" && value.trim() === "")
          ) {
            row[field] = "Unknown";
            changeCount++;
          }
        });
      });

      log.push(`Filled ${changeCount} missing values with default values`);
    }

    return { data: cleaned, log };
  }

  /**
   * Detect duplicate rows with fuzzy matching
   */
  detectDuplicates(data, options = {}) {
    const { fuzzyMatch = true, threshold = 0.9 } = options;
    const duplicates = [];
    const seen = new Set();

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowKey = JSON.stringify(row);

      if (seen.has(rowKey)) {
        duplicates.push(i);
        continue;
      }

      if (fuzzyMatch) {
        // Check for fuzzy duplicates
        for (let j = i + 1; j < data.length; j++) {
          const compareRow = data[j];
          if (
            this.isDuplicateRow(row, compareRow, Object.keys(row), {
              threshold,
            })
          ) {
            duplicates.push(j);
          }
        }
      }

      seen.add(rowKey);
    }

    return { duplicateIndices: duplicates, count: duplicates.length };
  }

  /**
   * Check if two rows are duplicates using fuzzy matching
   */
  isDuplicateRow(row1, row2, headers, options = {}) {
    const { threshold = 0.9 } = options;
    let matches = 0;
    let comparisons = 0;

    headers.forEach((header) => {
      const val1 = String(row1[header] || "")
        .toLowerCase()
        .trim();
      const val2 = String(row2[header] || "")
        .toLowerCase()
        .trim();

      if (val1 === "" && val2 === "") return; // Skip empty values

      comparisons++;

      if (val1 === val2) {
        matches++;
      } else {
        // Fuzzy string matching
        const similarity = this.calculateStringSimilarity(val1, val2);
        if (similarity >= threshold) {
          matches++;
        }
      }
    });

    return comparisons > 0 && matches / comparisons >= threshold;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateStringSimilarity(str1, str2) {
    if (str1.length === 0) return str2.length === 0 ? 1 : 0;
    if (str2.length === 0) return 0;

    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    const maxLength = Math.max(str1.length, str2.length);
    return (maxLength - matrix[str2.length][str1.length]) / maxLength;
  }

  /**
   * Remove duplicate rows
   */
  removeDuplicates(data, options = {}) {
    const duplicateInfo = this.detectDuplicates(data, options);
    const cleaned = data.filter(
      (_, index) => !duplicateInfo.duplicateIndices.includes(index)
    );

    return {
      data: cleaned,
      log: [`Removed ${duplicateInfo.count} duplicate rows`],
    };
  }

  /**
   * Standardize and format data
   */
  standardizeAndFormat(data, options = {}) {
    const cleaned = _.cloneDeep(data);
    const columnTypes = this.identifyColumnTypes(Object.keys(data[0] || {}));
    const log = [];

    // Format names
    if (options.formatNames !== false) {
      const nameResults = this.formatAllNames(cleaned, columnTypes.names);
      log.push(...nameResults.log);
    }

    // Format gender
    if (options.formatGender !== false) {
      const genderResults = this.formatAllGender(cleaned, columnTypes.gender);
      log.push(...genderResults.log);
    }

    // Format car fields
    if (options.formatCars !== false) {
      const carResults = this.formatAllCarFields(cleaned, columnTypes.car);
      log.push(...carResults.log);
    }

    // Format cities
    if (options.formatCities !== false) {
      const cityResults = this.formatAllCities(cleaned, columnTypes.cities);
      log.push(...cityResults.log);
    }

    return { data: cleaned, log };
  }

  /**
   * Identify column types based on headers
   */
  identifyColumnTypes(headers) {
    const types = {
      names: {
        firstName: [],
        lastName: [],
        fullName: [],
      },
      gender: [],
      car: [],
      cities: [],
      phones: [],
      dates: [],
      numeric: [],
    };

    headers.forEach((header) => {
      const lowerHeader = header.toLowerCase();

      // Name columns
      if (lowerHeader.includes("first") && lowerHeader.includes("name")) {
        types.names.firstName.push(header);
      } else if (lowerHeader.includes("last") && lowerHeader.includes("name")) {
        types.names.lastName.push(header);
      } else if (
        lowerHeader.includes("name") &&
        !lowerHeader.includes("first") &&
        !lowerHeader.includes("last")
      ) {
        types.names.fullName.push(header);
      }

      // Gender
      if (lowerHeader.includes("gender") || lowerHeader.includes("sex")) {
        types.gender.push(header);
      }

      // Car fields
      if (
        lowerHeader.includes("brand") ||
        lowerHeader.includes("make") ||
        lowerHeader.includes("model") ||
        lowerHeader.includes("car")
      ) {
        types.car.push(header);
      }

      // Cities
      if (
        lowerHeader.includes("city") ||
        lowerHeader.includes("ville") ||
        lowerHeader.includes("location")
      ) {
        types.cities.push(header);
      }

      // Phone numbers
      if (
        lowerHeader.includes("phone") ||
        lowerHeader.includes("tel") ||
        lowerHeader.includes("mobile")
      ) {
        types.phones.push(header);
      }

      // Dates
      if (
        lowerHeader.includes("date") ||
        lowerHeader.includes("birth") ||
        lowerHeader.includes("created") ||
        lowerHeader.includes("updated")
      ) {
        types.dates.push(header);
      }

      // Numeric
      if (
        lowerHeader.includes("age") ||
        lowerHeader.includes("price") ||
        lowerHeader.includes("amount") ||
        lowerHeader.includes("number")
      ) {
        types.numeric.push(header);
      }
    });

    return types;
  }

  /**
   * Format all name columns
   */
  formatAllNames(data, nameColumns) {
    let changeCount = 0;
    const log = [];

    // Format first names
    nameColumns.firstName.forEach((col) => {
      data.forEach((row) => {
        if (row[col]) {
          const original = row[col];
          row[col] = this.formatName(row[col], false, true);
          if (original !== row[col]) changeCount++;
        }
      });
    });

    // Format last names
    nameColumns.lastName.forEach((col) => {
      data.forEach((row) => {
        if (row[col]) {
          const original = row[col];
          row[col] = this.formatName(row[col], true, false);
          if (original !== row[col]) changeCount++;
        }
      });
    });

    // Format full names
    nameColumns.fullName.forEach((col) => {
      data.forEach((row) => {
        if (row[col]) {
          const original = row[col];
          row[col] = this.formatName(row[col], false, false);
          if (original !== row[col]) changeCount++;
        }
      });
    });

    if (changeCount > 0) {
      log.push(`Standardized formatting for ${changeCount} name values`);
    }

    return { data, log };
  }

  /**
   * Format all gender columns
   */
  formatAllGender(data, genderColumns) {
    let changeCount = 0;
    const log = [];

    genderColumns.forEach((col) => {
      data.forEach((row) => {
        if (row[col]) {
          const original = row[col];
          row[col] = this.formatGender(row[col]);
          if (original !== row[col]) changeCount++;
        }
      });
    });

    if (changeCount > 0) {
      log.push(`Standardized formatting for ${changeCount} gender values`);
    }

    return { data, log };
  }

  /**
   * Format all car field columns
   */
  formatAllCarFields(data, carColumns) {
    let changeCount = 0;
    const log = [];

    carColumns.forEach((col) => {
      data.forEach((row) => {
        if (row[col]) {
          const original = row[col];
          row[col] = this.formatCarField(row[col]);
          if (original !== row[col]) changeCount++;
        }
      });
    });

    if (changeCount > 0) {
      log.push(
        `Standardized formatting for ${changeCount} car brand/model values`
      );
    }

    return { data, log };
  }

  /**
   * Format all city columns
   */
  formatAllCities(data, cityColumns) {
    let changeCount = 0;
    const log = [];

    cityColumns.forEach((col) => {
      data.forEach((row) => {
        if (row[col]) {
          const original = row[col];
          row[col] = this.formatCity(row[col]);
          if (original !== row[col]) changeCount++;
        }
      });
    });

    if (changeCount > 0) {
      log.push(`Standardized formatting for ${changeCount} city values`);
    }

    return { data, log };
  }

  /**
   * Detect outliers in numeric fields
   */
  detectOutliers(data, options = {}) {
    const { method = "iqr", threshold = 1.5, percentile = 99 } = options;
    const outliers = [];
    const headers = Object.keys(data[0] || {});

    headers.forEach((header) => {
      const values = data
        .map((row) => parseFloat(row[header]))
        .filter((val) => !isNaN(val));

      if (values.length === 0) return;

      let bounds;

      switch (method) {
        case "iqr":
          bounds = this.calculateIQRBounds(values, threshold);
          break;
        case "zscore":
          bounds = this.calculateZScoreBounds(values, threshold);
          break;
        case "percentile":
          bounds = this.calculatePercentileBounds(values, percentile);
          break;
        default:
          bounds = this.calculateIQRBounds(values, threshold);
      }

      data.forEach((row, index) => {
        const value = parseFloat(row[header]);
        if (!isNaN(value) && (value < bounds.lower || value > bounds.upper)) {
          outliers.push({
            index,
            field: header,
            value,
            bounds,
          });
        }
      });
    });

    return { outliers, count: outliers.length };
  }

  /**
   * Calculate IQR bounds for outlier detection
   */
  calculateIQRBounds(values, multiplier = 1.5) {
    const sorted = values.sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;

    return {
      lower: q1 - multiplier * iqr,
      upper: q3 + multiplier * iqr,
    };
  }

  /**
   * Calculate Z-score bounds for outlier detection
   */
  calculateZScoreBounds(values, threshold = 3) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    return {
      lower: mean - threshold * stdDev,
      upper: mean + threshold * stdDev,
    };
  }

  /**
   * Calculate percentile bounds for outlier detection
   */
  calculatePercentileBounds(values, percentile = 99) {
    const sorted = values.sort((a, b) => a - b);
    const upperIndex = Math.floor((percentile / 100) * sorted.length);
    const lowerIndex = Math.floor(((100 - percentile) / 100) * sorted.length);

    return {
      lower: sorted[lowerIndex],
      upper: sorted[upperIndex],
    };
  }

  /**
   * Remove outliers from data
   */
  removeOutliers(data, options = {}) {
    const outlierInfo = this.detectOutliers(data, options);
    const outlierIndices = new Set(outlierInfo.outliers.map((o) => o.index));
    const cleaned = data.filter((_, index) => !outlierIndices.has(index));

    return {
      data: cleaned,
      log: [`Removed ${outlierInfo.count} outlier values`],
    };
  }

  /**
   * Correct spelling errors in text fields
   */
  correctSpelling(data, options = {}) {
    const cleaned = _.cloneDeep(data);
    const columnTypes = this.identifyColumnTypes(Object.keys(data[0] || {}));
    const log = [];

    // Correct car brand spellings
    if (options.correctCars !== false) {
      const corrections = DataQualityScorer.SPELLING_CORRECTIONS;
      const carResults = this.correctFieldSpelling(
        cleaned,
        columnTypes.car,
        corrections,
        "car brands"
      );
      log.push(...carResults.log);
    }

    // Correct city spellings
    if (options.correctCities !== false) {
      const corrections = DataQualityScorer.SPELLING_CORRECTIONS;
      const cityResults = this.correctFieldSpelling(
        cleaned,
        columnTypes.cities,
        corrections,
        "cities"
      );
      log.push(...cityResults.log);
    }

    // Correct gender spellings
    if (options.correctGender !== false) {
      const corrections = DataQualityScorer.SPELLING_CORRECTIONS;
      const genderResults = this.correctFieldSpelling(
        cleaned,
        columnTypes.gender,
        corrections,
        "gender"
      );
      log.push(...genderResults.log);
    }

    return { data: cleaned, log };
  }

  /**
   * Correct spelling in specific fields
   */
  correctFieldSpelling(data, fieldNames, corrections, fieldType) {
    let changeCount = 0;
    const log = [];

    data.forEach((row) => {
      fieldNames.forEach((field) => {
        if (row[field]) {
          const original = row[field];
          const normalized = original.toLowerCase().trim();

          // Check direct corrections
          for (const [correct, variants] of Object.entries(corrections)) {
            if (variants.includes(normalized)) {
              row[field] = correct.charAt(0).toUpperCase() + correct.slice(1);
              changeCount++;
              break;
            }
          }

          // Fuzzy matching for partial matches
          if (row[field] === original) {
            const fuzzyMatch = this.findFuzzySpellingMatch(
              normalized,
              corrections
            );
            if (fuzzyMatch) {
              row[field] =
                fuzzyMatch.charAt(0).toUpperCase() + fuzzyMatch.slice(1);
              changeCount++;
            }
          }
        }
      });
    });

    if (changeCount > 0) {
      log.push(`Corrected ${changeCount} spelling errors in ${fieldType}`);
    }

    return { data, log };
  }

  /**
   * Find fuzzy spelling matches
   */
  findFuzzySpellingMatch(value, corrections, threshold = 0.8) {
    for (const [correct, variants] of Object.entries(corrections)) {
      for (const variant of variants) {
        const similarity = this.calculateStringSimilarity(value, variant);
        if (similarity >= threshold) {
          return correct;
        }
      }
    }
    return null;
  }

  /**
   * Fix data types and formats
   */
  fixDataTypes(data, options = {}) {
    const { strictMode = false } = options;
    const cleaned = _.cloneDeep(data);
    const headers = Object.keys(data[0] || {});
    const log = [];

    const typeMap = this.inferDataTypes(cleaned, headers);

    // Fix numeric types
    if (options.fixNumeric !== false) {
      const numericResults = this.fixNumericTypes(
        cleaned,
        typeMap.numeric,
        strictMode
      );
      log.push(...numericResults.log);
    }

    // Fix date types
    if (options.fixDates !== false) {
      const dateResults = this.fixDateTypes(cleaned, typeMap.dates, strictMode);
      log.push(...dateResults.log);
    }

    // Fix phone types
    if (options.fixPhones !== false) {
      const phoneResults = this.fixPhoneTypes(
        cleaned,
        typeMap.phones,
        strictMode
      );
      log.push(...phoneResults.log);
    }

    return { data: cleaned, log };
  }

  /**
   * Infer data types from content
   */
  inferDataTypes(data, headers) {
    const types = {
      numeric: [],
      dates: [],
      phones: [],
      emails: [],
      text: [],
    };

    headers.forEach((header) => {
      const sampleValues = data
        .slice(0, 100)
        .map((row) => row[header])
        .filter((val) => val != null && val !== "");

      if (sampleValues.length === 0) return;

      // Check for numeric
      const numericCount = sampleValues.filter(
        (v) => !isNaN(parseFloat(v)) && isFinite(v)
      ).length;
      const numericRatio = numericCount / sampleValues.length;

      // Check for dates and phones
      const dateCount = sampleValues.filter((v) =>
        this.looksLikeDate(v)
      ).length;
      const phoneCount = sampleValues.filter((v) =>
        this.looksLikePhone(v)
      ).length;

      if (numericRatio > 0.8) {
        types.numeric.push(header);
      } else if (dateCount > sampleValues.length * 0.6) {
        types.dates.push(header);
      } else if (phoneCount > sampleValues.length * 0.6) {
        types.phones.push(header);
      } else {
        types.text.push(header);
      }
    });

    return types;
  }

  /**
   * Check if value looks like a date
   */
  looksLikeDate(value) {
    if (!value || typeof value !== "string") return false;

    const datePatterns = [
      /^\d{1,2}\/\d{1,2}\/\d{4}$/,
      /^\d{1,2}-\d{1,2}-\d{4}$/,
      /^\d{4}\/\d{1,2}\/\d{1,2}$/,
      /^\d{4}-\d{1,2}-\d{1,2}$/,
    ];

    return datePatterns.some((pattern) => pattern.test(value.trim()));
  }

  /**
   * Check if value looks like a phone number
   */
  looksLikePhone(value) {
    if (!value || typeof value !== "string") return false;
    return /[\d\s\-+()]{8,}/.test(value);
  }

  /**
   * Fix numeric field types
   */
  fixNumericTypes(data, numericFields, strictMode) {
    let changeCount = 0;
    const log = [];

    data.forEach((row) => {
      numericFields.forEach((field) => {
        if (row[field] != null && row[field] !== "") {
          const original = row[field];
          const numericValue = parseFloat(original);

          if (!isNaN(numericValue)) {
            row[field] = numericValue;
            if (original !== numericValue) changeCount++;
          } else if (strictMode) {
            row[field] = null; // Remove invalid numeric values in strict mode
            changeCount++;
          }
        }
      });
    });

    if (changeCount > 0) {
      log.push(`Fixed ${changeCount} numeric type issues`);
    }

    return { data, log };
  }

  /**
   * Fix date field types
   */
  fixDateTypes(data, dateFields, strictMode) {
    let changeCount = 0;
    const log = [];

    data.forEach((row) => {
      dateFields.forEach((field) => {
        if (row[field] != null && row[field] !== "") {
          const original = row[field];
          const formatted = this.formatDate(original);

          if (formatted !== original) {
            row[field] = formatted;
            changeCount++;
          } else if (strictMode && !this.looksLikeDate(original)) {
            row[field] = null; // Remove invalid dates in strict mode
            changeCount++;
          }
        }
      });
    });

    if (changeCount > 0) {
      log.push(`Fixed ${changeCount} date format issues`);
    }

    return { data, log };
  }

  /**
   * Fix phone field types
   */
  fixPhoneTypes(data, phoneFields, strictMode) {
    let changeCount = 0;
    const log = [];

    data.forEach((row) => {
      phoneFields.forEach((field) => {
        if (row[field] != null && row[field] !== "") {
          const original = row[field];
          const formatted = this.formatPhoneNumber(original);

          if (formatted !== original) {
            row[field] = formatted;
            changeCount++;
          } else if (strictMode && !this.looksLikePhone(original)) {
            row[field] = null; // Remove invalid phones in strict mode
            changeCount++;
          }
        }
      });
    });

    if (changeCount > 0) {
      log.push(`Fixed ${changeCount} phone format issues`);
    }

    return { data, log };
  }

  /**
   * Perform comprehensive data cleaning with all operations
   */
  async performComprehensiveCleaning(data, options = {}) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid data provided for cleaning");
    }

    const {
      removeMissingValues = true,
      removeDuplicates = true,
      textStandardization = true,
      fixTypos = true,
      formatPhoneNumbers = true,
      standardizeDates = true,
      handleOutliers = false,
      outlierThreshold = 99,
    } = options;

    let currentData = _.cloneDeep(data);
    const allLogs = [];
    const operationSummary = {
      totalRowsProcessed: data.length,
      missingValuesFixed: 0,
      duplicatesRemoved: 0,
      textStandardized: 0,
      typosCorrected: 0,
      phonesFormatted: 0,
      datesStandardized: 0,
      outliersDetected: 0,
    };

    try {
      // 1. Handle missing values
      if (removeMissingValues) {
        const missingResult = this.handleMissingValues(currentData, {
          strategy: "remove",
          threshold: 0.8,
        });
        currentData = missingResult.data;
        operationSummary.missingValuesFixed = data.length - currentData.length;
        allLogs.push(...missingResult.log);
      }

      // 2. Remove duplicates
      if (removeDuplicates) {
        const duplicateResult = this.removeDuplicates(currentData, {
          fuzzyMatch: true,
          threshold: 0.9,
        });
        const beforeLength = currentData.length;
        currentData = duplicateResult.data;
        operationSummary.duplicatesRemoved = beforeLength - currentData.length;
        allLogs.push(...duplicateResult.log);
      }

      // 3. Correct spelling errors
      if (fixTypos) {
        const spellingResult = this.correctSpelling(currentData, {
          correctCars: true,
          correctCities: true,
          correctGender: true,
        });
        currentData = spellingResult.data;
        operationSummary.typosCorrected = spellingResult.log.length;
        allLogs.push(...spellingResult.log);
      }

      // 4. Standardize and format text
      if (textStandardization) {
        const formatResult = this.standardizeAndFormat(currentData, {
          formatNames: true,
          formatGender: true,
          formatCars: true,
          formatCities: true,
        });
        currentData = formatResult.data;
        operationSummary.textStandardized = formatResult.log.length;
        allLogs.push(...formatResult.log);
      }

      // 5. Fix data types
      if (formatPhoneNumbers || standardizeDates) {
        const typeResult = this.fixDataTypes(currentData, {
          fixPhones: formatPhoneNumbers,
          fixDates: standardizeDates,
          fixNumeric: true,
          strictMode: false,
        });
        currentData = typeResult.data;

        // Count specific changes
        typeResult.log.forEach((logEntry) => {
          if (logEntry.includes("phone")) {
            operationSummary.phonesFormatted++;
          }
          if (logEntry.includes("date")) {
            operationSummary.datesStandardized++;
          }
        });

        allLogs.push(...typeResult.log);
      }

      // 6. Handle outliers (detection only, not removal unless specified)
      if (handleOutliers) {
        const outlierInfo = this.detectOutliers(currentData, {
          method: "percentile",
          percentile: outlierThreshold,
        });
        operationSummary.outliersDetected = outlierInfo.count;

        if (outlierInfo.count > 0) {
          allLogs.push(`Detected ${outlierInfo.count} outlier values`);
        }
      }

      // Calculate final quality score
      const initialQuality = this.assessDataQuality(data);
      const finalQuality = this.assessDataQuality(currentData);

      return {
        cleanedData: currentData,
        summary: operationSummary,
        qualityImprovement: {
          before: initialQuality.overallScore,
          after: finalQuality.overallScore,
          improvement: finalQuality.overallScore - initialQuality.overallScore,
        },
        log: allLogs,
        success: true,
      };
    } catch (error) {
      console.error("Error during comprehensive cleaning:", error);
      throw new Error(`Cleaning failed: ${error.message}`);
    }
  }

  /**
   * Generate quality assessment report
   */
  generateQualityReport(beforeData, afterData, title = "Data Quality Report") {
    const beforeScores = this.assessDataQuality(beforeData);
    const afterScores = afterData ? this.assessDataQuality(afterData) : null;

    return {
      title,
      timestamp: new Date().toISOString(),
      beforeQuality: beforeScores,
      afterQuality: afterScores,
      improvement: afterScores
        ? afterScores.overallScore - beforeScores.overallScore
        : 0,
    };
  }

  /**
   * Export report as CSV
   */
  exportReportAsCSV(report) {
    const rows = [
      ["Data Quality Report"],
      ["Generated:", report.timestamp],
      [""],
      ["Before Cleaning:"],
      [
        "Overall Score:",
        `${(report.beforeQuality.overallScore * 100).toFixed(1)}%`,
      ],
      [
        "Completeness:",
        `${(report.beforeQuality.dimensions.completeness * 100).toFixed(1)}%`,
      ],
      [
        "Accuracy:",
        `${(report.beforeQuality.dimensions.accuracy * 100).toFixed(1)}%`,
      ],
      [
        "Consistency:",
        `${(report.beforeQuality.dimensions.consistency * 100).toFixed(1)}%`,
      ],
      [
        "Uniqueness:",
        `${(report.beforeQuality.dimensions.uniqueness * 100).toFixed(1)}%`,
      ],
    ];

    if (report.afterQuality) {
      rows.push(
        [""],
        ["After Cleaning:"],
        [
          "Overall Score:",
          `${(report.afterQuality.overallScore * 100).toFixed(1)}%`,
        ],
        [
          "Completeness:",
          `${(report.afterQuality.dimensions.completeness * 100).toFixed(1)}%`,
        ],
        [
          "Accuracy:",
          `${(report.afterQuality.dimensions.accuracy * 100).toFixed(1)}%`,
        ],
        [
          "Consistency:",
          `${(report.afterQuality.dimensions.consistency * 100).toFixed(1)}%`,
        ],
        [
          "Uniqueness:",
          `${(report.afterQuality.dimensions.uniqueness * 100).toFixed(1)}%`,
        ],
        [""],
        ["Improvement:", `${(report.improvement * 100).toFixed(1)}%`]
      );
    }

    return rows.map((row) => row.join(",")).join("\n");
  }

  /**
   * Export data as CSV
   */
  exportDataAsCSV(data, filename = "formatted_data.csv") {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          })
          .join(",")
      ),
    ];

    return csvRows.join("\n");
  }

  /**
   * Download CSV file
   */
  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Export quality report as CSV file
   */
  exportQualityReportCSV(
    beforeData,
    afterData = null,
    filename = "quality_report.csv"
  ) {
    const report = this.generateQualityReport(beforeData, afterData);
    const csvContent = this.exportReportAsCSV(report);
    this.downloadCSV(csvContent, filename);
  }

  /**
   * Export formatted data as CSV file
   */
  exportFormattedDataCSV(data, filename = "formatted_data.csv") {
    const csvContent = this.exportDataAsCSV(data);
    this.downloadCSV(csvContent, filename);
  }

  /**
   * Get cleaning recommendations based on data analysis
   */
  getCleaningRecommendations(data) {
    const recommendations = [];

    const missingInfo = this.detectMissingValues(data);
    const duplicateInfo = this.detectDuplicates(data);
    const outlierInfo = this.detectOutliers(data);
    const qualityAssessment = this.assessDataQuality(data);

    // Missing values recommendations
    if (missingInfo.total > 0) {
      const missingPercentage =
        (missingInfo.total /
          (data.length * Object.keys(data[0] || {}).length)) *
        100;
      recommendations.push({
        type: "missing_values",
        severity:
          missingPercentage > 20
            ? "high"
            : missingPercentage > 5
            ? "medium"
            : "low",
        message: `${
          missingInfo.total
        } missing values found (${missingPercentage.toFixed(
          1
        )}% of total data)`,
        action:
          "Consider removing rows with excessive missing values or filling with appropriate defaults",
      });
    }

    // Duplicate recommendations
    if (duplicateInfo.count > 0) {
      recommendations.push({
        type: "duplicates",
        severity: duplicateInfo.count > data.length * 0.1 ? "high" : "medium",
        message: `${duplicateInfo.count} duplicate rows detected`,
        action: "Remove duplicate entries to improve data quality",
      });
    }

    // Outlier recommendations
    if (outlierInfo.count > 0) {
      recommendations.push({
        type: "outliers",
        severity: outlierInfo.count > data.length * 0.05 ? "medium" : "low",
        message: `${outlierInfo.count} potential outliers detected`,
        action:
          "Review outlier values for data entry errors or legitimate extreme values",
      });
    }

    // Overall quality recommendations
    if (qualityAssessment.overallScore < 0.7) {
      recommendations.push({
        type: "overall_quality",
        severity: "high",
        message: `Overall data quality score is ${(
          qualityAssessment.overallScore * 100
        ).toFixed(1)}%`,
        action: "Comprehensive data cleaning is recommended before analysis",
      });
    }

    return recommendations;
  }

  /**
   * Calculate comprehensive quality score
   */
  calculateQualityScore(data, weights = DataQualityScorer.DEFAULT_WEIGHTS) {
    if (!data || data.length === 0) {
      return {
        overall: 0,
        dimensions: {
          completeness: 0,
          accuracy: 0,
          consistency: 0,
          uniqueness: 0,
        },
        details: {},
      };
    }

    const headers = Object.keys(data[0] || {});
    const totalFields = data.length * headers.length;

    // 1. Completeness Score
    const missingInfo = this.detectMissingValues(data);
    const completeness = Math.max(0, 1 - missingInfo.total / totalFields);

    // 2. Accuracy Score (based on data type validation)
    let validValues = 0;
    let totalValidatable = 0;

    data.forEach((row) => {
      headers.forEach((header) => {
        const value = row[header];
        if (value != null && value !== "") {
          totalValidatable++;

          // Check email format
          if (header.toLowerCase().includes("email")) {
            if (DataQualityScorer.EMAIL_REGEX.test(value)) validValues++;
          }
          // Check license plate format
          else if (
            header.toLowerCase().includes("license") ||
            header.toLowerCase().includes("plate")
          ) {
            if (
              DataQualityScorer.LICENSE_PLATE_REGEX.current.test(value) ||
              DataQualityScorer.LICENSE_PLATE_REGEX.old.test(value)
            )
              validValues++;
          }
          // Default valid
          else {
            validValues++;
          }
        }
      });
    });

    const accuracy = totalValidatable > 0 ? validValues / totalValidatable : 1;

    // 3. Consistency Score (standardized formats)
    let consistentValues = 0;
    let totalConsistencyChecks = 0;

    headers.forEach((header) => {
      const values = data
        .map((row) => row[header])
        .filter((v) => v != null && v !== "");
      if (values.length === 0) return;

      totalConsistencyChecks += values.length;

      // Check format consistency for categorical fields
      if (header.toLowerCase().includes("gender")) {
        const standardGenders = values.filter((v) =>
          ["Male", "Female"].includes(v)
        );
        consistentValues += standardGenders.length;
      } else if (header.toLowerCase().includes("city")) {
        const standardCities = values.filter(
          (v) =>
            DataQualityScorer.ALGERIAN_CITIES.includes(v) ||
            v === v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
        );
        consistentValues += standardCities.length;
      } else {
        // Default consistency check (proper capitalization for text)
        const properFormat = values.filter((v) => {
          if (typeof v === "string") {
            return (
              v === v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() ||
              v === v.toUpperCase() ||
              v === v.toLowerCase()
            );
          }
          return true;
        });
        consistentValues += properFormat.length;
      }
    });

    const consistency =
      totalConsistencyChecks > 0
        ? consistentValues / totalConsistencyChecks
        : 1;

    // 4. Uniqueness Score
    const duplicateInfo = this.detectDuplicates(data);
    const uniqueness = Math.max(0, 1 - duplicateInfo.count / data.length);

    // Calculate weighted overall score
    const dimensions = { completeness, accuracy, consistency, uniqueness };
    const overall = Object.entries(weights).reduce(
      (score, [dimension, weight]) => {
        return score + dimensions[dimension] * weight;
      },
      0
    );

    return {
      overall,
      dimensions,
      details: {
        totalRows: data.length,
        totalFields: headers.length,
        missingValues: missingInfo.total,
        duplicateRows: duplicateInfo.count,
        validationErrors: totalValidatable - validValues,
      },
    };
  }

  /**
   * Get quality assessment with recommendations
   */
  assessDataQuality(data, weights = DataQualityScorer.DEFAULT_WEIGHTS) {
    const qualityScore = this.calculateQualityScore(data, weights);

    const recommendations = [];

    // Generate recommendations based on scores
    if (qualityScore.dimensions.completeness < 0.8) {
      recommendations.push({
        type: "completeness",
        severity:
          qualityScore.dimensions.completeness < 0.5 ? "high" : "medium",
        message: `${((1 - qualityScore.dimensions.completeness) * 100).toFixed(
          1
        )}% of values are missing. Consider data imputation or removing incomplete records.`,
      });
    }

    if (qualityScore.dimensions.accuracy < 0.9) {
      recommendations.push({
        type: "accuracy",
        severity: qualityScore.dimensions.accuracy < 0.7 ? "high" : "medium",
        message: `${((1 - qualityScore.dimensions.accuracy) * 100).toFixed(
          1
        )}% of validatable fields contain invalid data. Review email and license plate formats.`,
      });
    }

    if (qualityScore.dimensions.consistency < 0.9) {
      recommendations.push({
        type: "consistency",
        severity: qualityScore.dimensions.consistency < 0.7 ? "high" : "medium",
        message: `${((1 - qualityScore.dimensions.consistency) * 100).toFixed(
          1
        )}% of categorical values have inconsistent formatting. Standardize casing and terminology.`,
      });
    }

    if (qualityScore.dimensions.uniqueness < 0.95) {
      recommendations.push({
        type: "uniqueness",
        severity: qualityScore.dimensions.uniqueness < 0.8 ? "high" : "medium",
        message: `${qualityScore.details.duplicateRows} duplicate rows detected. Consider deduplication.`,
      });
    }

    // Overall quality assessment
    let qualityLevel = "poor";
    if (qualityScore.overall >= 0.9) qualityLevel = "excellent";
    else if (qualityScore.overall >= 0.8) qualityLevel = "good";
    else if (qualityScore.overall >= 0.6) qualityLevel = "fair";

    return {
      ...qualityScore,
      overallScore: qualityScore.overall * 100, // Convert to percentage
      qualityLevel,
      recommendations,
      scoreInterpretation: {
        overall: `${(qualityScore.overall * 100).toFixed(1)}%`,
        level: qualityLevel,
        description: this.getQualityDescription(qualityScore.overall),
      },
    };
  }

  /**
   * Get quality description based on score
   */
  getQualityDescription(score) {
    if (score >= 0.9)
      return "Excellent data quality. Ready for analysis and modeling.";
    if (score >= 0.8)
      return "Good data quality. Minor cleaning may improve results.";
    if (score >= 0.6)
      return "Fair data quality. Cleaning recommended before analysis.";
    if (score >= 0.4)
      return "Poor data quality. Significant cleaning required.";
    return "Very poor data quality. Extensive data cleaning and validation needed.";
  }

  /**
   * Compare quality scores between original and cleaned data
   */
  compareQualityScores(
    originalData,
    cleanedData,
    weights = DataQualityScorer.DEFAULT_WEIGHTS
  ) {
    const originalScore = this.calculateQualityScore(originalData, weights);
    const cleanedScore = this.calculateQualityScore(cleanedData, weights);

    const improvement = {
      overall: cleanedScore.overall - originalScore.overall,
      completeness:
        cleanedScore.dimensions.completeness -
        originalScore.dimensions.completeness,
      accuracy:
        cleanedScore.dimensions.accuracy - originalScore.dimensions.accuracy,
      consistency:
        cleanedScore.dimensions.consistency -
        originalScore.dimensions.consistency,
      uniqueness:
        cleanedScore.dimensions.uniqueness -
        originalScore.dimensions.uniqueness,
    };

    return {
      original: originalScore,
      cleaned: cleanedScore,
      improvement,
      percentageImprovement: {
        overall: (improvement.overall * 100).toFixed(1),
        completeness: (improvement.completeness * 100).toFixed(1),
        accuracy: (improvement.accuracy * 100).toFixed(1),
        consistency: (improvement.consistency * 100).toFixed(1),
        uniqueness: (improvement.uniqueness * 100).toFixed(1),
      },
    };
  }
}
