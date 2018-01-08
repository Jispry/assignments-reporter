/**
 * 
 * @param {Object} row 
 * @param {Object} item 
 * @param {Array<{cell: number, key: string}>} mapping 
 */
function writeToRow(row, item, mapping) {
    mapping.forEach((mappingItem) => {
        row.getCell(mappingItem.cell).value = item[mappingItem.key];
    });

    row.commit();
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
            const worksheet = this._workBook.getWorksheet(1);
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
