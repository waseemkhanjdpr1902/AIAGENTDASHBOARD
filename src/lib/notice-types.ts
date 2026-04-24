export interface NoticeTypeInfo {
  code: string;
  fullName: string;
  hindiName: string;
  typicalDeadline: number; // days to respond
  severity: "low" | "medium" | "high" | "critical";
  commonReason: string;
  firstStep: string;
}

export const NOTICE_REGISTRY: Record<string, NoticeTypeInfo> = {
  "ASMT-10": {
    code: "ASMT-10",
    fullName: "Scrutiny notice for mismatch in returns",
    hindiName: "Returns mein mismatch ka notice",
    typicalDeadline: 30,
    severity: "medium",
    commonReason: "Returns processing mein koi fark mila hai",
    firstStep: "Apni purchase aur sales records check karein"
  },
  "DRC-01": {
    code: "DRC-01",
    fullName: "Show Cause Notice for Tax Demand",
    hindiName: "Tax demand ke liye SCN notice",
    typicalDeadline: 30,
    severity: "high",
    commonReason: "Tax payment ya ITC claim mein badi gadbad",
    firstStep: "Turant kisi Tax professional se milein"
  },
  "DRC-01A": {
    code: "DRC-01A",
    fullName: "Pre Show Cause Notice",
    hindiName: "Formal notice se pehle tax bharne ka mauka",
    typicalDeadline: 15,
    severity: "medium",
    commonReason: "Bina fine ke tax bharne ka last mauka",
    firstStep: "Demand amount verify karein aur bharein"
  },
  "DRC-07": {
    code: "DRC-07",
    fullName: "Summary of Demand - Final Tax Liability",
    hindiName: "Final tax liability ka poora hisaab",
    typicalDeadline: 30,
    severity: "critical",
    commonReason: "Adjudication process khatam ho gaya hai",
    firstStep: "Tax jama karein ya higher authority mein appeal karein"
  },
  "DRC-03": {
    code: "DRC-03",
    fullName: "Voluntary Tax Payment Acknowledgement",
    hindiName: "Tax payment ki pauti (receipt)",
    typicalDeadline: 0,
    severity: "low",
    commonReason: "Swayam bhara gaya tax",
    firstStep: "Document ko record ke liye save karein"
  },
  "REG-03": {
    code: "REG-03",
    fullName: "Notice for Clarification on Registration",
    hindiName: "GST registration ke liye poochtach",
    typicalDeadline: 7,
    severity: "low",
    commonReason: "Documents adhure ya galat hain",
    firstStep: "Maange gaye documents scan karke upload karein"
  },
  "REG-17": {
    code: "REG-17",
    fullName: "Show Cause Notice for Cancellation of Registration",
    hindiName: "GST registration band hone ka notice",
    typicalDeadline: 7,
    severity: "critical",
    commonReason: "Returns file nahi kiye ya niyam ulat gaye",
    firstStep: "7 din ke andar jawab dein varna GST band ho jayega"
  },
  "REG-31": {
    code: "REG-31",
    fullName: "Suspension of GST Registration",
    hindiName: "GST registration suspand hone ki suchna",
    typicalDeadline: 30,
    severity: "critical",
    commonReason: "GSTR-1 aur 3B mein bhari gap mili hai",
    firstStep: "Turant compliance gap theek karein"
  },
  "CMP-05": {
    code: "CMP-05",
    fullName: "Show Cause Notice for Composition Scheme Violation",
    hindiName: "Composition scheme ke niyam lagne par notice",
    typicalDeadline: 15,
    severity: "high",
    commonReason: "Turnover limit ya galat scheme selection",
    firstStep: "Scheme eligibility dobara check karein"
  },
  "GSTR-Notice": {
    code: "GSTR-Notice",
    fullName: "Notice for Non-filling of Returns",
    hindiName: "GSTR Return file na karne ka notice",
    typicalDeadline: 15,
    severity: "medium",
    commonReason: "Ek ya zyada mahine ka return pending hai",
    firstStep: "Pending returns late fee ke saath turant bharein"
  }
};
