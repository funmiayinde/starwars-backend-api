import { generateCode } from '../utils/helper';

interface ModelConfig {
  softDelete?: boolean;
  overrideExisting?: boolean;
  slugify?: string;
  uniques?: string[];
  returnDuplicate?: boolean;
  fillables?: string[];
  excludeFields?: string[];
  updateFillables?: string[];
  hiddenFields?: string[];
  dateFilters?: string[];
}
export default ModelConfig;
