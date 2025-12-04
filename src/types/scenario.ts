import { PropertyInputs } from '../utils/calculations';

export interface Scenario {
    id: string;
    name: string;
    inputs: PropertyInputs;
    createdAt: string;
}
