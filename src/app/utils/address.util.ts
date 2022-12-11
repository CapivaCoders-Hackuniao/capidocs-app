import { ethers } from 'ethers';

export const validateAddress = (address: string): boolean => {
    try {
        ethers.utils.getAddress(address);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}