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
      unique: true
   },
   isin: {
      type: String,
      unique: true
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
   watchList:[watchListSchema],
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

const StockPortfolio = models.StockPortfolio || model("StockPortfolio", stockSchema);

export default StockPortfolio;
