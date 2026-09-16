import type { Messages } from "./id";

const en: Messages = {
  skipToContent: "Skip to main content",
  demoBanner:
    "Demo mode — showing sample data. This static build has no live backend; run the app locally for real-time pricing.",
  footer: {
    disclaimer:
      "RateRadar is a price comparison service. We never take payment and never book on your behalf — every booking is completed on the OTA's own site. Prices are indicative and may change.",
    copyright: (year: number) => `© ${year} RateRadar`,
  },
  nav: {
    ariaLabel: "Main navigation",
    homeAria: "RateRadar — home",
    search: "Find hotels",
    pro: "RateRadar Pro",
    themeToLight: "Switch to light mode",
    themeToDark: "Switch to dark mode",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    langSwitch: "Switch language",
  },
  home: {
    badge: "Data from 4 OTAs · Bali, Jakarta, Bandung, Yogyakarta",
    h1Line1: "Same room, different price on every OTA.",
    h1Line2: "We show you the gap.",
    subtitle:
      "RateRadar compares final hotel prices across local and international OTAs. We don't sell rooms — you book directly on whichever OTA has the best price.",
    sourceLabel: "Price sources:",
    linkOnly: "(link only)",
    previewLabel: "Biggest gap in Bali today",
    cheapestTag: "cheapest",
    spreadNote: (spread: string) => `${spread} gap per night for the same room.`,
    howItWorks: "How it works",
    steps: [
      {
        title: "One search, every OTA",
        body: "We ask Booking.com, Agoda, Traveloka and tiket.com for the same room, then line up the results side by side.",
      },
      {
        title: "All-in prices, no tax surprises",
        body: "Some OTAs show prices before tax and service charge. Every figure here is normalised to the final price so the comparison is fair.",
      },
      {
        title: "Price history, not a guess",
        body: "Every search adds a price observation, so you know whether today's price is genuinely cheap.",
      },
    ],
    citiesTitle: "Cities we monitor",
    properties: (n: string) => `${n} properties`,
    proCrossSellTitle: "Manage your own property?",
    proCrossSellBody:
      "RateRadar Pro tracks competitor prices around you and flags when an OTA sells your room below your floor rate — a rate-parity breach that eats into your direct bookings.",
    proCrossSellCta: "Open RateRadar Pro",
  },
  searchForm: {
    cityLabel: "Destination city",
    checkInLabel: "Check-in",
    checkOutLabel: "Check-out",
    guestsLabel: "Guests",
    guestOption: (n: number) => `${n} guest${n === 1 ? "" : "s"}`,
    dateError: "Check-out date must be after check-in.",
    searching: "Searching…",
    submit: "Compare",
  },
  results: {
    sortLabel: "Sort",
    sortCheapest: "Cheapest price",
    sortSavings: "Biggest gap",
    sortRating: "Highest rating",
    starsLabel: "Stars",
    starsFilterAria: "Minimum star filter",
    starsAll: "All",
    properties: (n: number) => `${n} properties`,
    filtered: " (filtered)",
    emptyTitle: "No matching properties",
    emptyBody: (minStars: number, city: string) =>
      `No ${minStars}+ star hotels in ${city} for these dates. Loosen the star filter to see more options.`,
    resetFilter: "Show all stars",
  },
  hotelCard: {
    starsAria: (n: number) => `${n} stars`,
    reviews: (n: string) => `${n} reviews`,
    priceHeader: (n: number) => `All-in price per night · ${n} sources`,
    compareSummary: (hotel: string, n: number, source: string, price: string) =>
      `Price comparison for ${hotel} across ${n} OTAs, cheapest ${source} ${price} per night.`,
    saveVs: (spread: string) => `Save ${spread} vs the most expensive source`,
    cheapestAt: (source: string) => `Cheapest on ${source}`,
    total: (total: string, nights: number) => `Total ${total} · ${nights} night${nights === 1 ? "" : "s"}`,
    viewAt: (source: string) => `View on ${source}`,
    priceHistory: "Price history",
    roomsLeft: (n: number) => `${n} room${n === 1 ? "" : "s"} left`,
  },
  searchView: {
    cityNotTracked: (city: string) => `We don't track “${city}” yet`,
    notTrackedBody:
      "RateRadar currently monitors Bali, Jakarta, Bandung, and Yogyakarta. Pick one above to see a price comparison.",
    backHome: "Back to home",
    hotelsIn: (city: string) => `Hotels in ${city}`,
    dateSummary: (checkIn: string, checkOut: string, nights: number, guests: number) =>
      `${checkIn} → ${checkOut} · ${nights} night${nights === 1 ? "" : "s"} · ${guests} guest${guests === 1 ? "" : "s"}`,
    sourcesFailed: (names: string) =>
      `Sources that didn't respond: ${names}. Showing the comparison from the sources that were available.`,
  },
  hotelView: {
    breadcrumbAria: "Breadcrumb",
    home: "Home",
    bookAt: (source: string, price: string) => `Book on ${source} · ${price}`,
    starsAria: (n: number) => `${n} stars`,
    ratingReviews: (rating: string, reviews: string) => `${rating}/10 · ${reviews} reviews`,
    statCheapestToday: "Cheapest today",
    statAvg30: "30-day average",
    statAvgDeltaLabel: "today's price vs average",
    statLowest: "Lowest recorded",
    statHighest: "Highest recorded",
    last30Days: "In the last 30 days",
    priceHistory30: "30-day price history",
    priceHistoryBody:
      "All-in price per night for 1 room, 2 guests. A gap in the line means a source didn't return a price that day.",
    chartSummary: (hotel: string, n: number, lowest: string, highest: string, average: string) =>
      `${hotel} price history over 30 days across ${n} OTAs. Lowest ${lowest}, highest ${highest}, average ${average}.`,
    pricePerOta: "Price per OTA",
    oneNight: (date: string) => `${date} · 1 night`,
    compareSummary: (n: number, hotel: string) => `Comparison of ${n} OTAs for ${hotel}.`,
    chooseSaves: (cheap: string, amount: string, dear: string) =>
      `Choosing ${cheap} saves ${amount} per night compared to ${dear}.`,
    priceBreakdown: "Price breakdown",
    displayed: (price: string) => `Shown ${price}`,
    plusTax: (amount: string) => ` + tax & fees ${amount}`,
    taxIncluded: " (tax included)",
    refundable: "Refundable",
    nonRefundable: "Non-refundable",
  },
  proView: {
    label: "RateRadar Pro",
    rateIntel30: (city: string) => `${city} · rate intelligence, last 30 days`,
    adrYours: "Your property's ADR",
    adrDeltaLabel: (days: number) => `second half vs first half of ${days} days`,
    avgDailyPrice: "Average daily rate",
    marketAdr: (days: number) => `Market ADR (${days} days)`,
    vsMarketLabel: "your position vs market",
    marketHint: (n: number, stars: number) => `Median of ${n} nearby ${stars}★ competitors`,
    rank: "Price rank",
    rankValue: (rank: number, total: number) => `#${rank} of ${total}`,
    rankHint: "1 = cheapest in the competitive set",
    parityViolations: "Parity violations",
    vs14Days: "vs the previous 14 days",
    criticalCount: (n: number) => `${n} critical`,
    noCritical: "None critical",
    yourPriceEachOta: "Your room price on each OTA",
    trendBody: "A line dipping below the others means an OTA is selling below your floor rate.",
    trendSummary: (property: string, n: number, adr: string, issues: number) =>
      `${property} price over 30 days across ${n} OTAs. ADR ${adr}, ${issues} rate-parity violations detected.`,
    competitiveSet: "Competitive set",
    competitiveSetBody: (days: number, stars: number) =>
      `${days}-day ADR for the nearest ${stars}★ competitors — the same time window as your ADR. Median is computed from the OTAs that list each property.`,
    ratePairty: "Rate parity",
    parityBody: (floor: string) => `OTAs selling below your floor rate of ${floor}.`,
    parityOk: "Parity is holding",
    parityOkBody: "No OTA has sold below your floor rate in the last 14 days.",
    critical: "Critical",
    warning: "Warning",
    issueSummary: (date: string, price: string, pct: string) => `${date} · sold at ${price} (${pct})`,
    notFound: "Property not found",
  },
  competitorTable: {
    empty: "No competitors tracked near this property yet.",
    caption: (name: string, adr: string) =>
      `Median competitor prices near ${name}, compared with your ADR of ${adr}.`,
    colProperty: "Property",
    colDistance: "Distance",
    colMedian: "Median",
    colVsYou: "vs you",
    youTag: "YOU",
    km: (n: number) => `${n} km`,
  },
  propertyPicker: {
    label: "Property",
  },
  trendChart: {
    noDataTitle: "No price data yet",
    noDataBody: "Data appears once the first observation comes in.",
    hideTable: "Hide table",
    showTable: "View table",
    dateCol: "Date",
  },
  compareBars: {
    cheapestBadge: "Cheapest",
  },
  readme: {},
};

export default en;
