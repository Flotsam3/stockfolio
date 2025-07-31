import {Schema, model, models} from "mongoose";

const profitabilitySchema = new Schema({
    annual: [],
    quarterly: []
})

const efficiencyAndLeverageSchema = new Schema({
    debtToEquityAnnual: [],
    debtToEquityQuarterly: [],
    ebitdaAnnual: [],
    ebitdaQuarterly: []
})

const liquiditySchema = new Schema({
    cashFlowAnnual: [],
    cashFlowQuarterly: [],
    currentRatioAnnual: [],
    currentRatioQuarterly: []
})

const valuationSchema = new Schema({
    epsAnnual: [],
    epsQuarterly: [],
    peRatioAnnual: [],
    peRatioQuarterly: []
})

const companySchema = new Schema({
    name:{
        type:String,
        required:true
    },
    profitability: profitabilitySchema,
    efficiencyAndLeverage:  efficiencyAndLeverageSchema,
    liquidity: liquiditySchema, 
    valuation: valuationSchema
 }, {timestamps: true});

const CompanyModel = models.Company || model("Company", companySchema);

export default CompanyModel;
