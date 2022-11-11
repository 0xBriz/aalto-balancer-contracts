export const ashareBusdGaugeAddress = "0x1dA7F4b2B9B644f307A313e304E1B061Eb605965";
export const amesBusdGauge = "0xDA9D57cAabBe48301d71b7eEaf546B4A206118d3";
export const wAaltoBusd = "0xD105D7e65922e1ac725b799481c5c113cFfA2f0D";
export const wbnbBusdGauge = "0x34EA84d3565824573073b1A63057baf57f842F02";
export const triBlueChipsGuage = "0x00687547D75A2d1378984bE922e1450CcC89211E";
export const stablesGauge = "0xaCC31d29022C8Eb2683597bF4c07De228Ed9EA07";
export const usdcBnb = "0x9721189e8ac5DD0011EaB1Ee7c25B24624b75801";
export const technicolorGauge = "0xc328f8308B915D7DCD7D65d9c0e0a225abb3A95f";
export const blueMaxiGauge = "0x6d97daB82286D61225265232ea07FD50828F5F18";
export const veGauge = "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0";

export const GAUGE_ADDRESSES = [
  veGauge,
  stablesGauge,
  ashareBusdGaugeAddress,
  amesBusdGauge,
  wAaltoBusd,
  wbnbBusdGauge,
  triBlueChipsGuage,
  usdcBnb,
  technicolorGauge,
  blueMaxiGauge,
];

export const OPERATOR = "0x891eFc56f5CD6580b2fEA416adC960F2A6156494";

export enum GaugeType {
  LiquidityMiningCommittee,
  veBAL,
  VotingV2,
  veBALV2,
}

export const CORE_POOLS = [
  {
    name: "AEQ-BNB",
    id: "0x7a09ddf458fda6e324a97d1a8e4304856fb3e702000200000000000000000000",
    address: "0x7a09ddF458FdA6e324A97D1a8E4304856fb3e702",
    gauge: "0x177cA62c024Aaa0c3c65F7c8BA283b824556DAB0",
    startWeight: 1,
  },
  {
    name: "BUSD-USDC-USDT",
    id: "0xb3a07a9cef918b2ccec4bc85c6f2a7975c5e83f9000000000000000000000001",
    address: "0xb3A07a9CeF918b2ccEC4bC85C6F2A7975c5E83f9",
    gauge: "0xaCC31d29022C8Eb2683597bF4c07De228Ed9EA07",
    startWeight: 1,
  },
  {
    name: "AMES-BUSD",
    id: "0x9aa867870d5775a3c155325db0cb0b116bbf4b6a000200000000000000000002",
    address: "0x9AA867870d5775A3C155325DB0cb0B116bbF4b6a",
    gauge: "0xDA9D57cAabBe48301d71b7eEaf546B4A206118d3",
  },
  {
    name: "BUSD-ASHARE",
    id: "0x74154c70f113c2b603aa49899371d05eeedd1e8c000200000000000000000003",
    address: "0x74154c70F113C2B603aa49899371D05eeEDd1E8c",
    gauge: "0x1dA7F4b2B9B644f307A313e304E1B061Eb605965",
  },
  {
    name: "WBNB-BUSD",
    id: "0x5ba2bc395b511ecf3f7c7f4f6c5de3c5586239ae000200000000000000000004",
    address: "0x5bA2bc395b511ECf3f7c7F4f6C5dE3c5586239aE",
    gauge: "0x34EA84d3565824573073b1A63057baf57f842F02",
  },
  {
    name: "WETH-BTC-BNB",
    id: "0x0256c70b89b3c0ed888b7b7d7767a701b2a67bea000100000000000000000005",
    address: "0x0256c70b89b3c0ed888b7b7d7767a701b2a67bea",
    gauge: "0x00687547D75A2d1378984bE922e1450CcC89211E",
  },
  {
    name: "wAALTO-BUSD",
    id: "0xe53896c872b39fa3254262d18157447504b211de00020000000000000000000d",
    address: "0xe53896c872b39fa3254262d18157447504b211de",
    gauge: "0xD105D7e65922e1ac725b799481c5c113cFfA2f0D",
  },
  {
    name: "USDC-BNB",
    id: "0x276ab884805581b8e537c11e4906d545b295052f00020000000000000000000e",
    address: "0x276ab884805581B8e537c11e4906d545b295052F",
    gauge: "0x9721189e8ac5DD0011EaB1Ee7c25B24624b75801",
  },
  {
    name: "Technicolor",
    id: "0x835ff599b9388e4f733c165a15a93e736ebf91d3000100000000000000000017",
    address: "0x835ff599b9388e4f733C165a15a93e736ebf91D3",
    gauge: "0xc328f8308B915D7DCD7D65d9c0e0a225abb3A95f",
  },
  {
    name: "Blue Chip Maximalist",
    id: "0xe263e513395ee7d9b0228ad22824f1a860ff85cc000100000000000000000020",
    address: "0xe263e513395ee7d9b0228ad22824f1a860ff85cc",
    gauge: "0x6d97daB82286D61225265232ea07FD50828F5F18",
  },
];
