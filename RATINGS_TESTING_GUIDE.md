# Ratings System Testing Guide

## 🧪 Complete Testing Instructions - Start Here!

This guide shows you **exactly how to test** the ratings system, with step-by-step instructions and code examples.

---

## ✅ **Part 1: Manual Testing in Your App** (Start Here!)

### 1.1 Test the Rating Screen

**Steps to test RatingScreen:**

1. **Run your app:**

   ```bash
   npm start
   # or
   expo start
   ```

2. **Navigate to a trip/delivery** (or mock one)

3. **Trigger the Rating Screen:**

   ```typescript
   // In your delivery completion code:
   navigation.navigate("Rating", {
     transactionId: "trip-123",
     transporterId: "trans-456",
     transporterName: "John Transporter",
     farmerId: "farmer-789",
     farmerName: "Jane Farmer",
   });
   ```

4. **Test these scenarios:**

   | Scenario                   | Steps                                    | Expected Result                      |
   | -------------------------- | ---------------------------------------- | ------------------------------------ |
   | **Submit valid rating**    | Tap stars (1-5), add comment, tap Submit | Success toast, rating saved          |
   | **Submit without comment** | Tap 5 stars, tap Submit (no comment)     | Success - comment is optional        |
   | **Comment too long**       | Add 1001+ characters                     | Error: "Max 1000 characters"         |
   | **Clear comment**          | Type text, tap X button                  | Text cleared                         |
   | **Star interaction**       | Hover over each star                     | Color change, count displayed        |
   | **Offline submission**     | Turn off wifi, submit rating             | Should save locally                  |
   | **Navigate back**          | Submit, then back button                 | Should prevent navigation mid-submit |

---

### 1.2 Test the Transporter Profile Screen

**Steps to test TransporterProfileScreen:**

1. **Navigate to a transporter profile:**

   ```typescript
   navigation.navigate("TransporterProfile", {
     transporterId: "trans-456",
   });
   ```

2. **Test these features:**

   | Feature                 | Test             | Expected                                               |
   | ----------------------- | ---------------- | ------------------------------------------------------ |
   | **Badge Display**       | View transporter | Shows correct badge (Gold/Silver/Bronze) or none       |
   | **Rating Stars**        | View profile     | Shows average rating with ⭐ icon                      |
   | **Rating Distribution** | View profile     | Shows 5 bars (1-5 stars) with percentages              |
   | **Reviews List**        | Scroll reviews   | Shows paginated reviews with timestamp                 |
   | **Sentiment Colors**    | View reviews     | Green for positive, gray for neutral, red for negative |
   | **Helpful Voting**      | Tap 👍 or 👎     | Vote count increases                                   |
   | **Pull to Refresh**     | Drag down        | List refreshes with new data                           |
   | **Review Pagination**   | Scroll to bottom | Loads next 10 reviews                                  |
   | **Share Button**        | Tap share        | Opens share sheet                                      |
   | **Offline Mode**        | Turn off wifi    | Shows cached data                                      |

---

## ✅ **Part 2: Service Testing** (Code Examples)

### 2.1 Test Rating Service

**Create a test file:** `src/tests/ratingService.test.ts`

