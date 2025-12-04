import { PropertyInputs } from '../utils/calculations';

export interface PropertyTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    inputs: Partial<PropertyInputs>;
}

export type TemplateId = 'apartment' | 'house' | 'commercial';
