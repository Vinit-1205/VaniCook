import prisma from '../../config/database.js';
import { GnaniPrismaService } from './prisma.service.js';
import { GnaniTimbreService } from './timbre.service.js';
import { PricingService } from '../pricing.service.js';
import { MatchingService } from '../matching.service.js';
import { GroupService } from '../group.service.js';
import { SchedulingService } from '../scheduling.service.js';

export class VoiceOrchestratorService {
  /**
   * Process incoming voice query (or text fallback)
   */
  static async processVoiceInteraction({
    userId,
    userRole = 'CUSTOMER',
    audioBuffer,
    textQuery,
    language = 'indic-auto',
    pendingActionId,
    confirmAction = false,
  }) {
    let transcript = textQuery || '';
    let detectedLanguage = language;
    let sttSource = 'text_input';

    // 1. Retrieve user context & primary residential society
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        householdLocations: {
          where: { isPrimary: true },
          include: { society: true },
        },
        cookProfile: true,
      },
    });

    const societyId = user?.householdLocations?.[0]?.societyId;
    const societyName = user?.householdLocations?.[0]?.society?.name || 'Prestige Shantiniketan';

    // 2. Check for Pending Confirmation Execution (Action confirmation gate)
    if (pendingActionId && confirmAction) {
      return this.executeConfirmedVoiceAction(pendingActionId, user);
    }

    // 3. Speech-to-Text Transcription via Gnani Prisma if audio is provided
    if (audioBuffer && audioBuffer.length > 0) {
      const sttResult = await GnaniPrismaService.transcribeAudio(audioBuffer, language);
      if (sttResult.success && sttResult.transcript) {
        transcript = sttResult.transcript;
        detectedLanguage = sttResult.detectedLanguage || language;
        sttSource = sttResult.source;
      } else {
        // Log upstream status and keep any passed text
        sttSource = sttResult.source;
      }
    }

    if (!transcript || transcript.trim() === '') {
      const promptText =
        language.startsWith('mr')
          ? 'Krupaya punha bola, aamhi aiku shaklo nahi.'
          : language.startsWith('hi')
          ? 'कृपया दोबारा बोलिए, हम आपकी आवाज़ सुन नहीं पाए।'
          : 'Please speak again, we could not capture your voice.';

      const tts = await GnaniTimbreService.synthesizeSpeech(
        promptText,
        language.startsWith('mr') ? 'mr-IN' : language.startsWith('hi') ? 'hi-IN' : 'en-IN'
      );

      return {
        state: 'LISTENING',
        status: 'LISTENING',
        transcript: '',
        responseText: promptText,
        spokenResponse: promptText,
        audioBase64: tts.audioBase64,
        ttsSource: tts.source,
        sttSource,
      };
    }

    // 4. Intent & Entity Extraction
    const parsedIntent = this.extractIntentAndEntities(transcript, userRole);

    // 5. Business Execution based on Intent
    let resultPayload = null;
    let responseText = '';
    let voiceState = 'SPEAKING';
    let pendingAction = null;

    switch (parsedIntent.intent) {
      case 'FIND_COOKS': {
        const cooks = await prisma.cookProfile.findMany({
          where: {
            isVerified: true,
            societiesServed: societyId ? { some: { societyId } } : undefined,
          },
          include: {
            user: { select: { fullName: true } },
          },
          take: 3,
        });

        resultPayload = { cooks };

        if (detectedLanguage.startsWith('mr') || transcript.includes('majhya')) {
          responseText = `${societyName} madhye ${cooks.length} verified cook uplabdha aahat. Sunita Devi phulka aani dal tadka sathi prasiddha aahat.`;
        } else if (detectedLanguage.startsWith('hi') || transcript.includes('mein') || transcript.includes('chahiye')) {
          responseText = `Aapke ${societyName} mein ${cooks.length} verified cooks uplabdh hain. Inme se Sunita Devi ko 4.9 rating mili hai.`;
        } else {
          responseText = `I found ${cooks.length} verified cooks available in ${societyName}. Sunita Devi is rated 4.9 stars for North Indian meals.`;
        }
        break;
      }

      case 'CREATE_GROUP_REQUEST': {
        // Needs Confirmation before write!
        voiceState = 'CONFIRMATION_REQUIRED';
        pendingAction = {
          type: 'CREATE_GROUP_REQUEST',
          userId: user.id,
          societyId: societyId || 'soc_prestige_01',
          mealType: parsedIntent.entities.mealType || 'DINNER',
          targetHouseholds: parsedIntent.entities.households || 3,
          dietaryPreference: parsedIntent.entities.diet || 'Pure Vegetarian',
        };

        if (detectedLanguage.startsWith('mr')) {
          responseText = `Aamhi ${societyName} madhye ${pendingAction.targetHouseholds} kutumbansathi ${pendingAction.mealType} pool create karat aahot. Krupaya confirm kara.`;
        } else if (detectedLanguage.startsWith('hi')) {
          responseText = `Kya aap ${societyName} mein ${pendingAction.targetHouseholds} parivaaron ke liye ${pendingAction.mealType} pool shuru karna chahte hain? Confirm kijiye.`;
        } else {
          responseText = `Should I create a neighbourhood ${pendingAction.mealType} cooking pool for ${pendingAction.targetHouseholds} families in ${societyName}? Please confirm.`;
        }
        break;
      }

      case 'CALCULATE_PRICING': {
        const households = parsedIntent.entities.households || 3;
        const pricing = PricingService.calculatePoolPrice({
          totalHouseholds: households,
          baseRate: 3600,
        });

        resultPayload = { pricing };

        if (detectedLanguage.startsWith('mr')) {
          responseText = `${households} kutumba cook share kartil tar pratyekala mahinyala fakt ₹${pricing.pricePerHousehold} lagtil. Tumhi ${pricing.savingsPercent}% bachat karu shakta.`;
        } else if (detectedLanguage.startsWith('hi')) {
          responseText = `Agar ${households} parivaar ek cook share karte hain, toh har parivaar ko ₹${pricing.pricePerHousehold} lagenge. Aap ${pricing.savingsPercent}% ki bachat karenge!`;
        } else {
          responseText = `When ${households} families share one cook in your tower, each household pays just ₹${pricing.pricePerHousehold} per month, saving ${pricing.savingsPercent}%.`;
        }
        break;
      }

      case 'COOK_VIEW_SCHEDULE': {
        const schedule = await SchedulingService.getCookSchedule(user.id);
        resultPayload = { schedule };
        const activeCount = schedule.capacity.currentlyBooked;

        if (detectedLanguage.startsWith('mr')) {
          responseText = `Aaple aaj ${activeCount} gharansathi sequential cooking visits schedule aahet. Sarva flats ekach building madhye aahat.`;
        } else if (detectedLanguage.startsWith('hi')) {
          responseText = `Aaj aapke ${activeCount} households ke visits scheduled hain. Sabhi flats ek hi society mein hain.`;
        } else {
          responseText = `You have ${activeCount} household visits scheduled today in ${societyName}. All flats are within the same tower.`;
        }
        break;
      }

      case 'COOK_VIEW_EARNINGS': {
        const cookProf = user.cookProfile;
        const activeBookings = await prisma.booking.findMany({
          where: { cookProfileId: cookProf?.id, status: 'ACTIVE' },
        });

        const totalEarned = activeBookings.reduce((sum, b) => sum + b.monthlyRate, 0);

        if (detectedLanguage.startsWith('hi')) {
          responseText = `Is mahine aapki anumanit kamai lagbhag ₹${totalEarned.toLocaleString('en-IN')} hai multi-household pools ke sath.`;
        } else {
          responseText = `Your estimated monthly earnings this month are ₹${totalEarned.toLocaleString('en-IN')} across your assigned households.`;
        }
        break;
      }

      case 'COOK_VIEW_REQUESTS': {
        const cookProf = user.cookProfile;
        const [pendingBookings, pendingPools] = await Promise.all([
          prisma.booking.count({ where: { cookProfileId: cookProf?.id, status: 'PENDING' } }),
          prisma.groupRequest.count({ where: { assignedCookId: cookProf?.id, status: 'COOK_PENDING' } }),
        ]);

        const totalPending = pendingBookings + pendingPools;
        resultPayload = { pendingBookings, pendingPools, totalPending };

        if (detectedLanguage.startsWith('hi')) {
          responseText = totalPending > 0
            ? `Aapke paas ${totalPending} naye requests decision ke liye pending hain. Kripya Cook Hub mein review kijiye.`
            : `Abhi koi naya request pending nahi hai.`;
        } else {
          responseText = totalPending > 0
            ? `You have ${totalPending} incoming booking and pool requests awaiting your review in the Cook Hub.`
            : `You have no pending requests at the moment.`;
        }
        break;
      }

      case 'CHECK_BOOKINGS': {
        const bookings = await prisma.booking.findMany({
          where: { customerId: user.id },
          include: { cookProfile: { include: { user: true } } },
        });

        const activeCount = bookings.filter((b) => b.status === 'ACTIVE' || b.status === 'CONFIRMED').length;
        resultPayload = { bookings, activeCount };

        if (detectedLanguage.startsWith('hi')) {
          responseText = activeCount > 0
            ? `Aapke paas ${activeCount} active cooking subscriptions hain.`
            : `Aapki koi active booking nahi hai. Aap Discover Cooks se booking shuru kar sakte hain.`;
        } else {
          responseText = activeCount > 0
            ? `You have ${activeCount} active household cooking subscription(s) in your society.`
            : `You currently have no active subscriptions. You can discover verified cooks or create a neighbourhood pool anytime!`;
        }
        break;
      }

      case 'FIND_POOLS': {
        const pools = await prisma.groupRequest.findMany({
          where: {
            societyId: societyId || undefined,
            status: { in: ['OPEN', 'MATCHING'] },
          },
          take: 3,
        });

        resultPayload = { pools };

        if (detectedLanguage.startsWith('hi')) {
          responseText = pools.length > 0
            ? `Aapke ${societyName} mein ${pools.length} open neighbourhood pools hain. Inme judkar aap 50% tak bachat kar sakte hain.`
            : `Abhi koi open pool nahi hai. Aap khud ek naya pool bana sakte hain!`;
        } else {
          responseText = pools.length > 0
            ? `There are ${pools.length} forming cooking pool(s) in ${societyName}. Joining saves up to 50% on your monthly cooking costs.`
            : `There are no open pools right now in ${societyName}. You can start one with one click!`;
        }
        break;
      }

      default: {
        responseText =
          'I understood your query. You can ask me to find cooks, calculate group pool savings, or manage your daily visiting schedule.';
      }
    }

    // 6. Text-to-Speech Generation via Gnani Timbre
    let ttsLang = 'en-IN';
    let ttsVoice = 'Nalini';

    if (detectedLanguage.startsWith('hi') || transcript.includes('mein') || transcript.includes('karna')) {
      ttsLang = 'hi-IN';
      ttsVoice = 'Nalini';
    } else if (detectedLanguage.startsWith('mr') || transcript.includes('majhya') || transcript.includes('shodhaycha')) {
      ttsLang = 'mr-IN';
      ttsVoice = 'Meera';
    }

    const ttsResult = await GnaniTimbreService.synthesizeSpeech(
      responseText,
      ttsLang,
      ttsVoice
    );

    // Save VoiceSession record for session state
    const sessionRecord = await prisma.voiceSession.create({
      data: {
        userId: user.id,
        intent: parsedIntent.intent,
        state: voiceState,
        language: ttsLang,
        transcript,
        pendingAction: pendingAction || undefined,
        sessionData: resultPayload || undefined,
      },
    });

    if (pendingAction) {
      pendingAction.id = sessionRecord.id;
    }

    return {
      sessionId: sessionRecord.id,
      state: voiceState,
      status: voiceState,
      intent: parsedIntent.intent,
      transcript,
      transcribedText: transcript,
      responseText,
      spokenResponse: responseText,
      audioBase64: ttsResult.audioBase64,
      ttsSource: ttsResult.source,
      sttSource,
      pendingAction,
      resultPayload,
      payload: resultPayload,
    };
  }

  /**
   * Natural Language Intent & Entity Extraction (supports Marathi, Hindi, English, Hinglish)
   */
  static extractIntentAndEntities(text, userRole) {
    const lower = text.toLowerCase();
    const entities = {};

    // Detect household count entities (e.g. teen, 3, don, two)
    if (lower.includes('teen') || lower.includes('3') || lower.includes('three')) {
      entities.households = 3;
    } else if (lower.includes('chaar') || lower.includes('4') || lower.includes('four')) {
      entities.households = 4;
    } else if (lower.includes('don') || lower.includes('2') || lower.includes('two') || lower.includes('do ')) {
      entities.households = 2;
    }

    // Detect meal type
    if (lower.includes('dinner') || lower.includes('sandhyakal') || lower.includes('raat')) {
      entities.mealType = 'DINNER';
    } else if (lower.includes('breakfast') || lower.includes('morning') || lower.includes('sakal')) {
      entities.mealType = 'BREAKFAST';
    } else if (lower.includes('lunch') || lower.includes('dupari') || lower.includes('dopahar')) {
      entities.mealType = 'LUNCH';
    }

    // Detect diet
    if (lower.includes('jain')) {
      entities.diet = 'Jain Friendly';
    } else if (lower.includes('non veg') || lower.includes('chicken') || lower.includes('fish')) {
      entities.diet = 'Non-Vegetarian';
    } else {
      entities.diet = 'Pure Vegetarian';
    }

    // Role-specific cook intents
    if (userRole === 'COOK') {
      if (lower.includes('request') || lower.includes('inquiry') || lower.includes('pending') || lower.includes('naya')) {
        return { intent: 'COOK_VIEW_REQUESTS', entities };
      }
      if (lower.includes('schedule') || lower.includes('booking') || lower.includes('aaj') || lower.includes('visit')) {
        return { intent: 'COOK_VIEW_SCHEDULE', entities };
      }
      if (lower.includes('earning') || lower.includes('kamai') || lower.includes('payment') || lower.includes('income')) {
        return { intent: 'COOK_VIEW_EARNINGS', entities };
      }
      if (lower.includes('available') || lower.includes('morning') || lower.includes('slot')) {
        return { intent: 'COOK_UPDATE_AVAILABILITY', entities };
      }
      if (lower.includes('accept') || lower.includes('ha')) {
        return { intent: 'COOK_ACCEPT_BOOKING', entities };
      }
    }

    // Customer intents
    if (lower.includes('my booking') || lower.includes('meri booking') || lower.includes('check booking') || lower.includes('subscription')) {
      return { intent: 'CHECK_BOOKINGS', entities };
    }
    if (lower.includes('show pool') || lower.includes('open pool') || lower.includes('find pool') || lower.includes('konta pool')) {
      return { intent: 'FIND_POOLS', entities };
    }
    if (lower.includes('share') || lower.includes('pool') || lower.includes('group') || lower.includes('teen families') || lower.includes('create pool')) {
      return { intent: 'CREATE_GROUP_REQUEST', entities };
    }
    if (lower.includes('save') || lower.includes('cost') || lower.includes('price') || lower.includes('bachat') || lower.includes('kharcha')) {
      return { intent: 'CALCULATE_PRICING', entities };
    }
    if (lower.includes('cook') || lower.includes('shodh') || lower.includes('chahiye') || lower.includes('find')) {
      return { intent: 'FIND_COOKS', entities };
    }

    return { intent: 'GENERAL_QUERY', entities };
  }

  /**
   * Execute voice action after user confirmation
   */
  static async executeConfirmedVoiceAction(sessionId, user) {
    const session = await prisma.voiceSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.pendingAction) {
      throw new Error('No pending action found to confirm.');
    }

    const action = session.pendingAction;
    let confirmationMessage = '';

    if (action.type === 'CREATE_GROUP_REQUEST') {
      const created = await GroupService.createGroupRequest(user.id, {
        societyId: action.societyId,
        mealType: action.mealType,
        targetHouseholds: action.targetHouseholds,
        dietaryPreference: action.dietaryPreference,
      });

      confirmationMessage = `Great! Your neighbourhood ${action.mealType} group pool has been created. Neighbours can now join your pool.`;
    }

    await prisma.voiceSession.update({
      where: { id: sessionId },
      data: {
        state: 'EXECUTED',
        pendingAction: null,
      },
    });

    const tts = await GnaniTimbreService.synthesizeSpeech(confirmationMessage, 'en-IN');

    return {
      state: 'EXECUTED',
      status: 'EXECUTED',
      responseText: confirmationMessage,
      spokenResponse: confirmationMessage,
      audioBase64: tts.audioBase64,
    };
  }
}
