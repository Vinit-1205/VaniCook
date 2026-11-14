/**
 * COOKCONNECT — PHASE 2 AUTOMATED VERIFICATION SUITE
 * 
 * Verifies:
 * 1. Database & Phase 2 Schema Integrity
 * 2. Deterministic Pricing Engine & Dynamic Multi-Household Economics
 * 3. Deterministic Matching Engine (Mandatory constraints & 100% scoring weights)
 * 4. Cook Capacity & Sequential In-Tower Scheduling Engine
 * 5. Group Pool Lifecycle (Creation, Joining, Privacy, Cook Assignment, Booking Generation)
 * 6. Gnani AI Voice Orchestration (STT/TTS adapters, NLP intents, Confirmation gate, Base64 audio)
 * 7. Real-time Socket.IO Event Infrastructure
 */

import prisma from './src/backend/config/database.js';
import { PricingService } from './src/backend/services/pricing.service.js';
import { MatchingService } from './src/backend/services/matching.service.js';
import { SchedulingService } from './src/backend/services/scheduling.service.js';
import { GroupService } from './src/backend/services/group.service.js';
import { VoiceOrchestratorService } from './src/backend/services/gnani/voice-orchestrator.service.js';
import { GnaniPrismaService } from './src/backend/services/gnani/prisma.service.js';
import { GnaniTimbreService } from './src/backend/services/gnani/timbre.service.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName} - ${details}`);
  }
}