```typescript
import { ratingService } from "../services/ratingService";

describe("Rating Service", () => {
  // Test 1: Create a rating
  test("should create a rating", async () => {
    const rating = await ratingService.createRating({
      transactionId: "trip-123",
      transporterId: "trans-456",
      farmerId: "farmer-789",
      farmerName: "John Farmer",
      rating: 5,
      comment: "Great service!",
    });

    expect(rating).toBeDefined();
    expect(rating.rating).toBe(5);
    expect(rating.comment).toBe("Great service!");
  });

  // Test 2: Invalid rating (below 1)
  test("should reject rating below 1", async () => {
    expect(async () => {
      await ratingService.createRating({
        transactionId: "trip-123",
        transporterId: "trans-456",
        farmerId: "farmer-789",
        farmerName: "John",
        rating: 0,
        comment: "Bad",
      });
    }).rejects.toThrow("Rating must be between 1 and 5");
  });

  // Test 3: Invalid rating (above 5)
  test("should reject rating above 5", async () => {
    expect(async () => {
      await ratingService.createRating({
        transactionId: "trip-123",
        transporterId: "trans-456",
        farmerId: "farmer-789",
        farmerName: "John",
        rating: 6,
        comment: "Good",
      });
    }).rejects.toThrow("Rating must be between 1 and 5");
  });

  // Test 4: Get transporter stats
  test("should calculate transporter stats", async () => {
    // Create 3 ratings
    await ratingService.createRating({
      transactionId: "trip-1",
      transporterId: "trans-456",
      farmerId: "farmer-1",
      farmerName: "Farmer 1",
      rating: 5,
      comment: "Great",
    });

    await ratingService.createRating({
      transactionId: "trip-2",
      transporterId: "trans-456",
      farmerId: "farmer-2",
      farmerName: "Farmer 2",
      rating: 4,
      comment: "Good",
    });

    await ratingService.createRating({
      transactionId: "trip-3",
      transporterId: "trans-456",
      farmerId: "farmer-3",
      farmerName: "Farmer 3",
      rating: 5,
      comment: "Excellent",
    });

    const stats = await ratingService.getTransporterStats("trans-456");

    expect(stats).toBeDefined();
    expect(stats.averageRating).toBe(4.67); // (5+4+5)/3
    expect(stats.totalRatings).toBe(3);
    expect(stats.distribution[5]).toBe(2); // Two 5-star ratings
    expect(stats.distribution[4]).toBe(1); // One 4-star rating
  });

  // Test 5: Verification badge eligibility
  test("should check badge eligibility", async () => {
    const stats = {
      averageRating: 4.8,
      totalRatings: 100,
      onTimePercentage: 98,
    };

    // Should qualify for Gold badge
    expect(ratingService.calculateVerificationEligibility(stats)).toBe("gold");

    // Silver badge
    const silverStats = {
      averageRating: 4.5,
      totalRatings: 50,
      onTimePercentage: 95,
    };
    expect(ratingService.calculateVerificationEligibility(silverStats)).toBe(
      "silver"
    );

    // Bronze badge
    const bronzeStats = {
      averageRating: 4.0,
      totalRatings: 20,
      onTimePercentage: 90,
    };
    expect(ratingService.calculateVerificationEligibility(bronzeStats)).toBe(
      "bronze"
    );

    // No badge
    const noStats = {
      averageRating: 3.5,
      totalRatings: 10,
      onTimePercentage: 80,
    };
    expect(ratingService.calculateVerificationEligibility(noStats)).toBeNull();
  });

  // Test 6: Search transporters by rating
  test("should search transporters by minimum rating", async () => {
    const results = await ratingService.searchTransporters({
      minRating: 4.0,
    });

    expect(Array.isArray(results)).toBe(true);
    results.forEach((transporter) => {
      expect(transporter.averageRating).toBeGreaterThanOrEqual(4.0);
    });
  });

  // Test 7: Get top rated transporters
  test("should get leaderboard", async () => {
    const leaderboard = await ratingService.getTopRatedTransporters(10);

    expect(Array.isArray(leaderboard)).toBe(true);
    expect(leaderboard.length).toBeLessThanOrEqual(10);

    // Check sorted by rating (descending)
    for (let i = 0; i < leaderboard.length - 1; i++) {
      expect(leaderboard[i].averageRating).toBeGreaterThanOrEqual(
        leaderboard[i + 1].averageRating
      );
    }
  });
});
```

---

### 2.2 Test Review Service

**Create a test file:** `src/tests/reviewService.test.ts`

