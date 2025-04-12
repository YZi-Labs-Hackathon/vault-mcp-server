export enum VaultStatus {
    ACTIVE = "ACTIVE",
    PAUSE = "PAUSE",
    CLOSE = "drift"
}

export enum Protocol {
    VENUS = "venus",
    APEX = "apex",
    DRIFT = "drift",
    PANCAKE = "pancake"
}

export enum ActivityType {
    STAKING = "STAKING",
    UNSTAKING = "UNSTAKING",
    BORROW = "BORROW",
    REPAY = "REPAY",
    TRADING = "TRADING",
    SWAP = "SWAP",
    BUY = "BUY",
    SELL = "SELL"
}

export enum ActivityStatus {
    //PENDING, PROCESSING, COMPLETED, FAILED, OPEN, FILLED, CANCELED, EXPIRED, UNTRIGGERED, SUCCESS, SUCCESS_L2_APPROVED
    SUCCESS = "SUCCESS",
    SUCCESS_L2_APPROVED = "SUCCESS_L2_APPROVED",
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    OPEN = "OPEN",
    FILLED = "FILLED",
    CANCELED = "CANCELED",
    EXPIRED = "EXPIRED",
    UNTRIGGERED = "UNTRIGGERED"
}

interface Profile {
    id: string;
    name: string;
    address: string;
    chainType: string;
    role: string;
}

export interface Fee {
    performanceFee: number;
    recipientAddress: string;
    exitFee?: number;
    exitFeeLocate?: any;
}

export interface WithdrawTerm {
    lockUpPeriod: number;
    delay: number;
    isMultiSig?: boolean;
}

export interface DepositRule {
    min: number;
    max: number;
    LimitWallets?: number;
}

export class PartnrClient {
    private headers: { Authorization: string; "Content-Type": string };
    private baseUrl: string = "";
    private userAddress: string = "";

    private profile: Profile = {
        id: "",
        name: "",
        address: "",
        chainType: "EVM",
        role: "USER"
    };

    private accessToken: string = "";
    public networkType: string = "EVM";

    constructor() {
        this.headers = {
            Authorization: "",
            "Content-Type": "application/json"
        }
    }

    async connect(accessToken: string, userAddress: string, baseUrl: string) {
        try {
            this.accessToken = accessToken;
            this.headers.Authorization = `Bearer ${accessToken}`;
            this.userAddress = userAddress;
            this.baseUrl = baseUrl;
            return true;
        } catch (error) {
            console.error("connect error", error);
            return false;
        }
    }

    async listChains(): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/api/chain`,
            { headers: this.headers },
        );
        return response.json();
    }

    async listProtocols(): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/api/protocol`,
            { headers: this.headers },
        );
        return response.json();
    }

    async listTokens(chainId: string): Promise<any> {
        const params = new URLSearchParams({
            chainId: chainId,
        });

        const response = await fetch(
            `${this.baseUrl}/api/token?${params}`,
            { headers: this.headers },
        );
        return response.json();
    }
}