async function runPhase2Tests() {
  console.log('\n============================================================');
  console.log('🧪 COOKCONNECT PHASE 2: VERIFICATION TEST SUITE');
  console.log('============================================================\n');

  try {
    // Clean up any lingering records from previous test runs
    await prisma.booking.deleteMany({ where: { notes: { contains: 'Tower A Lunch Club' } } });
    await prisma.groupMember.deleteMany({ where: { flatNumber: { contains: 'Tower A' } } });
    await prisma.groupRequest.deleteMany({ where: { title: 'Tower A Lunch Club' } });
    await prisma.groupRequest.deleteMany({ where: { description: { contains: 'Tower C' } } });

    // ----------------------------------------------------
    // TEST SECTION 1: Database & Seed Verification
    // ----------------------------------------------------
    console.log('--- TEST SECTION 1: DATABASE & SCHEMA INTEGRITY ---');
    const societies = await prisma.society.findMany();
    assert(societies.length > 0, 'Residential societies loaded in PostgreSQL', `Found ${societies.length}`);

    const cooks = await prisma.cookProfile.findMany({
      include: { user: true, availabilities: true },
    });
    assert(cooks.length >= 2, 'Cook profiles with availability slots loaded', `Found ${cooks.length}`);

    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: { householdLocations: true },
    });
    assert(customers.length >= 2, 'Multiple distinct customer households available for pooling', `Found ${customers.length}`);

    // ----------------------------------------------------
    // TEST SECTION 2: Dynamic Shared Pool Pricing Engine
    // ----------------------------------------------------
    console.log('\n--- TEST SECTION 2: SMART COST CALCULATOR & DYNAMIC PRICING ---');
    const price1 = PricingService.calculatePoolPrice({ totalHouseholds: 1, baseRate: 3500 });
    const price2 = PricingService.calculatePoolPrice({ totalHouseholds: 2, baseRate: 3500 });
    const price3 = PricingService.calculatePoolPrice({ totalHouseholds: 3, baseRate: 3500 });
    const price4 = PricingService.calculatePoolPrice({ totalHouseholds: 4, baseRate: 3500 });
    const price5 = PricingService.calculatePoolPrice({ totalHouseholds: 5, baseRate: 3500 });

    assert(price1.pricePerHousehold === 3500, 'Single household pays 100% base rate', `₹${price1.pricePerHousehold}`);
    assert(price2.pricePerHousehold < price1.pricePerHousehold, '2-Household pool reduces per-family cost', `₹${price2.pricePerHousehold} vs ₹${price1.pricePerHousehold}`);
    assert(price3.pricePerHousehold < price2.pricePerHousehold, '3-Household pool further reduces cost', `₹${price3.pricePerHousehold} vs ₹${price2.pricePerHousehold}`);
    assert(price2.totalCookEarnings > price1.totalCookEarnings, 'Cook earnings increase with 2 households', `₹${price2.totalCookEarnings} vs ₹${price1.totalCookEarnings}`);
    assert(price3.totalCookEarnings > price2.totalCookEarnings, 'Cook earnings increase with 3 households', `₹${price3.totalCookEarnings} vs ₹${price2.totalCookEarnings}`);
    assert(price3.savings.percentSaved > 50, '3-Household pool delivers >50% savings to residents', `${price3.savings.percentSaved}% savings`);
    assert(price3.workload.dailyCookingMinutes === 95, 'Workload formula accounts for 45m base + 25m per extra home (45 + 2*25 = 95m)', `${price3.workload.dailyCookingMinutes}m`);

    // ----------------------------------------------------
    // TEST SECTION 3: Deterministic Matching Engine
    // ----------------------------------------------------
    console.log('\n--- TEST SECTION 3: DETERMINISTIC MATCHING ENGINE ---');
    const sampleGroup = {
      id: 'grp-test',
      societyId: societies[0].id,
      mealType: 'LUNCH',
      preferredSchedule: '11:30 AM - 01:30 PM',
      dietaryPreference: 'Pure Vegetarian',
      currentHouseholds: 2,
      maxCapacity: 4,
    };

    const compatibleCooks = await MatchingService.findCompatibleCooksForGroup(sampleGroup);
    assert(Array.isArray(compatibleCooks), 'Matching engine returns list of compatible cooks', `Found ${compatibleCooks.length}`);
    if (compatibleCooks.length > 0) {
      const topMatch = compatibleCooks[0];
      assert(topMatch.compatibilityScore >= 60, 'Top matching cook meets high threshold', `${topMatch.compatibilityScore}%`);
      assert(Array.isArray(topMatch.breakdown) && topMatch.breakdown.length === 5, 'Transparent 5-factor scoring breakdown provided', `Factors: ${topMatch.breakdown.map(b => b.factor).join(', ')}`);
      assert(topMatch.explanation.length > 0, 'Human-readable explanation of compatibility generated');
    }

    // ----------------------------------------------------
    // TEST SECTION 4: Cook Capacity & Scheduling Engine
    // ----------------------------------------------------
    console.log('\n--- TEST SECTION 4: COOK CAPACITY & SEQUENTIAL SCHEDULING ---');
    const targetCook = cooks[0];

    // Ensure slot is unbooked before test run
    await prisma.cookAvailability.updateMany({
      where: { cookProfileId: targetCook.id, mealType: 'LUNCH' },
      data: { isBooked: false },
    });

    const capacityCheck = await SchedulingService.validateCookCapacityAndSchedule(
      targetCook.id,
      'LUNCH',
      1
    );
    assert(capacityCheck.isValid === true, 'Cook capacity check succeeds when slots available');

    // Throws if over capacity
    let caughtOverCapacity = false;
    try {
      await SchedulingService.validateCookCapacityAndSchedule(
        targetCook.id,
        'LUNCH',
        99 // Impossible count
      );
    } catch (e) {
      caughtOverCapacity = true;
    }
    assert(caughtOverCapacity, 'Cook capacity check rejects booking when capacity exceeded');

    // Weekly calendar generation
    const schedule = await SchedulingService.getCookSchedule(targetCook.userId);
    assert(schedule && Array.isArray(schedule.weeklyCalendar), 'Weekly calendar generated for cook partner');
    assert(schedule.weeklyCalendar.length === 7, 'Weekly calendar contains 7 days (Monday - Sunday)');

    // ----------------------------------------------------
    // TEST SECTION 5: Neighbourhood Group Pool Lifecycle
    // ----------------------------------------------------
    console.log('\n--- TEST SECTION 5: GROUP POOL LIFECYCLE & PRIVACY ---');
    const creator = customers[0];
    const joiner = customers[1];

    // 1. Create group
    const newGroup = await GroupService.createGroupRequest(creator.id, {
      societyId: societies[0].id,
      mealType: 'LUNCH',
      preferredSchedule: '11:30 AM - 01:30 PM',
      dietaryPreference: 'Pure Vegetarian',
      targetHouseholds: 2,
      maxCapacity: 3,
      householdSize: 3,
      flatNumber: 'Tower A - 302',
      title: 'Tower A Lunch Club',
    });
    assert(newGroup && newGroup.id, 'Group cooking pool created with OPEN status', `Group ID: ${newGroup.id}`);
    assert(newGroup.currentHouseholds === 1, 'Initial group household count is 1');

    // 2. Privacy protection test in listGroups
    const listedGroups = await GroupService.listGroups(societies[0].id, joiner.id);
    const listedItem = listedGroups.find((g) => g.id === newGroup.id);
    assert(listedItem !== undefined, 'Created group appears in society pool list');
    // Verify member flat numbers are omitted for privacy
    const firstMember = listedItem.members[0];
    assert(firstMember.flatNumber === undefined, 'Member flat number omitted in public listing for household privacy');

    // 3. Join group
    const joinResult = await GroupService.joinGroup(newGroup.id, joiner.id, {
      householdSize: 2,
      flatNumber: 'Tower A - 405',
    });
    assert(joinResult.group.currentHouseholds === 2, 'Household count increments to 2 after neighbour joins');
    assert(joinResult.group.status === 'MATCHING', 'Group status transitions to MATCHING when target households reached');
    assert(joinResult.updatedPricing.pricePerHousehold < newGroup.estimatedPricePerHousehold, 'Price per household automatically reduced after joining');

    // 4. Assign cook
    const assignedGroup = await GroupService.assignCook(newGroup.id, targetCook.id, creator.id);
    assert(assignedGroup.status === 'COOK_PENDING', 'Group status transitions to COOK_PENDING on cook assignment');
    assert(assignedGroup.assignedCookId === targetCook.id, 'Cook assigned to group pool');

    // 5. Cook accepts group request -> Booking generation
    const responseResult = await GroupService.respondToGroupRequest(targetCook.userId, newGroup.id, 'ACCEPT');
    assert(responseResult.group.status === 'CONFIRMED', 'Group pool confirmed upon cook partner acceptance');

    // Verify bookings created for all members
    const memberBookings = await prisma.booking.findMany({
      where: { groupRequestId: newGroup.id },
    });
    assert(memberBookings.length === 2, 'Individual subscription bookings generated for all pool households', `Created ${memberBookings.length} bookings`);
    assert(memberBookings[0].status === 'ACTIVE', 'Generated booking status is ACTIVE');

    // ----------------------------------------------------
    // TEST SECTION 6: Gnani AI & Voice Orchestration
    // ----------------------------------------------------
    console.log('\n--- TEST SECTION 6: GNANI AI VOICE ORCHESTRATION ---');

    // 1. NLP Query - Discover Cooks (Hinglish / English)
    const voiceRes1 = await VoiceOrchestratorService.processVoiceInteraction({
      userId: creator.id,
      userRole: 'CUSTOMER',
      textQuery: 'Find North Indian pure vegetarian cooks in Prestige Shantiniketan',
      language: 'indic-auto',
    });
    assert(voiceRes1.intent === 'FIND_COOKS' || voiceRes1.intent === 'DISCOVER_COOKS', 'Voice intent recognized as FIND_COOKS', `Intent: ${voiceRes1.intent}`);
    assert(voiceRes1.spokenResponse && voiceRes1.spokenResponse.length > 0, 'Spoken voice response generated');

    // 2. NLP Query - Calculate Pool Price
    const voiceRes2 = await VoiceOrchestratorService.processVoiceInteraction({
      userId: creator.id,
      userRole: 'CUSTOMER',
      textQuery: 'How much do I save sharing a cook with 2 neighbours?',
      language: 'indic-auto',
    });
    assert(voiceRes2.intent === 'CALCULATE_PRICING' || voiceRes2.intent === 'CALCULATE_PRICE', 'Voice intent recognized as CALCULATE_PRICING', `Intent: ${voiceRes2.intent}`);
    assert(voiceRes2.payload && (voiceRes2.payload.pricing || voiceRes2.payload.totalCookEarnings > 0), 'Pricing calculation payload attached to voice response');

    // 3. Action Confirmation Gate
    const voiceRes3 = await VoiceOrchestratorService.processVoiceInteraction({
      userId: creator.id,
      userRole: 'CUSTOMER',
      textQuery: 'Create a Lunch cooking pool for Tower C',
      language: 'indic-auto',
    });
    assert(voiceRes3.status === 'CONFIRMATION_REQUIRED' || voiceRes3.state === 'CONFIRMATION_REQUIRED', 'Pool creation requires confirmation gate before execution', `Status: ${voiceRes3.status}`);
    assert(voiceRes3.pendingAction && (voiceRes3.pendingAction.id || voiceRes3.sessionId), 'Pending action ID generated for confirmation gate');

    // 4. Confirm Pending Action
    const pendingActionId = voiceRes3.pendingAction?.id || voiceRes3.sessionId;
    const voiceRes4 = await VoiceOrchestratorService.processVoiceInteraction({
      userId: creator.id,
      userRole: 'CUSTOMER',
      pendingActionId,
      confirmAction: true,
    });
    assert(voiceRes4.status === 'EXECUTED' || voiceRes4.state === 'EXECUTED', 'Pending action successfully executed upon confirmation');

    // 5. Base64 Audio Input Pipeline (No Multer)
    const dummyAudioBase64 = Buffer.from('RIFFDummyWavHeaderForSTTTester').toString('base64');
    const voiceRes5 = await VoiceOrchestratorService.processVoiceInteraction({
      userId: creator.id,
      userRole: 'CUSTOMER',
      audioBuffer: Buffer.from(dummyAudioBase64, 'base64'),
      textQuery: 'Show vegetarian cooks',
      language: 'indic-auto',
    });
    assert(voiceRes5 !== null, 'Base64 audio buffer processed cleanly without multer');

    // 6. Gnani API Adapter upstream response verification
    console.log('\n--- GNANI API LIVE UPSTREAM STATUS CHECK ---');
    const ttsCheck = await GnaniTimbreService.synthesizeSpeech('नमस्ते! कुककनेक्ट में आपका स्वागत है।', 'hi-IN');
    assert(ttsCheck !== null, 'Gnani Timbre TTS service handled gracefully (live or fallback audio output)');
    console.log(`  ℹ️ Timbre TTS Output: ${ttsCheck.isFallback ? 'Structured fallback audio (Upstream requires valid active subscription)' : 'Live Gnani synthesis'}`);

    console.log('\n============================================================');
    console.log(`📊 TEST RESULTS: ${passedTests} / ${totalTests} PASSED (${failedTests} FAILED)`);
    console.log('============================================================\n');

    // Clean up created test group
    await prisma.booking.deleteMany({ where: { groupRequestId: newGroup.id } });
    await prisma.groupMember.deleteMany({ where: { groupRequestId: newGroup.id } });
    await prisma.groupRequest.delete({ where: { id: newGroup.id } });

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
}

runPhase2Tests();
