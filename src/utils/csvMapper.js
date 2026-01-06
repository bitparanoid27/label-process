// cols required by db config file.
// const columnMapperConfigFile = require('../configs/amzn-sterling');

// function to map received orders csv cols to db expected cols

const dbCsvColumnMapper = async (columnMapperConfigFile, parsedData) => {
  const dbMappedColumns = parsedData.map(parsedDataRow => {
    const mappedRow = {};

    for (const [csvHeader, dbHeader] of Object.entries(columnMapperConfigFile.headers)) {
      let value = parsedDataRow[csvHeader];

      if (value !== undefined) {
        if (dbHeader.includes('price') || dbHeader.includes('tax') || dbHeader.includes('amount')) {
          // Replaces anything that isn't a Number, Dot, or Minus sign
          value = value.replace(/[^\d.-]/g, '');
        }
        mappedRow[dbHeader] = value;
      }

      mappedRow.platform_name = columnMapperConfigFile.platformName;
      mappedRow.raw_data = parsedDataRow;
    }
    return mappedRow;
  });
  return dbMappedColumns;
};

module.exports = dbCsvColumnMapper;
