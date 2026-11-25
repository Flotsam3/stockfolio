import {Schema, model, models} from "mongoose";

const exchangeRateSchema = new Schema({
   usdPerUnit: { type: Number, required: true },
   date: { type: String, required: true },
   source: { type: String, enum: ["ECB"], required: true },
}, { _id: false });

const amountDetails = {
   amount: { type: Number, required: true },
   currency: String,
   asOf: String,
   source: { type: String, enum: ["stockanalysis", "manual"], required: true },
   fx: exchangeRateSchema,
};
const amountDetailsSchema = new Schema(amountDetails, { _id: false });
const amountInUsdSchema = new Schema({ ...amountDetails, usd: Number }, { _id: false });
const refreshIssueSchema = new Schema({
   code: { type: String, required: true },
   message: { type: String, required: true },
}, { _id: false });

const watchListSchema = new Schema({
   name: {
      type: String,
      required: [true, "A stock name is required!"]
   },
   ticker: {
      type: String,
      required: [true, "A ticker code is required!"],
   },
   isin: {
      type: String
   },
   country: {
      type: String,
      required: [true, "A country is required!"]
   },
   rate: Number,
   quoteOriginal: amountDetailsSchema,
   dilutedEps: Number,
   epsOriginal: amountDetailsSchema,
   growthForecast: Number,
   growthForecastSource: { type: String, enum: ["manual", "finviz", "stockanalysis"] },
   peRatio: {
      type: String,
      default: "",
   },
   peRatioAverage: Number,
   info: {
      type: String,
      default: ""
   },
   owned: {
      type: Boolean,
      default: false
   },
   targetPrice: {
      type: Number,
      default: 0
   },
   analystTarget: amountInUsdSchema,
   upside: Number,
   annualDividend: amountInUsdSchema,
   dividendYield: Number,
   lastPaidDividend: amountInUsdSchema,
   refreshIssues: { type: [refreshIssueSchema], default: undefined },
   lastDataRefresh: {
      type: Date
   }
}, {timestamps:true});
  

const stockSchema = new Schema({
   name: {
      type: String,
      required: true
   },
   active: {
      type: Boolean,
      default: false
   },
   watchList: { type: [watchListSchema], default: [] },
   anualTargetReturn: {
      type: Number,
      default: 12
   },
   userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
   }
}, {timestamps:true});

stockSchema.index({ userId: 1, name: 1 }, { unique: true });

const StockPortfolio = models.StockPortfolio || model("StockPortfolio", stockSchema);

export default StockPortfolio;
