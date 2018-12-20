const Excel = require('exceljs');

const AssignmentsRepository = require('./assignments-repository.js');
const ExcelOutputWritter = require('./excel-output-writter.js');
const dateUtils = require('./dateUtils.js');

/*const excelWritterConfig = {
    startRow: 4,
    mapping: [
      { cell: 1, key: 'name' },
      { cell: 2, key: 'description' },
      { cell: 3, key: 'from' },
      { cell: 4, key: 'to' },
    ]
};*/
const excelWritterConfig = {
    startRow: 10,
    mapping: [
      { cell: 5, key: 'name' },
      { cell: 6, key: 'description' },
      { cell: 2, key: 'from' },
      { cell: 3, key: 'to' },
    ]
};

const templateExcelFile = 'vykaz_Aardwark_template.xlsx';

/**
 * @return {ExcelOutputWritter}
 */
function createExcelWritter() {
    let workbook = new Excel.Workbook();
    return new ExcelOutputWritter(workbook, excelWritterConfig);
}

module.exports = class AssignmentsCommands {
    /**
     * 
     * @param {AssignmentsRepository} assignmentsRepository 
     */
    constructor(assignmentsRepository) {
        this._repository = assignmentsRepository;
    }

    /**
     * 
     * @param {Object} excelWritterConfig 
     */
    writeLastMonthAssignmentsToExcel() {
        this._repository.getLastMonthAssignments().then(function (assignments) {
            createExcelWritter().writeToExcel(templateExcelFile, assignments, 'lastMonthAssignments.xlsx');
        });
    }

    /**
     * 
     * @param {String} from 
     * @param {String} to 
     */
    writeAssignmentsForPeriod(from, to) {
        this._repository.getAssignementsForPeriod(from, to).then(function (assignments) {
            createExcelWritter().writeToExcel(templateExcelFile, assignments, 'assignemnts_' + from + '-'+ to + '.xlsx');
        });
    }

    /**
     * 
     * @param {Function} filter
     * @param {String} from 
     * @param {String} to 
     */
    writeAssignmentsForPeriodFiltered(filterFcn, from, to) {
        this._repository.getAssignementsForPeriod(from, to).then(function (assignments) {
            createExcelWritter().writeToExcel(templateExcelFile, assignments.filter(filterFcn), 'assignemnts_filtered_' + from + '-'+ to + '.xlsx');
        });
    }
};