```typescript
import { reviewService } from "../services/reviewService";

describe("Review Service", () => {
  // Test 1: Create a review
  test("should create a review with sentiment analysis", async () => {
    const review = await reviewService.createReview({
      ratingId: "rating-123",
      transporterId: "trans-456",
      farmerId: "farmer-789",
      text: "Amazing service! Very professional and on time.",
      isAnonymous: false,
    });

    expect(review).toBeDefined();
    expect(review.text).toBe("Amazing service! Very professional and on time.");
    expect(review.sentiment).toBe("positive");
    expect(review.status).toBe("pending"); // Requires admin approval
  });

  // Test 2: Review too short
  test("should reject review shorter than 10 characters", async () => {
    expect(async () => {
      await reviewService.createReview({
        ratingId: "rating-123",
        transporterId: "trans-456",
        farmerId: "farmer-789",
        text: "Good",
        isAnonymous: false,
      });
    }).rejects.toThrow("Review must be at least 10 characters");
  });

  // Test 3: Review too long
  test("should reject review longer than 1000 characters", async () => {
    const longText = "a".repeat(1001);
    expect(async () => {
      await reviewService.createReview({
        ratingId: "rating-123",
        transporterId: "trans-456",
        farmerId: "farmer-789",
        text: longText,
        isAnonymous: false,
      });
    }).rejects.toThrow("Review must be at most 1000 characters");
  });

  // Test 4: Sentiment analysis
  test("should detect positive sentiment", async () => {
    const review = await reviewService.createReview({
      ratingId: "rating-123",
      transporterId: "trans-456",
      farmerId: "farmer-789",
      text: "Excellent service! Very helpful and professional.",
      isAnonymous: false,
    });

    expect(review.sentiment).toBe("positive");
  });

  test("should detect negative sentiment", async () => {
    const review = await reviewService.createReview({
      ratingId: "rating-123",
      transporterId: "trans-456",
      farmerId: "farmer-789",
      text: "Terrible service! Very rude and late.",
      isAnonymous: false,
    });

    expect(review.sentiment).toBe("negative");
  });

  test("should detect neutral sentiment", async () => {
    const review = await reviewService.createReview({
      ratingId: "rating-123",
      transporterId: "trans-456",
      farmerId: "farmer-789",
      text: "The service was completed.",
      isAnonymous: false,
    });

    expect(review.sentiment).toBe("neutral");
  });

  // Test 5: Content moderation
  test("should flag reviews with external contact info", async () => {
    const review = await reviewService.createReview({
      ratingId: "rating-123",
      transporterId: "trans-456",
      farmerId: "farmer-789",
      text: "Contact me at phone: 0123456789 for more info",
      isAnonymous: false,
    });

    expect(review.flagged).toBe(true);
    expect(review.flagReason).toContain("external contact");
    expect(review.status).toBe("flagged");
  });

  // Test 6: Get reviews with pagination
  test("should get paginated reviews", async () => {
    const reviews = await reviewService.getTransporterReviews("trans-456", {
      page: 1,
      limit: 10,
    });

    expect(Array.isArray(reviews.data)).toBe(true);
    expect(reviews.pagination.page).toBe(1);
    expect(reviews.pagination.limit).toBe(10);
    expect(reviews.pagination.total).toBeDefined();
  });

  // Test 7: Mark review as helpful
  test("should mark review as helpful", async () => {
    const review = await reviewService.createReview({
      ratingId: "rating-123",
      transporterId: "trans-456",
      farmerId: "farmer-789",
      text: "Very helpful review text here",
      isAnonymous: false,
    });

    const updated = await reviewService.markHelpful("review-id", true);

    expect(updated.helpfulCount).toBeGreaterThanOrEqual(0);
  });

  // Test 8: Flag review for moderation
  test("should flag inappropriate review", async () => {
    const flagged = await reviewService.flagReview("review-id", {
      reason: "spam",
      description: "Contains spam links",
    });

    expect(flagged.flagged).toBe(true);
    expect(flagged.flagReason).toContain("spam");
  });

  // Test 9: Get review analytics
  test("should get review analytics", async () => {
    const analytics = await reviewService.getAnalytics("trans-456");

    expect(analytics).toBeDefined();
    expect(analytics.totalReviews).toBeDefined();
    expect(analytics.sentimentDistribution).toBeDefined();
    expect(analytics.sentimentDistribution.positive).toBeDefined();
    expect(analytics.sentimentDistribution.negative).toBeDefined();
    expect(analytics.sentimentDistribution.neutral).toBeDefined();
    expect(analytics.averageHelpfulRating).toBeDefined();
  });
});
```

---

### 2.3 Test Advanced Features Service

**Create a test file:** `src/tests/advancedRatingsService.test.ts`

