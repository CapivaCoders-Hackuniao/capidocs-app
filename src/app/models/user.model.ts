import { ethers } from 'ethers';

export class User {
  address: string | undefined;
  tokenContract: ethers.Contract | undefined;
  balance: string | undefined;
  eth: string | undefined;
  lowGas: boolean = false;
  isAdmin: boolean = false;
  isMinter: boolean = false;
  isBurner: boolean = false;
}
