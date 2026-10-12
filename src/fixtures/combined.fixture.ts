import { mergeTests } from '@playwright/test';
import { test as base } from './base.fixture';
import { test as api } from './api.fixture';

export const test = mergeTests(base, api);
export { expect } from '@playwright/test';