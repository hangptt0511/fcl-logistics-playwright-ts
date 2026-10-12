import { test as base, expect } from '@playwright/test';
import { FCLBookingPage } from '@ui/pages/fcl-booking/fcl-booking.page';
import { FCLBookingValidator } from '@ui/validators/fcl-booking.validator';
import { FCLBuyingPage } from '@ui/pages/pricing/fcl-buying.page';
import { CreateFCLQuotationPage } from '@ui/pages/quotation/create-fcl-quotation-page';
import { FCLRateCardPage } from '@ui/pages/pricing/fcl-rate-card/fcl-rate-card.page';
import { FCLQuotationListPage } from '@ui/pages/quotation/fcl-quotation-list.page';
import { FCLQuotatinListValidator } from '@ui/validators/fcl-quotation-list.validator';
import { CreateFCLQuotationValidator } from '@ui/validators/create-fcl-quotation.validator';
import { FCLBuyingValidator } from '@ui/validators/fcl-buying.validator';
import { FCLRateCardValidator } from '@ui/validators/fcl-rate-card.validator';

// Gom page + validator của một feature vào một fixture
type FCLBookingFixture = {
    page: FCLBookingPage;
    validator: FCLBookingValidator;
};
type fclQuotationListFixture = {
    page: FCLQuotationListPage;
    validator: FCLQuotatinListValidator;
};
type createFCLQuotationFixture = {
    page: CreateFCLQuotationPage;
    validator: CreateFCLQuotationValidator;
};
type fclBuyingFixture = {
    page: FCLBuyingPage;
    validator: FCLBuyingValidator;
};
type fclRateCardFixture = {
    page: FCLRateCardPage;
    validator: FCLRateCardValidator;
};

type MyFixtures = {
    fclBooking: FCLBookingFixture;
    fclBuying: fclBuyingFixture;
    createFCLQuotation: createFCLQuotationFixture;
    fclRateCard: fclRateCardFixture;
    fclQuotationList: fclQuotationListFixture;
};

export const test = base.extend<MyFixtures>({
    fclBooking: async ({ page }, use) => {
        const bookingPage = new FCLBookingPage(page);

        await use({
            page: bookingPage,
            validator: new FCLBookingValidator(bookingPage),
        });
    },
    createFCLQuotation: async ({ page }, use) => {
        const createFCLQuotationPage = new CreateFCLQuotationPage(page);

        await use({
            page: createFCLQuotationPage,
            validator: new CreateFCLQuotationValidator(createFCLQuotationPage),
        });
    },
    fclBuying: async ({ page }, use) => {
        const fclBuyingPage = new FCLBuyingPage(page);

        await use({
            page: fclBuyingPage,
            validator: new FCLBuyingValidator(fclBuyingPage),
        });
    },
     fclRateCard: async ({ page }, use) => {
        const fclRateCardPage = new FCLRateCardPage(page);

        await use({
            page: fclRateCardPage,
            validator: new FCLRateCardValidator(fclRateCardPage),
        });
    },
    fclQuotationList: async ({ page }, use) => {
        const fclQuotationListPage = new FCLQuotationListPage(page);

        await use({
            page: fclQuotationListPage,
            validator: new FCLQuotatinListValidator(fclQuotationListPage),
        });
    },
});

export { expect } from '@playwright/test';