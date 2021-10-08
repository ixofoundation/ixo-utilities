import {IxoProof} from "./index";
import * as Mustache from "mustache";
const {makeWallet, makeClient} = require("@ixo/client-sdk");
const fs = require('fs');
const timer = (ms: any) => new Promise(res => setTimeout(res, ms))

export class ChimpleIxoClient {
    private static instance: ChimpleIxoClient;
    private wallet: any;
    private client: any;
    private walletJSON: any;
    private key = process.env.key;
    private alreadyRegistered: boolean = false;

    private constructor() {
    }

    public static getInstance(): ChimpleIxoClient {
        if (!ChimpleIxoClient.instance) {
            ChimpleIxoClient.instance = new ChimpleIxoClient();
        }

        return ChimpleIxoClient.instance;
    }

    public async initIxoWithDefaultWallet(proofs: IxoProof[]) {
        await this.initWallet();
        await this.initClient();
        let project = await this.readFromFile('./project.json');
        if (!project) {
            project = await this.client.getProject(process.env.PROJECT_DID);
            await this.writeToFile('./project.json', project);
        }

        let template = await this.readFromFile('./template.json');
        if (!template) {
            template = await this.client.getTemplate(process.env.TEMPLATE_DID);
            await this.writeToFile('./template.json', template);
        }

        const claimTemplate = fs.readFileSync(process.env.CLAIM_SUBMISSION_TEMPLATE, {encoding:'utf8', flag:'r'});
        for await (const p of proofs) {
            await timer(1000);
            console.log(console.log(`Submit claim -> for id -> ${p.id}`))
            await this.submitClaim(project, claimTemplate, template, p.id, p.score,
            p.period, p.assessments, p.date);
        }
    }

    private async initClient() {
        this.client = await makeClient(this.wallet);
        console.log(this.client);
        await this.registerClient();
    }

    private async submitClaim(project: any, claimTemplate: string, template: any, id: string, score: string, period: string, assessments: string, date: string) {
        try {
            const renderedTemplate = Mustache.render(claimTemplate, {
                id,
                date,
                period,
                score,
                assessments
            })
            const parsed = JSON.parse(renderedTemplate);
            const result = await this.client.createClaim(project,
                template, parsed);
            console.log("Claim Successfully Submitted" + JSON.stringify(result));
            return true;
        } catch (e) {
            console.error(e);
        }
    }

    private async readFromFile(fileName: string) {
        try {
            const stringData = fs.readFileSync(fileName, {encoding: 'utf8', flag: 'r'}) || '{}';
            return JSON.parse(stringData);
        } catch (e) {
            console.log(e)
            return null;
        }
    }

    private async writeToFile(fileName: String, data: any) {
        fs.writeFileSync(fileName, JSON.stringify(data));
    }

    private async initWallet() {
        try {
            const data = await this.readFromFile('./wallet.json');

            if (data === null) {
                await this.createWallet();
            } else {
                this.wallet = await makeWallet(data);
            }
        } catch (e) {
            await this.createWallet();
        }
    }

    private async createWallet() {
        this.wallet = await makeWallet(this.key);
        await this.writeToFile('./wallet.json', this.wallet.toJSON());
        this.walletJSON = this.wallet.toJSON();
    }

    public async registerClient(verifyKey?: string) {
        try {
            if (!this.alreadyRegistered) {
                !!verifyKey ? await this.client.register(verifyKey) : await this.client.register();
            }
        } catch (e) {
            console.error(e);
        } finally {
            this.alreadyRegistered = true;
        }
    }
}
