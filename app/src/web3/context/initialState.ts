import { AavegotchiObject } from "types";
import { Web3Provider } from "@ethersproject/providers";

export interface State {
  address?: string;
  provider?: Web3Provider;
  usersAavegotchis?: Array<AavegotchiObject>;
  selectedAavegotchiIndexA: number;
  selectedAavegotchiIndexB: number;
  selectedAavegotchiIndexC: number;
  loading: boolean;
  error?: Error;
  networkId?: number;
}

export const initialState: State = {
  loading: false,
  selectedAavegotchiIndexA: 0,
  selectedAavegotchiIndexB: 1,
  selectedAavegotchiIndexC: 2,
} 