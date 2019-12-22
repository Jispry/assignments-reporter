/**
 *
 * @param {Object} row
 * @param {Object} item
 * @param {Array<{cell: number, key: string}>} mapping
 */
function writeToRow(row, item, mapping) {
    mapping.forEach((mappingItem) => {
        row.getCell(mappingItem.cell).value = formatValue(item[mappingItem.key]);
    });

    row.commit();
}

/**
 *
 * @param {any} value
 * @returns {any}
 */
function formatValue(value) {
    // todo FIX
    if (value instanceof Date) {
        const stringSplit = value.toLocaleString('en-GB', { timeZone: 'Europe/Vienna', hour12: false })
            .replace(',', '')
            .split('/');
        // hack
        const swap = stringSplit[0];
        stringSplit[0] = stringSplit[1];
        stringSplit[1] = swap;
        return stringSplit.join('/');
    } else if (typeof value === 'string' || value instanceof String){
        return value.replace(/\n/g, ', ');
    } else {
        return value;
    }
}

module.exports = class ExcelOuputWritter {
    /**
     *
     * @param {exceljs} exceljs
     * @param {{}} config
     */
    constructor(workBook, config) {
        this._workBook = workBook;
        this._config = config;
    }

    /**
     *
     * @param {String} templateFileName
     * @param {Array<Object>} data
     */
    writeToExcel(templateFileName, data, newFileName) {
        this._workBook.xlsx.readFile(templateFileName).then(() => {
            const worksheet = this._workBook.getWorksheet("Sheet");
            let rowIndex = this._config.startRow;
            data.forEach((item) => {
                const row = worksheet.getRow(rowIndex);
                writeToRow(row, item, this._config.mapping);
                rowIndex++;
            });

            return this._workBook.xlsx.writeFile(newFileName);
        });
    }
};
