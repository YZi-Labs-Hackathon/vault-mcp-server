import { ethers, isError } from "ethers";

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


interface WithdrawData {
    withdrawId: string;
    receiverAddress: string;
    amount: string;
    vaultTvl: string;
    vaultFee: string;
    creatorFee: string;
    signature: string;
    deadline: string;
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

    async listVaultActivities(vaultId: string, query): Promise<any> {
        const params = new URLSearchParams(query);
        const response = await fetch(
            `${this.baseUrl}/api/vault/activities/${vaultId}?${params}`,
            { headers: this.headers },
        );
        return response.json();
    }
    async listVaultDepositors(vaultId: string, query): Promise<any> {
        const params = new URLSearchParams(query);
        const response = await fetch(
            `${this.baseUrl}/api/vault/depositor/${vaultId}?${params}`,
            { headers: this.headers },
        );
        const result = await response.json();
        var mcpResponse: any[] = [];
        if (result.statusCode == 200 && result.data.items.length > 0) {
            const tokenId = result.data.items[0].vault.tokenId;
            const tokenDetail = await this.getTokenDetail(tokenId);
            result.data.items.forEach((item) => {
                console.error(item);
                mcpResponse.push({
                    id: item.id,
                    userAddress: item.user.address,
                    userPnL: item.allTimePnl,
                    age: item.holdDay,
                    amount: (BigInt(item.amount) / (10n ** BigInt(tokenDetail.data.decimals))).toString(),
                    tokenName: tokenDetail.data.name,
                    tokenSymbol: tokenDetail.data.symbol
                });
            });
        }
        console.error(mcpResponse);
        return mcpResponse;
    }

