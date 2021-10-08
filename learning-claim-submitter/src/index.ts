import {ChimpleIxoClient} from "./chimple-ixo-client";
import {ToJson} from "./to-json";
require('dotenv').config();

export interface IxoProof {
    id: string;
    score: string;
    date: string;
    assessments: string;
    period: string;
}
export const IxoClient: ChimpleIxoClient = ChimpleIxoClient.getInstance();

(async () => {
    const alphaTestResults = process.env.ALPHA_TEST_RESULT_EXCEL;
    const json = await new ToJson(`./${alphaTestResults}`).convertExcelToJSON();
    const inputs = json["Sheet1"];
    const claims: IxoProof[] = inputs.map((i: any) =>  {
        return <IxoProof> {
            id: i["A"],
            score: i["B"],
            assessments: i["C"],
            date: "15-Sep-2021",
            period: "1"
        }
    })
    await IxoClient.initIxoWithDefaultWallet([claims[0]]);
})();
