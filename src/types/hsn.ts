export interface HSNAlternative {
  hsn: string;
  description: string;
  gst_rate: number;
}

export interface HSNResult {
  hsn: string;
  description: string;
  gst_rate: number;
  cgst: number;
  sgst: number;
  igst: number;
  itc_available: boolean;
  notes: string;
  alternatives: HSNAlternative[];
}
