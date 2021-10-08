const csv = require('csvtojson')
const excelToJson = require('convert-excel-to-json');

export class ToJson {
    csvFilePath: string;
    constructor(csvFilePath: string) {
        this.csvFilePath = csvFilePath;
    }

    async convertExcelToJSON() {
        const json = excelToJson({
            sourceFile: this.csvFilePath
        })
        return json;
    }

    async convertToJSON() {
        const json = await csv().fromFile(this.csvFilePath)
        return json;
    }
}