    async listChains(): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/api/chain`,
            { headers: this.headers },
        );
        return response.json();
    }

    async listCreatorVaults(status: VaultStatus) {
        const profile = await this.getProfileByAccessToken();
        this.profile = profile.detail;

        const params = new URLSearchParams({
            creatorId: this.profile.id,
            filterStatus: status,
        });
        const response = await fetch(
            `${this.baseUrl}/api/creator/vault?${params}`,
            { headers: this.headers },
        );

        var result = await response.json();
        if (result.statusCode == 401 || result.errorCode == 401) {
            return result;
        }

        var mcpResponse: any[] = [];
        if (result.statusCode == 200 && result.data.items.length > 0) {
            result.data.items.forEach((item) => {
                mcpResponse.push({
                    id: item.id,
                    name: item.name,
                    symbol: item.symbol,
                    logo: item.logo,
                    description: item.description,
                    tvl: item.tvl,
                    age: item.age,
                    apr: item.apr,
                    allTimePnl: item.allTimePnl,
                    yourDeposit: item.yourDeposit,
                    yourPnl: item.yourPnl
                });
            });
        }
        return mcpResponse;
    }

    async listVaults(status: string) {
        const params = new URLSearchParams({
            filterStatus: status,
        });
        const response = await fetch(
            `${this.baseUrl}/api/vault/list?${params}`,
            { headers: this.headers },
        );

        var result = await response.json();
        if (result.statusCode == 401 || result.errorCode == 401) {
            return result;
        }
        var mcpResponse: any[] = [];
        if (result.statusCode == 200 && result.data.items.length > 0) {
            result.data.items.forEach((item) => {
                mcpResponse.push({
                    id: item.id,
                    name: item.name,
                    symbol: item.symbol,
                    logo: item.logo,
                    description: item.description,
                    tvl: item.tvl,
                    age: item.age,
                    apr: item.apr,
                    allTimePnl: item.allTimePnl,
                    yourDeposit: item.yourDeposit,
                    yourPnl: item.yourPnl
                });
            });
        }
        return mcpResponse;
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

    async createVault(
        name: string,
        logo: string,
        description: string,
        symbol: string,
        tokenId: string,
        protocolIds: string[],
        defaultProtocolId: string,
        depositRule: DepositRule,
        fee: Fee,
        withdrawTerm: WithdrawTerm,
        amountDeposit: bigint,
    ): Promise<any> {
        // Validate rules
        if (depositRule.min < 0) {
            return {
                isError: true,
                message: "minimum desposit can not lower than 0"
            }
        }
        if (depositRule.max > 0 && depositRule.min > depositRule.max) {
            return {
                isError: true,
                message: "maximum desposit must greater than minimum deposit"
            }
        }
        // Validate name
        const checkNameResponse = await fetch(`${this.baseUrl}/api/creator/vault/check-name/${name}`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({}),
        });
        const checkName = await checkNameResponse.json();
        if (checkName.statusCode == 200 || checkName.statusCode == 201) {
            if (checkName.data.isExist) {
                return {
                    isError: true,
                    message: "Vault name already exists, please select other name and try again!"
                };
            }
        }

        // Validate init deposit amount enough
        const tokenDetail = await this.getTokenDetail(tokenId);
        if(tokenDetail.statusCode != 200) {
            return {
                isError: true,
                message: `Get token detail error: ${tokenDetail.message}`
            };
        }
        const token = tokenDetail.data;
        const chain = tokenDetail.data.chain;

        console.error({ token, chain })

        if (chain.rpc.length == 0) {
            return {
                isError: true,
                message: `Empty rpc for this chain`
            };
        }
        const rpcUrl = chain.rpc[0];

        const balance = await this.getTokenBalance(token.address, this.userAddress, rpcUrl);
        console.error({
            balance,
            amountDeposit
        });
        if (balance < amountDeposit) {
            return {
                isError: true,
                message: "Balance not enought!"
            }
        }

        // check allowance
        const allowance = await this.getTokenAllowance(token.address, this.userAddress, chain.vaultFactoryAddress, rpcUrl);

        if (allowance < amountDeposit) {
            // Need approve more
            const additionAllowance = amountDeposit;
            return {
                isError: false,
                message: "To successfully create the vault, you'll need execute transaction on your wallet to approve spending usdt for deposit into Vault.",
                requireSignature: true,
                action: 'approve',
                contractAddress: token.address,
                dataToSign: await this.generateDataToSignApprove(chain.vaultFactoryAddress, additionAllowance)
            }
        }

        const body = {
            name: name,
            logo: logo,
            description: description,
            symbol: symbol,
            tokenId: tokenId,
            protocolIds: protocolIds,
            defaultProtocolId: defaultProtocolId,
            depositInit: {
                amountDeposit: amountDeposit.toString(),
                maxCapacity: BigInt(10000 * Math.pow(10, token.decimals)).toString()
            },
            depositRule: depositRule,
            fee: fee,
            withdrawTerm: withdrawTerm
        };
        console.error("CreateVaultBody: ", body);
        const response = await fetch(`${this.baseUrl}/api/creator/vault`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        });
        const result = await response.json();
        console.error("CreateVaultResponse", result);
        if (result.statusCode == undefined || result.statusCode != 200) {
            return {
                isError: true,
                message: result.message || 'The backend API request failed. Please try again later.'
            }
        }

        const onchainResponse = await this.createVaultOnchain(chain.vaultFactoryAddress, result.data);
        return onchainResponse;
    }

    async getProfileByAccessToken() {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/user/profile`,
                {
                    headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${this.accessToken}`
                    }
                },
            );

            const result = await response.json();
            if (result.statusCode == 200) {
                return result.data;
            }
            console.error("getProfile Error:", result);
            return false;
        } catch (error) {
            console.error("getProfile Error:", error);
            return false;
        }
    }
    // Auth functions
    async authGetChallengeCode(address: string) {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/auth/challengeCode/${address}`,
                {
                    headers: {
                        accept: "application/json"
                    }
                },
            );
            const result = await response.json();
            return result.data.challengeCode;
        } catch (error) {
            console.error("authGetChallengeCode Error:", error);
            return false;
        }
    }
    // Return txHash if success
    async createVaultOnchain(vaultFactoryAddress: string, payload: any) {
        console.error("start createVaultOnchain");
        const vaultParams = {
            authority: this.userAddress,
            deadline: payload.signature.deadline,
            protocolHelper: payload.vaultParam.protocolHelper,
            underlying: payload.vaultParam.underlying,
            name: payload.vaultParam.name,
            symbol: payload.vaultParam.symbol,
            initDepositAmount: payload.vaultParam.initialAgentDeposit,
            minDepositAmount: payload.vaultParam.minDeposit,
            maxDepositAmount: payload.vaultParam.maxDeposit
        };
        return {
            isError: false,
            message: "To successfully create the vault, you'll need execute transaction on your wallet.",
            requireSignature: true,
            action: 'createVault',
            contractAddress: vaultFactoryAddress,
            dataToSign: await this.generateDataToSignCreateVault(vaultParams, payload.signature.signature)
        }
    }
    async generateDataToSignDeposit(payload) {
        const abi = [
            {
                inputs: [
                  {
                    internalType: "bytes16",
                    name: "depositId",
                    type: "bytes16",
                  },
                  {
                    internalType: "uint256",
                    name: "amount",
                    type: "uint256",
                  },
                  {
                    internalType: "address",
                    name: "user",
                    type: "address",
                  },
                  {
                    internalType: "uint256",
                    name: "vaultTvl",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "deadline",
                    type: "uint256",
                  },
                  {
                    internalType: "bytes",
                    name: "signature",
                    type: "bytes",
                  },
                ],
                name: "deposit",
                outputs: [
                  {
                    internalType: "uint256",
                    name: "",
                    type: "uint256",
                  },
                ],
                stateMutability: "nonpayable",
                type: "function",
              }
        ];
        const iface = new ethers.Interface(abi);
        const data = iface.encodeFunctionData("deposit", [payload.vaultParam.depositId, payload.vaultParam.amount, payload.vaultParam.userAddress, payload.vaultParam.vaultTvl, payload.signature.deadline, payload.signature.signature]);
        console.error('Deposit Parameters:', {
            depositId: payload.vaultParam.depositId,
            amount: payload.vaultParam.amount,
            userAddress: payload.vaultParam.userAddress,
            vaultTvl: payload.vaultParam.vaultTvl,
            deadline: payload.signature.deadline,
            signature: payload.signature.signature
        });
        console.error("Encoded Data for Signing (Deposit):", data);
        return data;
    }

    async generateDataToSignApprove(spender: string, allowance: bigint) {
        const abi = [
            "function approve(address spender, uint256 amount)"
        ];
        const iface = new ethers.Interface(abi);
        const data = iface.encodeFunctionData("approve", [spender, allowance]);
        console.error("dataToSign Approve", data);
        return data;
    }

    async generateDataToSignCreateVault(vaultParams: any, signature: string) {
        const abi = [
            {
                inputs: [
                    {
                        components: [
                            {
                                internalType: "string",
                                name: "name",
                                type: "string",
                            },
                            {
                                internalType: "string",
                                name: "symbol",
                                type: "string",
                            },
                            {
                                internalType: "contract IERC20",
                                name: "underlying",
                                type: "address",
                            },
                            {
                                internalType: "contract IProtocolHelper",
                                name: "protocolHelper",
                                type: "address",
                            },
                            {
                                internalType: "address",
                                name: "authority",
                                type: "address",
                            },
                            {
                                internalType: "uint256",
                                name: "initDepositAmount",
                                type: "uint256",
                            },
                            {
                                internalType: "uint256",
                                name: "minDepositAmount",
                                type: "uint256",
                            },
                            {
                                internalType: "uint256",
                                name: "maxDepositAmount",
                                type: "uint256",
                            },
                            {
                                internalType: "uint256",
                                name: "deadline",
                                type: "uint256",
                            },
                        ],
                        internalType: "struct IEVMVaultFactory.CreateNewVaultParams",
                        name: "params",
                        type: "tuple",
                    },
                    {
                        internalType: "bytes",
                        name: "signature",
                        type: "bytes",
                    },
                ],
                name: "createNewVault",
                outputs: [
                    {
                        internalType: "contract IEVMVault",
                        name: "vault",
                        type: "address",
                    },
                ],
                stateMutability: "nonpayable",
                type: "function",
            },
        ];
        const iface = new ethers.Interface(abi);
        const data = iface.encodeFunctionData("createNewVault", [vaultParams, signature]);
        console.error("dataToSign createVault", data);
        return data;
    }

    async generateDataToSignWithdraw(withdrawParams: any) {
        const abi = [
            {
                inputs: [
                    {
                        internalType: "bytes16",
                        name: "withdrawId",
                        type: "bytes16",
                    },
                    {
                        internalType: "address",
                        name: "user",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "amountOut",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "vaultTvl",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "vaultFee",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "creatorFee",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "deadline",
                        type: "uint256",
                    },
                    {
                        internalType: "bytes",
                        name: "signature",
                        type: "bytes",
                    },
                ],
                name: "withdraw",
                outputs: [],
                stateMutability: "nonpayable",
                type: "function",
            }
        ];
        //const tx = await vaultContract.withdraw(payload.withdrawId, payload.receiverAddress, payload.amount, payload.vaultTvl, payload.vaultFee, payload.creatorFee, payload.deadline, payload.signature);
        const iface = new ethers.Interface(abi);
        const data = iface.encodeFunctionData("withdraw", [withdrawParams.withdrawId, withdrawParams.receiverAddress, withdrawParams.amount, withdrawParams.vaultTvl, withdrawParams.vaultFee, withdrawParams.creatorFee, withdrawParams.deadline, withdrawParams.signature]);
        console.error("dataToSign Withdraw", data);
        return data;
    }

    async hookVaultCreated(chainId: number, txHash: string): Promise<any> {
        const body = {};
        const response = await fetch(`${this.baseUrl}/api/webhook/create-vault/${chainId}/${txHash}`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        });
        return response.json();
    }

    async hookVaultDeposit(vaultId: string, txHash: string): Promise<any> {
        const body = {};
        const response = await fetch(`${this.baseUrl}/api/webhook/deposit/${vaultId}/${txHash}`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        });
        return response.json();
    }

    async hookVaultWithdraw(vaultId: string, txHash: string): Promise<any> {
        const body = {};
        const response = await fetch(`${this.baseUrl}/api/webhook/withdraw/${vaultId}/${txHash}`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        });
        return response.json();
    }

    async getTokenDetail(tokenId: string): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/api/token/${tokenId}`,
            { headers: this.headers },
        );
        return response.json();
    }

    async getVaultDetail(vaultId: string) {
        const params = new URLSearchParams({
            vaultId: vaultId,
        });
        const response = await fetch(
            `${this.baseUrl}/api/vault/detail?${params}`,
            { headers: this.headers },
        );
        var result = await response.json();
        console.error("vaultDetail", result);
        return result;
    }

    async updateVault(vaultId: string, logo: string, description: string, depositRule: DepositRule, fee: Fee, withdrawTerm: WithdrawTerm, protocolIds: string[]) {
        var body = {
            logo: logo,
            description: description,
            withdrawTerm: withdrawTerm,
            fee: fee,
            depositRule: depositRule
        };

        if (protocolIds.length > 0) {
            body["protocolIds"] = protocolIds;
        }
        const response = await fetch(`${this.baseUrl}/api/creator/vault/${vaultId}`, {
            method: "PATCH",
            headers: this.headers,
            body: JSON.stringify(body),
        });
        return response.json();
    }

    async creatorListVaultTransactions(vaultId: string, query): Promise<any> {
        const params = new URLSearchParams(query);
        const response = await fetch(
            `${this.baseUrl}/api/creator/vault/${vaultId}/transactions?${params}`,
            { headers: this.headers },
        );

        var result = await response.json();
        console.error("creatorListVaultTransactions", result);

        var mcpResponse: any[] = [];
        if (result.statusCode == 200 && result.data.items.length > 0) {
            result.data.items.forEach((item) => {
                mcpResponse.push({
                    id: item.id,
                    userId: item.userId,
                    amount: (BigInt(item.amount) / (10n ** BigInt(item.vault.token.decimals))).toString(),
                    tokenName: item.vault.token.name,
                    tokenSymbol: item.vault.token.symbol,
                    deadline: new Date(item.deadline * 1000),
                    type: item.type,
                    status: item.status,
                    createdAt: item.createdAt,
                });
            });
        }
        return mcpResponse;
    }

    async getMyPnL(): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/api/user/pnl`,
            { headers: this.headers },
        );
        return response.json();
    }

    async depositVault(vaultId: string, amount: number): Promise<any> {
        const res = await this.getVaultDetail(vaultId);
        // 1. Validate amount & check user balance
        // 2. Call backend api
        // 3. Call vault contract onchain
        if (res.statusCode == 200) {
            const vault = res.data;
            const token = vault.token;
            const chain = vault.chain;

            // Validate deposit rule
            if (amount < vault.depositRule.min) {
                return {
                    isError: true,
                    message: `deposit amount must greater than ${vault.depositRule.min}`
                }
            }
            if (vault.depositRule.max > 0 && amount > vault.depositRule.max) {
                return {
                    isError: true,
                    message: `deposit amount must lower than ${vault.depositRule.max}`
                }
            }

            // Validate balance
            if (chain.rpc.length < 0) {
                return {
                    isError: true,
                    message: "Chain RPC empty, check partnr backend for fix this issue!"
                }
            }
            const rpcUrl = chain.rpc[0];
            const depositAmountDecimals = BigInt((amount * Math.pow(10, token.decimals)).toFixed(0));

            console.error({
                address: token.address,
                user: this.userAddress,
                rpc: chain.rpc[0],
            })
            const balance = await this.getTokenBalance(token.address, this.userAddress, rpcUrl);
            console.error({
                balance,
                amount
            });
            if (balance < depositAmountDecimals) {
                return {
                    isError: true,
                    message: "Balance not enought!"
                }
            }
            // Validate allowance
            const allowance = await this.getTokenAllowance(token.address, this.userAddress, vault.contractAddress, rpcUrl);
            console.error("allowance", allowance)
            console.error("depositAmountDecimals", depositAmountDecimals)
            if (allowance < depositAmountDecimals) {
                const additionAllowance = depositAmountDecimals;
                return {
                    isError: false,
                    message: "To success deposit into Vault, you need execute approve transaction on your wallet.",
                    requireSignature: true,
                    vaultContract: vault.contractAddress,
                    action: 'approve',
                    contractAddress: token.address,
                    dataToSign: await this.generateDataToSignApprove(vault.contractAddress, additionAllowance)
                }
            }
            // Call backend api
            const body = {
                vaultId,
                amount: depositAmountDecimals.toString()
            };
            console.error("deposit body: ", body);
            const apiResponse = await fetch(`${this.baseUrl}/api/vault/depositor/deposit`, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify(body),
            });
            const apiResult = await apiResponse.json();
            console.error("deposit api result", apiResult);
            if (apiResult.statusCode != 200 && apiResult.statusCode != 201) {
                return {
                    isError: true,
                    message: apiResult.message
                }
            }
            const data = await this.generateDataToSignDeposit(apiResult.data);
            return {
                isError: false,
                message: "To success deposit into Vault, you need execute deposit transaction on your wallet.",
                requireSignature: true,
                vaultContract: vault.contractAddress,
                action: 'deposit',
                dataToSign: data,
                contractAddress: vault.contractAddress,
            }
        }
        return {
            isError: true,
            message: "Get vault detail error, check if vault exist or not."
        }
    }


    async withdrawVault(vaultId: string, amount: number): Promise<any> {
        const res = await this.getVaultDetail(vaultId);
        if (res.statusCode == 200) {
            const vault = res.data;
            const token = vault.token;
            const chain = vault.chain;
            if (chain.rpc.length < 0) {
                return {
                    isError: true,
                    message: "Chain RPC empty, check partnr backend for fix this issue!"
                }
            }
            const rpcUrl = chain.rpc[0];
            // Call backend api
            const withdrawAmountDecimals = BigInt(amount * Math.pow(10, token.decimals));
            const body = {
                vaultId,
                amount: withdrawAmountDecimals.toString()
            };
            console.error("withdraw body: ", body);
            const apiResponse = await fetch(`${this.baseUrl}/api/vault/depositor/withdraw`, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify(body),
            });
            const apiResult = await apiResponse.json();
            console.error("withdraw api result", apiResult);
            if (apiResult.statusCode != 200 && apiResult.statusCode != 201) {
                return {
                    isError: true,
                    message: apiResult.message
                }
            }
            switch (apiResult.data.service) {
                case Protocol.PANCAKE:
                case Protocol.VENUS:
                    // Call vault contract
                    const withdrawData: WithdrawData = {
                        withdrawId: apiResult.data.payload.withdrawId,
                        receiverAddress: apiResult.data.payload.user,
                        amount: apiResult.data.payload.amountOut,
                        vaultTvl: apiResult.data.payload.vaultTvl,
                        vaultFee: apiResult.data.payload.vaultFee,
                        creatorFee: apiResult.data.payload.creatorFee,
                        deadline: apiResult.data.signature.deadline,
                        signature: apiResult.data.signature.signature
                    }
                    const data = await this.generateDataToSignWithdraw(withdrawData);
                    return {
                        isError: false,
                        message: "To success withdraw from Vault, you need execute withdraw transaction on your wallet.",
                        requireSignature: true,
                        vaultContract: vault.contractAddress,
                        action: 'withdraw',
                        dataToSign: data,
                        contractAddress: vault.contractAddress,
                    }
                case Protocol.APEX:
                    return apiResult;
                default:
                    return apiResult;
            }
        }
        return {
            isError: true,
            message: "Get vault detail error, check if vault exist or not."
        }
    }

    // async evmWithdrawVaultOnchain(vaultAddress: string, payload: WithdrawData, providerUrl: string) {
    //     const provider = new ethers.JsonRpcProvider(providerUrl);
    //     const signer = this.evmWallet.connect(provider);
    //     const vaultContract = EVMVault__factory.connect(vaultAddress, signer);

    //     const tx = await vaultContract.withdraw(payload.withdrawId, payload.receiverAddress, payload.amount, payload.vaultTvl, payload.vaultFee, payload.creatorFee, payload.deadline, payload.signature);
    //     const receipt = await tx.wait();
    //     console.error("evmWithdrawVaultOnchain", receipt);
    //     return receipt;
    // }

    async getTokenBalance(tokenAddress: string, userAddress: string, providerUrl: string): Promise<bigint> {
        const provider = new ethers.JsonRpcProvider(providerUrl);
        const tokenAbi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ];

        const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);

        try {
            const balance = await tokenContract.balanceOf(userAddress);
            return balance;

        } catch (error) {
            console.error("Error getting token balance:", error);
            return BigInt('0');
        }
    }

    async getTokenAllowance(tokenAddress: string, userAddress: string, spender: string, rpcUrl: string): Promise<bigint> {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const tokenAbi = [
            "function allowance(address owner, address spender) view returns (uint256)"
        ];

        const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);

        try {
            const allowance = await tokenContract.allowance(userAddress, spender);
            return allowance;

        } catch (error) {
            console.error("Error getting token allowance:", error);
            return BigInt('0');
        }
    }

    async swapTokenPancake(vaultId: string, fromToken: string, amount: number, toToken: string): Promise<any> {
        const res = await this.getVaultDetail(vaultId);
        // TODO
        if (res.statusCode == 200) {
            return {
                isError: false,
                message: `Success`
            }
        }
        return {
            isError: true,
            message: "Get vault detail error, check if vault exist or not."
        }
    }
}