```typescript
import { advancedRatingsService } from "../services/advancedRatingsService";

describe("Advanced Ratings Service", () => {
  // Test 1: Get leaderboard
  test("should get leaderboard for current period", async () => {
    const leaderboard = await advancedRatingsService.getLeaderboard({
      period: "weekly",
      limit: 10,
    });

    expect(Array.isArray(leaderboard)).toBe(true);

    // Should be sorted by rank
    for (let i = 0; i < leaderboard.length - 1; i++) {
      expect(leaderboard[i].rank).toBeLessThan(leaderboard[i + 1].rank);
    }
  });

  // Test 2: Get transporter rank
  test("should get transporter rank", async () => {
    const rank = await advancedRatingsService.getTransporterRank(
      "trans-456",
      "monthly"
    );

    expect(rank).toBeDefined();
    expect(rank.transporterId).toBe("trans-456");
    expect(rank.rank).toBeDefined();
    expect(rank.percentile).toBeDefined();
  });

  // Test 3: Create incentive
  test("should create incentive for high-rated transporters", async () => {
    const incentive = await advancedRatingsService.createIncentive({
      transporterId: "trans-456",
      type: "discount",
      amount: 1000,
      description: "Thank you for 100 5-star ratings!",
    });

    expect(incentive).toBeDefined();
    expect(incentive.type).toBe("discount");
    expect(incentive.amount).toBe(1000);
    expect(incentive.expiresAt).toBeDefined();
  });

  // Test 4: Get farmer incentives
  test("should get active incentives for farmer", async () => {
    const incentives = await advancedRatingsService.getFarmerIncentives(
      "farmer-789"
    );

    expect(Array.isArray(incentives)).toBe(true);

    // All should be active (not expired)
    incentives.forEach((incentive) => {
      expect(new Date(incentive.expiresAt).getTime()).toBeGreaterThan(
        Date.now()
      );
    });
  });

  // Test 5: Redeem incentive
  test("should redeem incentive", async () => {
    const redeemed = await advancedRatingsService.redeemIncentive(
      "incentive-123"
    );

    expect(redeemed.redeemed).toBe(true);
    expect(redeemed.redeemedAt).toBeDefined();
  });

  // Test 6: Create rating reminder
  test("should create rating reminder", async () => {
    const reminder = await advancedRatingsService.createReminder({
      transactionId: "trip-123",
      farmerId: "farmer-789",
      transporterId: "trans-456",
    });

    expect(reminder).toBeDefined();
    expect(reminder.status).toBe("pending");
    expect(reminder.scheduledFor).toBeDefined();
  });

  // Test 7: Get pending reminders
  test("should get pending reminders due now", async () => {
    const reminders = await advancedRatingsService.getPendingReminders(
      "farmer-789"
    );

    expect(Array.isArray(reminders)).toBe(true);

    // All should be pending and due
    reminders.forEach((reminder) => {
      expect(reminder.status).toBe("pending");
      expect(new Date(reminder.scheduledFor).getTime()).toBeLessThanOrEqual(
        Date.now()
      );
    });
  });

  // Test 8: Fraud detection
  test("should calculate fraud score", async () => {
    const fraudScore = await advancedRatingsService.calculateFraudScore(
      "trans-456"
    );

    expect(fraudScore).toBeDefined();
    expect(fraudScore.score).toBeGreaterThanOrEqual(0);
    expect(fraudScore.score).toBeLessThanOrEqual(100);

    if (fraudScore.score > 50) {
      expect(fraudScore.flagged).toBe(true);
      expect(Array.isArray(fraudScore.reasons)).toBe(true);
    }
  });

  // Test 9: Get analytics
  test("should get platform analytics", async () => {
    const analytics = await advancedRatingsService.getAnalytics();

    expect(analytics).toBeDefined();
    expect(analytics.totalRatings).toBeDefined();
    expect(analytics.averageRating).toBeDefined();
    expect(analytics.totalReviews).toBeDefined();
    expect(analytics.topTransporters).toBeDefined();
  });

  // Test 10: Get transporter insights
  test("should get personalized transporter insights", async () => {
    const insights = await advancedRatingsService.getTransporterInsights(
      "trans-456"
    );

    expect(insights).toBeDefined();
    expect(Array.isArray(insights.strengths)).toBe(true);
    expect(Array.isArray(insights.improvements)).toBe(true);
    expect(Array.isArray(insights.recommendations)).toBe(true);
  });
});
```

---

## ✅ **Part 3: Run the Tests**

### 3.1 Setup Jest

**Install Jest:**

```bash
npm install --save-dev jest @types/jest ts-jest
```

