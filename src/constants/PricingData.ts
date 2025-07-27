import { TypePricingData } from "@/types/TypeContent";

/**
 * A centralized data object containing all pricing plan information.
 *
 * This configuration is structured by billing frequency (`annual`, `lifetime`)
 * and then by plan tier (`free`, `personal`, `pro`). Each plan object includes
 * its price, subtitle, features, and any relevant billing notes.
 */
export const PricingData: TypePricingData = {
  annual: {
    free: {
      price: "Free",
      subtitle: "Audionotes Trial",
      features: [
        "Unlimited Voice Notes (Upto 15 mins/note)",
        "Upload Audio Files (Upto 25 Mb)",
        "Create High Quality Content",
        "Notes, Summaries & Content are saved forever",
      ],
    },
    personal: {
      price: "₹2299/year",
      subtitle: "Audionotes Personal",
      billingNote: "Billed annually",
      features: [
        "Unlimited Voice Notes (Upto 15 mins/note)",
        "Record Upto 60 mins/note (900 mins/mo)",
        "Upload Audio Files (Upto 50 Mb)",
        "Create High Quality Content",
        "Audio digitization and One-Click Content Generate",
      ],
    },
    pro: {
      price: "₹5999/year",
      subtitle: "Audionotes Pro",
      billingNote: "Billed annually",
      features: [
        "Everything in Personal (Incl. Unlimited 15 min Notes)",
        "Record Upto 60 mins/note (5000 mins/mo)",
        "Upload Audio Files (Upto 50 Mb)",
        "Create High Quality Content",
        "Audio digitization and One-Click Content Generate",
        "Priority Support",
      ],
    },
  },
  lifetime: {
    free: {
      price: "Free",
      subtitle: "Audionotes Trial",
      features: [
        "Unlimited Voice Notes (Upto 15 mins/note)",
        "Upload Audio Files (Upto 25 Mb)",
        "Create High Quality Content",
        "Notes, Summaries & Content are saved forever",
      ],
    },
    personal: {
      price: "₹15,999",
      subtitle: "Audionotes Personal",
      billingNote: "Billed once",
      features: [
        "Unlimited Voice Notes (Upto 15 mins/note)",
        "Record Upto 60 mins/note (900 mins/mo)",
        "Upload Audio Files (Upto 50 Mb)",
        "Create High Quality Content",
        "Audio digitization and One-Click Content Generate",
      ],
    },
    pro: {
      price: "₹35,999",
      subtitle: "Audionotes Pro",
      billingNote: "Billed once",
      features: [
        "Everything in Personal (Incl. Unlimited 15 min Notes)",
        "Record Upto 60 mins/note (5000 mins/mo)",
        "Upload Audio Files (Upto 50 Mb)",
        "Create High Quality Content",
        "Audio digitization and One-Click Content Generate",
        "Priority Support",
      ],
    },
  },
};