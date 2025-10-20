# ⚡ Quick Test Checklist - Week Overview

## 🎯 Daily Tasks

### **MONDAY: Setup & Preparation**

- [ ] Install app on Android device/emulator
- [ ] Install app on iOS device/simulator (if available)
- [ ] Test on web browser (Chrome)
- [ ] Create test accounts:
  - [ ] farmer@test.com (Farmer)
  - [ ] buyer@test.com (Buyer)
  - [ ] transporter@test.com (Transporter)
- [ ] Set up video recording software (OBS Studio)
- [ ] Prepare screenshot tool
- [ ] Create performance measurement spreadsheet
- [ ] Read through TESTING_DEMONSTRATION_PLAN.md

### **TUESDAY: Unit & Integration Testing**

**Farmer Tests:**

- [ ] Register as farmer
- [ ] Login successfully
- [ ] List crop with valid data
- [ ] Edit crop
- [ ] Delete crop
- [ ] View orders
- [ ] Log out

**Buyer Tests:**

- [ ] Register as buyer
- [ ] Login successfully
- [ ] View available crops
- [ ] Search crops
- [ ] Filter crops
- [ ] Place order with valid data
- [ ] View my orders
- [ ] Track order status
- [ ] Log out

**Transporter Tests:**

- [ ] Register as transporter
- [ ] Login successfully
- [ ] View available loads
- [ ] Accept a trip
- [ ] View active trips
- [ ] Update trip status
- [ ] Complete trip
- [ ] Log out

**Screenshots Captured**: 20+

### **WEDNESDAY: User Acceptance Testing (UAT)**

**Farmer UAT Scenarios:**

- [ ] Complete crop listing workflow
- [ ] Handle validation errors
- [ ] Test with edge case quantities
- [ ] Manage multiple listings
- [ ] Track orders from multiple buyers

**Buyer UAT Scenarios:**

- [ ] Browse and search different crops
- [ ] Place orders with different quantities
- [ ] Complete payment flow
- [ ] Track multiple orders
- [ ] Handle order cancellation (if available)

**Transporter UAT Scenarios:**

- [ ] Accept and complete full trip
- [ ] Update status at each step
- [ ] Handle trip completion
- [ ] View earnings/history

**Screenshots Captured**: 15+

### **THURSDAY: Performance Testing**

**Android Device Testing:**

- [ ] Record: Startup time
- [ ] Record: Screen load times
- [ ] Record: API response times
- [ ] Record: Memory usage
- [ ] Record: Battery drain

**iOS Device Testing (if available):**

- [ ] Record: Same metrics as Android

**Web Browser Testing:**

- [ ] Record: Page load time
- [ ] Record: Component render time
- [ ] Record: Smooth scrolling (FPS)

**Stress Testing:**

- [ ] Test with 50+ crop listings
- [ ] Test with 30+ orders
- [ ] Test rapid screen transitions
- [ ] Test multiple actions simultaneously

**Videos Captured**: Performance demos

### **THURSDAY EVENING: Video Creation**

- [ ] Part 1: Authentication (2 min) - Record
- [ ] Part 2: Farmer Flow (5 min) - Record
- [ ] Part 3: Buyer Flow (5 min) - Record
- [ ] Part 4: Transporter Flow (5 min) - Record
- [ ] Part 5: Error Handling (3 min) - Record
- [ ] Part 6: Performance (2 min) - Record
- [ ] Edit video (add captions/narration)
- [ ] Export as MP4 (HD quality)

### **FRIDAY: Documentation & Submission**

**Test Results Analysis:**

- [ ] Compile all screenshots
- [ ] Create performance comparison table
- [ ] Document all test results
- [ ] Identify any bugs/issues
- [ ] Calculate success rate

**Final Documents:**

- [ ] Functionality analysis vs. objectives
- [ ] Performance analysis report
- [ ] Discussion points prepared
- [ ] Recommendations drafted
- [ ] Future work proposal written
- [ ] Upload to Canvas

---

## 📊 Performance Metrics Template

```
DEVICE: [Device Name and Specs]
DATE: [Testing Date]
NETWORK: [WiFi/4G/3G]

APP STARTUP TIME:        _____ seconds
SCREEN LOAD TIME:        _____ milliseconds
API RESPONSE TIME:       _____ milliseconds
MEMORY USAGE:            _____ MB
FRAME RATE (Scrolling):  _____ FPS
BATTERY DRAIN:           _____ %/hour

NETWORK CONDITIONS:
- Upload Speed: _____ Mbps
- Download Speed: _____ Mbps
- Latency: _____ ms

NOTES:
_____________________________________
```

---

## ✅ Test Case Quick Reference

### FARMER - Happy Path