**Create `jest.config.js`:**

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
```

**Update `package.json`:**

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 3.2 Run Tests

**Run all tests:**

```bash
npm test
```

**Run specific test file:**

```bash
npm test ratingService.test
```

**Watch mode (re-run on changes):**

```bash
npm test:watch
```

**With coverage:**

```bash
npm test:coverage
```

---

## ✅ **Part 4: Manual Test Scenarios**

### Scenario 1: Complete Rating Flow

**Goal:** Test the entire rating flow from delivery to profile view

**Steps:**

1. Complete a delivery in your app
2. Navigate to RatingScreen with trip data
3. Select 5 stars
4. Add comment: "Great service!"
5. Submit
6. See success message
7. Navigate to TransporterProfileScreen
8. Verify rating appears in their profile
9. Verify badge appears (if qualifies)
10. Verify average rating is updated

**Expected:**

- ✅ Rating saved locally and to backend
- ✅ Transporter stats updated
- ✅ Review visible in their profile
- ✅ Badge awarded if criteria met

---

### Scenario 2: Badge Verification

**Goal:** Test badge award criteria

**Setup:**

- Create a transporter with 100 deliveries
- Give them 95 5-star ratings + 5 4-star ratings (avg 4.9)
- Set on-time percentage to 98%

**Expected:**

- ✅ Gold badge awarded
- ✅ Badge displayed in profile
- ✅ Badge shown in search results
- ✅ Badge on leaderboard

---

### Scenario 3: Fraud Detection

**Goal:** Test fraud prevention

**Setup:**

- Create 20 ratings in 1 hour by same farmer
- All exactly 1-star with no comments
- All for different transporters
- Rating text same as spam patterns

**Expected:**

- ✅ Fraud score calculated (should be > 50)
- ✅ Rating flagged for admin review
- ✅ Admin notified
- ✅ Rating marked as suspicious

---

### Scenario 4: Incentive System

**Goal:** Test incentive creation and redemption

**Setup:**

- Transporter reaches 100 5-star ratings
- System awards discount incentive
- Farmer receives incentive notification

**Steps:**

1. Check IncentivesScreen
2. Verify incentive listed
3. Redeem incentive
4. Use in next booking
5. Verify discount applied

**Expected:**

- ✅ Incentive created automatically
- ✅ Listed in farmer's incentives
- ✅ Can be redeemed
- ✅ Discount applied correctly

---

## ✅ **Part 5: Testing Checklist**

Print this and check off as you test:

```
RATING SCREEN TESTING
- [ ] Submit 5-star rating with comment
- [ ] Submit rating without comment
- [ ] Star interaction (hover, click)
- [ ] Comment character counter
- [ ] Form validation
- [ ] Offline submission
- [ ] Success toast message
- [ ] Loading state during submit

TRANSPORTER PROFILE TESTING
- [ ] Rating stars display correctly
- [ ] Average rating calculated correctly
- [ ] Rating distribution bars show
- [ ] Reviews list loads
- [ ] Reviews paginate correctly
- [ ] Sentiment colors display
- [ ] Helpful voting works
- [ ] Share button works
- [ ] Pull-to-refresh works
- [ ] Badge displays correctly

SERVICE TESTING
- [ ] Create rating (valid)
- [ ] Create rating (invalid - out of range)
- [ ] Get transporter stats
- [ ] Calculate badge eligibility
- [ ] Get reviews with pagination
- [ ] Mark helpful/unhelpful
- [ ] Flag review
- [ ] Sentiment analysis (positive/negative/neutral)
- [ ] Fraud detection
- [ ] Leaderboard ranking

ADVANCED FEATURES TESTING
- [ ] Create reminder
- [ ] Get pending reminders
- [ ] Get leaderboard
- [ ] Create incentive
- [ ] Redeem incentive
- [ ] Get analytics
- [ ] Get insights

INTEGRATION TESTING
- [ ] Rating → Stats updated
- [ ] Stats → Badge awarded (if eligible)
- [ ] Review → Sentiment analyzed
- [ ] Incentive → Redeemable
- [ ] Reminder → Notifies user
```

---

## 📊 What Good Test Coverage Looks Like

```
Services:
✅ ratingService.ts     - 90%+ coverage
✅ reviewService.ts     - 85%+ coverage
✅ advancedRatingsService.ts - 80%+ coverage

Screens:
✅ RatingScreen.tsx             - 75%+ coverage
✅ TransporterProfileScreen.tsx - 75%+ coverage

Target Overall: 80%+ code coverage
```

---

## 🚀 Next Steps

1. **Copy test files** to `src/tests/`
2. **Install Jest** with the commands above
3. **Run tests** with `npm test`
4. **Manually test** the screens using the scenarios
5. **Check coverage** with `npm test:coverage`
6. **Fix any failures** based on error messages

---

## 💡 Tips

- **Test locally first** before deploying to backend
- **Use AsyncStorage DevTools** to inspect stored data
- **Test on real devices** for performance
- **Monitor logs** for errors
- **Test offline mode** thoroughly
- **Test with slow network** (throttle in DevTools)

---

**You're all set! Start with Part 1 (Manual Testing) - it's the quickest way to see everything working!** 🎉
