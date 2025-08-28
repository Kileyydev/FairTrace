export interface Farm {
  name: string;
  location: string; // area name or coordinates
  cropType: string;
  size: string;
  proofImage?: File;
}

export interface Farmer {
  fullName: string;
  email: string;
  phone: string;
  idNumber: string;
  walletAddress?: string;
}