1. Login → 2. List Crop → 3. View Listings → 4. Edit Crop → 5. View Orders
   **Expected**: All steps complete successfully

### BUYER - Happy Path

1. Login → 2. Search Crops → 3. View Details → 4. Place Order → 5. Track Order
   **Expected**: Order placed and tracked

### TRANSPORTER - Happy Path

1. Login → 2. View Loads → 3. Accept Trip → 4. Update Status → 5. Complete
   **Expected**: Trip completed successfully

### ERROR HANDLING

1. Empty fields → Shows validation error ✓
2. Invalid email → Shows format error ✓
3. Qty exceeds stock → Shows stock error ✓
4. Negative numbers → Shows validation error ✓

---

## 📱 Test Data Accounts

```
FARMER:
Email: farmer@test.com
Password: password123
Name: Test Farmer
Phone: +250700000001

BUYER:
Email: buyer@test.com
Password: password123
Name: Test Buyer
Phone: +250700000002

TRANSPORTER:
Email: transporter@test.com
Password: password123
Name: Test Transporter
Phone: +250700000003
```

---

## 🎬 Video Recording Segments

| Segment        | Duration   | Key Points                      |
| -------------- | ---------- | ------------------------------- |
| Authentication | 2 min      | Register, Login, Role selection |
| Farmer         | 5 min      | List crop, Manage, View orders  |
| Buyer          | 5 min      | Browse, Search, Order, Track    |
| Transporter    | 5 min      | Accept, Update status, Complete |
| Error Handling | 3 min      | Show validation, error messages |
| Performance    | 2 min      | Startup time, responsiveness    |
| **TOTAL**      | **22 min** | Complete walkthrough            |

---

## 🔍 What to Look For (Bug Hunting)

**Critical Issues:**

- App crashes
- Data not persisting
- Wrong data displayed
- Payment failures
- Login failures

**Performance Issues:**

- Slow startup (>3 seconds)
- Lag when scrolling
- Slow API responses (>1 second)
- High memory usage (>150MB)

**UX Issues:**

- Buttons not responding
- Text cut off or misaligned
- Forms not validating
- Navigation broken
- Cards distorted or too wide

---

## 📹 Recording Tips

**Best Practices:**

1. ✅ Use landscape mode on mobile
2. ✅ Speak clearly when narrating
3. ✅ Go slowly through each step
4. ✅ Pause after each action to show results
5. ✅ Show error messages for 3+ seconds
6. ✅ Use 1080p or higher resolution
7. ✅ Test mic audio quality first
8. ✅ Have stable internet connection
9. ✅ Close unnecessary background apps
10. ✅ Use touch highlighting (if available)

**What NOT to Do:**

- ❌ Fast-forward through important steps
- ❌ Skip error scenarios
- ❌ Use unclear narration
- ❌ Record in noisy environment
- ❌ Have poor lighting
- ❌ Record low-quality video

---

## 📋 Submission Items Checklist

**Video**

- [ ] Video file (MP4, 1080p minimum)
- [ ] Duration: 15-22 minutes
- [ ] All functionalities demonstrated
- [ ] Performance shown
- [ ] Clear narration/captions
- [ ] Canvas link provided

**Documentation**

- [ ] Screenshots (minimum 20)
- [ ] Performance metrics table
- [ ] Test results summary
- [ ] Functionality analysis
- [ ] Discussion points
- [ ] Recommendations document

---

## 🎯 Success Criteria

✅ **PASS** if:

- Video shows all 3 user roles working
- At least 20 screenshots captured
- Performance metrics recorded
- No critical bugs during demo
- Clear narration/documentation
- All analysis sections completed

❌ **FAIL** if:

- Missing user role demonstrations
- No performance metrics
- App crashes during demo
- Less than 10 screenshots
- Incomplete analysis

---

## 💡 Quick Problem-Solving

**App won't start?**

- Clear cache: `npm start -c`
- Reinstall: `rm -rf node_modules && npm install`

**Video recording is laggy?**

- Close background apps
- Reduce resolution
- Use native screen recorder
- Pre-warm the device

**Need more test data?**

- Use different quantities for each crop
- Create multiple test users
- Use different delivery locations
- Vary payment amounts

**Performance too slow?**

- Test on better network
- Use closer server
- Clear app cache
- Restart device
- Update to latest OS

---

## 📞 Need Help?

**For Technical Issues:**

- Check Android Studio debugger
- Check iOS console
- Check network tab in browser
- Read error messages carefully
- Check project README

**For Testing Issues:**

- Review TESTING_DEMONSTRATION_PLAN.md
- Check test data accounts
- Verify device compatibility
- Check network connectivity

---

**Remember**: The goal is to demonstrate that the platform works correctly and efficiently. Focus on showing real-world usage scenarios!

Good luck! 🚀
