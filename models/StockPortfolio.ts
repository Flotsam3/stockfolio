import {Schema, model, models} from "mongoose";
import { unique } from "next/dist/build/utils";

const watchListSchema = new Schema({
   name: {
      type: String,
      required: [true, "A stock name is required!"]
   },
   ticker: {
      type: String,
      required: [true, "A ticker code is required!"],
      // removed unique constraint to avoid global unique index on embedded field
   },
   isin: {
      type: String
   },
   country: {
      type: String,
      required: [true, "A country is required!"]
   },
   rate: {
      type: Number,
      required: [true, "A stock rate is required!"]
   },
   dilutedEps: {
      type: Number,
      required: [true, "A value for diluted EPS (ttm) is required!"]
   },
   growthForecast: {
      type: Number,
      required: [true, "A growth forecast for the next 5 years is required!"]
   },
   peRatio: {
      type: String,
      required: [true, "A PE Ratio is required!"]
   },
   peRatioAverage: Number,
   info: {
      type: String,
      default: ""
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

// Ensure portfolio names are unique per user
stockSchema.index({ userId: 1, name: 1 }, { unique: true });

const StockPortfolio = models.StockPortfolio || model("StockPortfolio", stockSchema);

export default StockPortfolio;
