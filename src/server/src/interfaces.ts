
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

export interface SwapPancakeArgs {
  vaultId: string;
  fromToken: string;
  toToken: string;
  amount: number;
}

export interface DepositArgs {
  vaultId: string;
  amount: number;
}
export interface WithdrawArgs {
  vaultId: string;
  amount: number;
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

export interface ListVaultActivitiesArgs {
  vaultId: string;
  status?: ActivityStatus;
  type?: ActivityType;
  protocol?: Protocol;
  limit?: number;
  page?: number;
}

export interface ListOpenPositionsArgs {
  vaultId: string;
  protocol?: Protocol;
  limit?: number;
  page?: number;
}
export interface ListVaultArgs {
  status: VaultStatus;
}
export interface ListDepositorArgs {
  vaultId: string;
  limit?: number;
  page?: number;
}
export interface VaultDetailArgs {
  vaultId: string;
}
export interface ListTransactionArgs {
  vaultId: string;
  status?: string;
  type?: string;
  limit?: number;
  page?: number;
}

export interface VaultUpdateArgs {
  vaultId: string;
  logo?: string;
  description?: string;
  withdrawLockUpPeriod?: number;
  withdrawDelay?: number;
  performanceFee?: number;
  feeRecipientAddress?: string;
  protocolIds?: string[];
  depositMin?: number;
  depositMax?: number;
}

export interface CreateVaultArgs {
  name: string;
  symbol?: string;
  tokenId?: string;
  initDeposit?: number;

  // Deposit Rule
  depositMin?: number;
  depositMax?: number;
  //limitWallets?: number;

  // Fee
  // performanceFee?: number;
  // feeRecipientAddress?: string;
  // exitFee?: number;
  // exitFeeLocate?: any;

  // Withdraw Term
  // withdrawLockUpPeriod?: number; // Withdraw lock after deposit, by second
  // withdrawDelay?: number; // Withdraw delay by second
  // isMultiSig?: boolean;

  // protocolIds: string[];
  defaultProtocolId?: string;

  // aiAgent?: any;
  logo?: string;
  description?: string;
}