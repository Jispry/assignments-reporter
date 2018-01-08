const ExcelOutputWritter = require('./excel-output-writter.js');
const sinon = require('sinon');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ExcelOutputWritter Tests', () => {

    let fakeWorkSheet, fakeWorkbook, fakeRow, configObj;

    beforeEach(() => {
        fakeWorkSheet = {
            getRow: (number) => {
                return fakeRow;
            }
        };

        fakeWorkbook = {
            xlsx: {
                readFile: function (fileName) {
                    return {
                        // fake promise object
                        then: function (callBack) {
                            callBack();
                        }
                    };
                },
                writeFile: (fileName) => {

                }
            },
            getWorksheet: () => {
                return fakeWorkSheet;
            },
        };

        fakeRow = {
            getCell: (number) => {
                return {
                    value: number
                };
            },
            commit: () => { }
        };

        configObj = {
            startRow: 4,
            mapping: [
                { cell: 1, key: 'key1' },
                { cell: 2, key: 'key2' },
            ]
        };
    });

    it('should initialize', () => {
        let sut = new ExcelOutputWritter(undefined, undefined);

        expect(sut).to.be.an.instanceof(ExcelOutputWritter);
    });

    it('should call readFile with "template.xlsx"', () => {
        const workbookSpy = sinon.spy(fakeWorkbook.xlsx, "readFile");
        const expectedTemplateFileName = 'template.xlsx';

        let sut = new ExcelOutputWritter(fakeWorkbook, configObj);

        sut.writeToExcel(expectedTemplateFileName, []);

        expect(workbookSpy.calledOnce).to.equal(true);
        expect(workbookSpy.getCall(0).args[0]).to.deep.equal(expectedTemplateFileName);
    });

    it('should get worksheet 1', () => {
        const workbookSpy = sinon.spy(fakeWorkbook, "getWorksheet");

        let sut = new ExcelOutputWritter(fakeWorkbook, configObj);

        sut.writeToExcel("template", []);

        expect(workbookSpy.getCall(0).args[0]).to.deep.equal(1);
    });

    it('should call getRow with value from configFile', () => {
        const workSheetSpy = sinon.spy(fakeWorkSheet, "getRow");

        let sut = new ExcelOutputWritter(fakeWorkbook, configObj);

        sut.writeToExcel("template", [{}]);

        expect(workSheetSpy.getCall(0).args[0]).to.deep.equal(configObj.startRow);
    });

    it('should write data according to configMapping', () => {
        const rowSpy = sinon.spy(fakeRow, "getCell");
        const data = [
            { key1: 'key1Val_1', key2: 'key2Val_1' },
            { key1: 'key1Val_2', key2: 'key2Val_2' }
        ];

        let sut = new ExcelOutputWritter(fakeWorkbook, configObj);

        sut.writeToExcel("template", data);

        expect(rowSpy.getCall(0).args[0]).to.deep.equal(configObj.mapping[0].cell);
        expect(rowSpy.getCall(1).args[0]).to.deep.equal(configObj.mapping[1].cell);
        expect(rowSpy.getCall(2).args[0]).to.deep.equal(configObj.mapping[0].cell);
        expect(rowSpy.getCall(3).args[0]).to.deep.equal(configObj.mapping[1].cell);
    });
});
