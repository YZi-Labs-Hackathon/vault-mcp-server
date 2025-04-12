
import { 
  ActivityType, 
  Protocol, 
  ActivityStatus,
  VaultStatus 
} from "./PartnrClient";

export interface InitArgs {
  accessToken: string;
  userAddress: string;
  baseUrl: string;
}

export interface ListTokenArgs {
  id?: string;
  name?: string;
  symbol?: string;
  address?: string;
  chainId?: string;
  protocol?: string;
  status?: number;
  assetId?: string;
}