const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic();

// ─── In-memory history cache ─────────────────────────────────────────────────
const conversationCache = new Map();

// ─── Trade-specific intelligence ─────────────────────────────────────────────
// Every entry: commonJobs, urgencyPhrases, urgencyNote, qualifyingQuestions,
// pricingContext, bookingInfo
const TRADE_CONTEXT = {

  // ── PLUMBING ────────────────────────────────────────────────────────────────
  Plumber: {
    commonJobs: 'drain cleaning, water heater repair/install (tank & tankless), toilet repair/replacement, faucet install, pipe repair/repipe, sewer line inspection/repair, garbage disposal install, leak detection, water softener install, sump pump, shower/tub install, whole-house repiping, gas line work',
    urgencyPhrases: [
      'leaking','flooding','flooded','burst pipe','pipe burst','broken pipe',
      'no water','sewage','sewer backup','drain backup','overflow','overflowing',
      'toilet overflowing','no hot water','water everywhere','gushing',
      'dripping from ceiling','wet ceiling','water heater burst','gas smell','smell gas',
    ],
    urgencyNote: 'Active leaks, burst pipes, sewage backup, no water, gas smell, or no hot water — emergency. Notify owner immediately and tell customer to shut off the main if actively flooding.',
    qualifyingQuestions: "What's the issue and where in the home? Is water actively leaking right now? How long has this been happening?",
    pricingContext: 'Service call $75–$150. Water heater install $800–$1,800 (tank) or $1,500–$3,500 (tankless). Drain clearing $150–$350. Toilet replacement $250–$450. Faucet install $150–$350. Emergency/after-hours 1.5–2× standard.',
    bookingInfo: 'Ask: what is the specific issue, and what is the address?',
  },

  // ── HVAC ────────────────────────────────────────────────────────────────────
  HVAC: {
    commonJobs: 'AC tune-up/service, furnace inspection/cleaning, duct cleaning, refrigerant recharge, compressor/capacitor/coil replacement, thermostat install, new system install (central AC, furnace, heat pump, mini-split, ductless), filter replacement, air quality testing, zone system, UV air purifier',
    urgencyPhrases: [
      'no heat','no ac','not cooling','not heating','ac down','ac stopped',
      'furnace out','heat stopped','hvac out','freezing inside',
      'burning smell from vents','unit stopped','ac not working','heater not working',
      'no air conditioning','blowing warm air','blowing hot air',
    ],
    urgencyNote: 'No heat in cold weather or no AC in extreme heat are emergencies — families and elderly are at risk. Notify owner immediately.',
    qualifyingQuestions: "Is the system not turning on at all, or running but not heating/cooling? What does the thermostat show? How old is the system and what brand?",
    pricingContext: 'Service/diagnostic call $85–$175. Tune-up $89–$179. Refrigerant recharge $200–$500. Capacitor replacement $150–$400. New central AC install $3,500–$7,500. New furnace $2,500–$5,500. Mini-split installed $2,000–$5,000.',
    bookingInfo: 'Ask: what is happening, address, and rough age of the system.',
  },

  // ── ELECTRICAL ──────────────────────────────────────────────────────────────
  Electrician: {
    commonJobs: 'outlet/switch install, panel upgrade/replacement, EV charger install (Level 2), ceiling fan install, outdoor/landscape/security lighting, generator hookup and transfer switch, whole-home rewire, smoke/CO detector install, circuit breaker replacement, dedicated circuit, bath fan, under-cabinet lighting, hot tub wiring',
    urgencyPhrases: [
      'no power','sparking','sparks','burning smell','outlet not working','power out',
      'flickering lights','hot outlet','tripped breaker won\'t reset','smell of burning',
      'electrical fire','smoking outlet','arc fault','buzzing outlet','crackling sound',
      'lights flickering throughout house',
    ],
    urgencyNote: 'Sparking, burning smells, smoking outlets, or any potential fire hazard — safety emergency. Notify owner immediately. Tell customer to avoid that circuit/panel until a tech arrives.',
    qualifyingQuestions: "What's the specific issue and what area of the home? Is it one outlet/circuit or broader? Have you tried resetting the breakers?",
    pricingContext: 'Service call $75–$150. Outlet install $150–$300. Panel upgrade $1,500–$4,500. EV charger $500–$1,200. Ceiling fan $150–$300. Generator hookup $500–$1,500. Labor $85–$150/hr.',
    bookingInfo: 'Ask: specific issue and address.',
  },

  // ── ROOFING ─────────────────────────────────────────────────────────────────
  Roofer: {
    commonJobs: 'shingle repair, full roof replacement (shingle, tile, metal, TPO/flat), gutter install/cleaning/repair, fascia/soffit repair, roof inspection, storm/hail damage assessment, skylight install, chimney flashing repair, ridge vent, ice dam removal, roof coating',
    urgencyPhrases: [
      'leaking roof','water coming in','ceiling is wet','wet ceiling','ceiling stain',
      'storm damage','shingles off','missing shingles','hole in roof','roof collapsed',
      'hail damage','tree fell','tree on roof','wind damage','active leak','raining inside',
      'water dripping','ceiling dripping',
    ],
    urgencyNote: 'Active water intrusion, storm damage, or tree impact — notify owner immediately. Interior damage compounds by the hour.',
    qualifyingQuestions: "What type of roof (shingle, tile, metal, flat)? Roughly how old? Is there active water coming inside right now?",
    pricingContext: 'Roof inspection $150–$300 (often credited toward repair). Shingle repair $300–$1,500. Full replacement $8,000–$18,000 depending on size/material. Gutter install $1,500–$3,000. Always an in-person assessment before a firm quote.',
    bookingInfo: 'Ask: type of issue and property address. A crew will assess before any work begins.',
  },

  // ── LANDSCAPING / LAWN CARE ─────────────────────────────────────────────────
  Landscaper: {
    commonJobs: 'lawn mowing, edging, trimming, leaf/debris cleanup, mulching, planting, irrigation install/repair, tree and shrub trimming, sod install, fertilization, aerating, overseeding, weed control, flower bed maintenance, yard grading, drainage solutions, retaining walls',
    urgencyPhrases: [
      'hoa violation','hoa letter','hoa deadline','hoa inspection','code enforcement',
      'party this weekend','wedding','event this week','guests coming',
      'sell the house','listing this week','going on market','citation','fine','overgrown',
    ],
    urgencyNote: 'HOA deadlines, property sale/listing prep, or events this week are time-sensitive — check schedule and flag to owner.',
    qualifyingQuestions: "What services are you looking for? One-time or recurring? Roughly how large is the yard?",
    pricingContext: 'Mowing starts $40–$80 (up to 5,000 sq ft), more for larger properties. Seasonal cleanup $200–$600. Mulch $300–$800. Sod varies by sq footage. Irrigation varies by scope.',
    bookingInfo: 'Ask: services needed, property address, and one-time vs. recurring.',
  },

  // ── PEST CONTROL ────────────────────────────────────────────────────────────
  'Pest Control': {
    commonJobs: 'ant treatment, general pest control, rodent exclusion/trapping, cockroach treatment, bed bug inspection and treatment, termite inspection/treatment (liquid and bait), bee/wasp/hornet removal, spider treatment, flea/tick treatment, mosquito control, wildlife removal (squirrels, raccoons, birds)',
    urgencyPhrases: [
      'bees','wasps','hornets','yellow jackets','nest inside','bees in walls',
      'ants everywhere','cockroaches','roaches','rats','mice','bed bugs','bedbugs',
      'termites','swarm','swarming','infestation','can\'t sleep','bites all over',
      'saw a rat','mouse in kitchen','rodents','raccoon in attic','squirrel in attic',
    ],
    urgencyNote: 'Active bee/wasp nests near entry points, rodents in living areas, bed bugs, or termite swarms — urgent. Flag to owner for same-day or next-day dispatch.',
    qualifyingQuestions: "What kind of pest? Where are you seeing them — inside, outside, or both? How long has this been going on, and how severe does it seem?",
    pricingContext: 'Initial general pest treatment $150–$350. Termite inspection $75–$150. Monthly/quarterly plans $40–$80/visit. Bed bug treatment $500–$1,500. Rodent exclusion $300–$800. Bee removal $150–$450.',
    bookingInfo: 'Ask: type of pest, property address, and approximate home size.',
  },

  // ── EXTERMINATOR (alias) ─────────────────────────────────────────────────────
  Exterminator: {
    commonJobs: 'ant treatment, general pest control, rodent exclusion/trapping, cockroach treatment, bed bug inspection and treatment, termite inspection/treatment, bee/wasp removal, spider treatment, flea treatment, mosquito control, wildlife removal',
    urgencyPhrases: [
      'bees','wasps','hornets','yellow jackets','nest inside','bees in walls',
      'ants everywhere','cockroaches','roaches','rats','mice','bed bugs','bedbugs',
      'termites','swarm','swarming','infestation','can\'t sleep','bites all over',
      'saw a rat','mouse in kitchen',
    ],
    urgencyNote: 'Active bee/wasp nests, visible rodents in living areas, bed bugs, or termite swarms — urgent.',
    qualifyingQuestions: "What kind of pest? Where are you seeing them? How long, and how severe?",
    pricingContext: 'Initial treatment $150–$350. Termite inspection $75–$150. Monthly plans $40–$80/visit. Bed bug treatment $500–$1,500. Rodent exclusion $300–$800.',
    bookingInfo: 'Ask: type of pest, address, and home size.',
  },

  // ── HOUSE CLEANER ────────────────────────────────────────────────────────────
  'House Cleaner': {
    commonJobs: 'standard cleaning, deep cleaning, move-in/move-out cleaning, post-construction cleaning, recurring weekly/biweekly/monthly service, Airbnb/VRBO turnover cleaning, office cleaning, carpet cleaning, window cleaning, organization services',
    urgencyPhrases: [
      'guests tonight','guests tomorrow','party tonight','party tomorrow',
      'move-out today','move-out tomorrow','inspection today','inspection tomorrow',
      'showing today','showing tomorrow','airbnb guest','vrbo guest','host tonight',
      'check-in today','need it done today','asap','emergency clean',
    ],
    urgencyNote: 'Same-day or next-day needs for events, move-outs, or rental turnovers — urgent. Check schedule and notify owner immediately.',
    qualifyingQuestions: "How many bedrooms and bathrooms? Is this a one-time clean (standard or deep) or recurring? Any specific areas of focus — oven, fridge, windows?",
    pricingContext: 'Standard: 1BR/1BA $90–$120, 2BR $130–$160, 3BR $160–$210. Deep cleans 1.5–2× standard. Move-in/out $200–$450. Recurring service typically 10–20% off. Airbnb turnovers vary by size.',
    bookingInfo: 'Ask: bedrooms/bathrooms, type of clean, and property address.',
  },

  // ── MOVER ────────────────────────────────────────────────────────────────────
  Mover: {
    commonJobs: 'local move, long-distance move, packing and unpacking service, furniture-only move, storage unit move, office/commercial relocation, single large item (piano, safe, gun safe, hot tub), junk removal, labor-only (customer provides truck), senior move management',
    urgencyPhrases: [
      'tomorrow','this weekend','last minute','move-out deadline',
      'eviction','got evicted','lease ending','lease up','need to be out by',
      'moving in two days','moving in three days','date is this week','closing this week',
    ],
    urgencyNote: 'Short-notice moves (1–3 days out) need immediate availability confirmation — flag to owner right away.',
    qualifyingQuestions: "What is the move date? Local or long distance? How large is the home — studio, 1BR, 2BR, 3BR, or full house? Any specialty items like a piano, safe, or hot tub?",
    pricingContext: 'Local: $100–$160/hr for 2-person crew, 2–3 hr minimum. Most 1–2BR local moves $350–$700. Long-distance by weight and mileage. Packing service $50–$100/hr extra. Piano moves $300–$600.',
    bookingInfo: 'Ask: move date, move-from and move-to addresses (or general area), home size, and specialty items.',
  },

  // ── GARAGE DOOR ──────────────────────────────────────────────────────────────
  'Garage Door': {
    commonJobs: 'spring replacement (torsion/extension), cable replacement, garage door opener install/replace, door panel replacement, track repair/alignment, full new door install, weatherstripping, keypad/remote programming, sensor adjustment, tune-up and lubrication',
    urgencyPhrases: [
      'stuck','won\'t open','car stuck in garage','car stuck','broken spring',
      'won\'t close','snapped cable','fell off track','opener not working','door fell',
      'can\'t get out','can\'t get in','security risk','door won\'t shut',
    ],
    urgencyNote: "Car stuck inside, door that won't close (security risk), or broken spring on primary entry — urgent. Most garage door companies offer same-day for these.",
    qualifyingQuestions: "What's happening — won't open, won't close, loud noise, or something else? Is it the opener or the door itself? How old is the door/opener?",
    pricingContext: 'Spring replacement $150–$325. Opener install $250–$500. Service call $75–$100. Cable replacement $150–$250. New door install $800–$2,500.',
    bookingInfo: 'Ask: what is happening and the address. Most garage door work is same-day.',
  },

  // ── PAINTER ──────────────────────────────────────────────────────────────────
  Painter: {
    commonJobs: 'interior room painting, full interior repaint, exterior painting/siding, cabinet painting/refinishing, deck and fence staining, garage floor epoxy coating, trim/door painting, popcorn ceiling removal, drywall texture/repair, commercial painting, pressure washing before paint',
    urgencyPhrases: [
      'hoa deadline','hoa violation','listing my house','going on market',
      'showing this week','closing next week','landlord deadline','rental inspection',
    ],
    urgencyNote: 'Homes going on the market or HOA violations with hard deadlines are time-sensitive.',
    qualifyingQuestions: "Interior, exterior, or both? How many rooms or roughly how many sq ft? Do the walls need any patching or prep work?",
    pricingContext: 'Interior per room $200–$450. Full interior (3BR home) $2,500–$6,000. Exterior $3,000–$6,500 for a typical home. Cabinets $1,500–$4,500. Deck staining $600–$2,000.',
    bookingInfo: 'Ask: interior or exterior, scope, and address. Larger jobs usually need an estimate visit.',
  },

  // ── POOL SERVICE ──────────────────────────────────────────────────────────────
  'Pool Service': {
    commonJobs: 'weekly pool maintenance, chemical balancing and testing, pool vacuuming/brushing, filter cleaning/replacement, equipment repair (pump, filter, heater, salt cell, automation), green pool recovery treatment, pool opening/closing, plaster and tile repair, leak detection, automatic cleaner service, pool drain and acid wash',
    urgencyPhrases: [
      'green pool','pool is green','cloudy water','very cloudy','pump not working',
      'pump broke','pump dead','party this weekend','event this weekend',
      'can\'t swim','pool turned green overnight','equipment alarm','water level dropping',
      'pool losing water','green overnight',
    ],
    urgencyNote: 'Green or dangerously cloudy pool before an event, broken pump, or rapidly dropping water level (possible leak) — urgent.',
    qualifyingQuestions: "What's going on — water chemistry, green/cloudy water, or equipment issue? In-ground or above-ground? Looking for ongoing service or a one-time visit?",
    pricingContext: 'Weekly service $100–$200/month. Green pool treatment $200–$500. Equipment repairs vary by component. Opening/closing $200–$400. Filter cleaning $75–$150.',
    bookingInfo: 'Ask: the issue and property address.',
  },

  // ── GENERAL CONTRACTOR ────────────────────────────────────────────────────────
  'General Contractor': {
    commonJobs: 'kitchen remodel, bathroom remodel, home addition, ADU/accessory dwelling unit, basement finish, deck/patio build, window and door install, flooring install, drywall, structural repair, foundation repair, fire/water damage restoration, code violation repairs, whole-home renovation',
    urgencyPhrases: [
      'water damage','flood damage','storm damage','roof leak came through',
      'structural issue','foundation crack','ceiling collapsed','wall caved',
      'code violation','permit deadline','tenant complaint','active leak inside',
    ],
    urgencyNote: 'Active water or structural damage — notify owner immediately. Delay increases cost and scope.',
    qualifyingQuestions: "What type of project — repair, remodel, or new construction? Rough scope and size? Do you have plans or permits? Target start date?",
    pricingContext: 'Kitchen remodel $20,000–$80,000+. Bathroom $8,000–$35,000. Basement finish $25,000–$65,000. Deck $8,000–$25,000. Always an in-person estimate for any project over $2,000.',
    bookingInfo: 'Ask: project type, address, and preferred time for a consultation/estimate.',
  },

  // ── FLOORING ─────────────────────────────────────────────────────────────────
  Flooring: {
    commonJobs: 'hardwood floor install, hardwood refinishing/sanding, LVP/LVT install, tile floor install, carpet install, carpet removal and disposal, laminate floor install, subfloor repair, transition strips, stair treads, bathroom floor tile, floor leveling',
    urgencyPhrases: [
      'going on market','listing this week','showing tomorrow','closing soon',
      'event this weekend','water damaged floor','floor warping','floor buckling',
    ],
    urgencyNote: 'Homes going on market or water-damaged/warped flooring — time-sensitive, flag to owner.',
    qualifyingQuestions: "What type of flooring are you looking to install or replace (hardwood, LVP, tile, carpet)? Approximately how many sq ft? Is there existing flooring that needs removal?",
    pricingContext: 'Hardwood install $8–$15/sq ft labor. LVP install $3–$7/sq ft labor. Tile install $8–$16/sq ft labor. Carpet install $3–$6/sq ft labor. Hardwood refinish $3–$6/sq ft. Always measure and visit for exact quote.',
    bookingInfo: 'Ask: type of floor, sq footage, and property address. Most projects need a measure appointment first.',
  },

  // ── HANDYMAN ─────────────────────────────────────────────────────────────────
  Handyman: {
    commonJobs: 'furniture assembly, TV mounting, door repair/hanging, window screen repair, drywall patching, caulking and grouting, fixture install (faucets, lights, fans), tile repair, weather stripping, shelf/blind install, deck repair, fence repair, pressure washing, gutter cleaning, small plumbing fixes, small electrical fixes',
    urgencyPhrases: [
      'broken door','door won\'t close','door won\'t lock','lock broken',
      'guests this weekend','house showing','move-out inspection','inspection tomorrow',
      'list the house this week','urgent repair',
    ],
    urgencyNote: 'Security issues (broken door/lock), move-out inspections, or house showings are time-sensitive.',
    qualifyingQuestions: "What needs to be done? Is this one task or a list of items? How many hours do you think it might take?",
    pricingContext: 'Handyman service $75–$150/hr depending on tasks. Most jobs are 1–4 hours. Minimum call-out is typically 1–2 hours. Materials extra.',
    bookingInfo: 'Ask: what tasks need to be done and the property address.',
  },

  // ── WINDOW & DOOR ────────────────────────────────────────────────────────────
  'Window Installer': {
    commonJobs: 'window replacement (single, double, casement, bay), window repair, broken glass replacement, door replacement (entry, patio, sliding glass, French), door frame repair, storm door install, screen replacement, window tinting, window caulking and sealing',
    urgencyPhrases: [
      'broken window','shattered glass','glass broken','board up','security',
      'broken door','door won\'t lock','won\'t close properly',
      'weather coming','storm tonight','rain coming in',
    ],
    urgencyNote: 'Broken glass or doors that won\'t lock are security and weather emergencies — notify owner for same-day board-up or repair.',
    qualifyingQuestions: "Is this a repair or replacement? How many windows/doors? What type — single/double-hung, casement, sliding? Do you know the approximate size?",
    pricingContext: 'Window replacement $300–$700 per window installed (standard size). Broken glass repair $100–$300. Entry door replacement $500–$2,000 installed. Patio/sliding door $800–$3,000 installed.',
    bookingInfo: 'Ask: repair or replacement, number of units, and address. An estimate visit is usually needed.',
  },

  // ── FENCE ───────────────────────────────────────────────────────────────────
  'Fence Contractor': {
    commonJobs: 'wood fence install, vinyl fence install, chain link fence, aluminum/iron fence, fence repair, fence staining/painting, gate install and repair, pool fence (code-compliant), privacy fence, picket fence, split rail fence, retaining wall combo',
    urgencyPhrases: [
      'fence fell','fence down','dog escaped','pool fence','child safety',
      'hoa deadline','permit deadline','code violation','listing this week',
    ],
    urgencyNote: 'Downed fence with pets/children, pool safety fences, or HOA compliance deadlines — time-sensitive.',
    qualifyingQuestions: "What type of fence and material (wood, vinyl, chain link, aluminum)? How many linear feet? Is this a new install or repair?",
    pricingContext: 'Wood fence $20–$45/linear ft installed. Vinyl $25–$55/linear ft. Chain link $15–$30/linear ft. Aluminum $30–$60/linear ft. Gate adds $300–$800+. Always measure for exact quote.',
    bookingInfo: 'Ask: fence type/material, linear footage if known, and property address for a free estimate.',
  },

  // ── DECK / PATIO ─────────────────────────────────────────────────────────────
  'Deck Builder': {
    commonJobs: 'new deck build (wood, composite, Trex), deck repair and board replacement, deck staining and sealing, pergola build, covered patio, patio paver install, concrete patio, deck demolition and removal, screened porch, deck railing replacement, ledger repair',
    urgencyPhrases: [
      'deck collapsed','boards rotting','unsafe','party this weekend',
      'summer coming','listing the home','hoa violation',
    ],
    urgencyNote: 'Structural safety concerns or party deadlines — flag to owner.',
    qualifyingQuestions: "New build or repair? Approximate size (sq ft)? Material preference — pressure-treated wood, cedar, or composite (Trex/TimberTech)? Single-level or multi?",
    pricingContext: 'Pressure-treated wood deck $25–$45/sq ft. Composite deck $45–$75/sq ft. Patio pavers $15–$35/sq ft installed. Pergola $5,000–$15,000 depending on size. Deck repair by scope.',
    bookingInfo: 'Ask: new build or repair, approximate size, material preference, and address.',
  },

  // ── CONCRETE & PAVING ────────────────────────────────────────────────────────
  'Concrete Contractor': {
    commonJobs: 'driveway pour/replacement, concrete patio, walkway and path, concrete repair (cracks, spalling), stamped/decorative concrete, garage floor, foundation crack repair, concrete steps, retaining wall, concrete sealing, asphalt driveway, asphalt repair/sealcoat',
    urgencyPhrases: [
      'crack getting bigger','foundation cracking','water coming in through crack',
      'driveway sinking','settling','listing the house','hoa violation',
    ],
    urgencyNote: 'Foundation cracks with water intrusion or rapidly expanding cracks — potential structural issue, notify owner promptly.',
    qualifyingQuestions: "What type of concrete work? Rough dimensions or sq footage? Is this new installation or repair? Any decorative finish (stamped, colored, exposed aggregate)?",
    pricingContext: 'Concrete driveway $6–$12/sq ft. Stamped/decorative $15–$25/sq ft. Concrete patio $6–$12/sq ft. Driveway sealcoat $0.15–$0.35/sq ft. Crack repair $300–$2,000 depending on scope.',
    bookingInfo: 'Ask: project type, approximate dimensions, and address. Most concrete work needs an in-person estimate.',
  },

  // ── DRYWALL ──────────────────────────────────────────────────────────────────
  'Drywall Contractor': {
    commonJobs: 'drywall repair (holes, water damage, cracks), drywall installation (new rooms, additions, garage), texture matching (knockdown, orange peel, smooth), popcorn ceiling removal, ceiling repair, closet build-out, fire and smoke damage repair, soundproofing installation',
    urgencyPhrases: [
      'water damage','ceiling collapsed','ceiling caving','mold visible',
      'structural damage','listing the house','showing this week',
    ],
    urgencyNote: 'Ceiling collapse, active water damage, or visible mold — urgent. Flag to owner immediately.',
    qualifyingQuestions: "Is this a repair or new installation? How large is the area? Do you need texture matching to blend with existing walls/ceilings?",
    pricingContext: 'Small hole repair $100–$300. Water damage repair $300–$1,500. Full room drywall install $1.50–$3.50/sq ft. Popcorn ceiling removal $1–$2/sq ft. Texture matching priced by job.',
    bookingInfo: 'Ask: repair or install, approximate area, and address.',
  },

  // ── INSULATION ───────────────────────────────────────────────────────────────
  'Insulation Contractor': {
    commonJobs: 'attic insulation (blown-in, batt), wall insulation, crawl space insulation and vapor barrier, spray foam insulation, garage insulation, basement insulation, insulation removal (old/damaged/rodent-infested), soundproofing, energy audit',
    urgencyPhrases: [
      'energy bill spiked','electric bill very high','drafty','freezing room',
      'hot room','attic very hot','rodents in attic insulation','mold in insulation',
    ],
    urgencyNote: 'Rodent-infested or moldy insulation — health hazard, urgent. Flag to owner.',
    qualifyingQuestions: "What area of the home needs insulation — attic, walls, crawl space, or basement? Is this new insulation or removal and replacement? Do you know the current R-value or type?",
    pricingContext: 'Attic blown-in insulation $1,500–$3,500 (average home). Spray foam $1–$2/sq ft open-cell, $2–$3.50/sq ft closed-cell. Crawl space encapsulation $5,000–$15,000. Insulation removal $1–$2.50/sq ft.',
    bookingInfo: 'Ask: area of home, approximate sq footage, and address. Energy audit may be recommended first.',
  },

  // ── GUTTER SERVICE ───────────────────────────────────────────────────────────
  'Gutter Service': {
    commonJobs: 'gutter cleaning and debris removal, gutter repair (sagging, leaking, pulling away), new gutter install (K-style, half-round, seamless), gutter guard/leaf guard install, downspout repair/extension, fascia repair, gutter realignment, ice dam prevention',
    urgencyPhrases: [
      'leaking gutter','water coming into basement','water near foundation',
      'gutter falling off','gutter pulling away','overflowing gutters','storm damage',
      'flooding around house','water pooling','basement flooding',
    ],
    urgencyNote: 'Gutters causing water intrusion into basement or foundation — urgent. Water damage compounds quickly.',
    qualifyingQuestions: "Is this a cleaning, repair, or new install? Do you have leaf guards? Approximately how many linear feet of gutter?",
    pricingContext: 'Gutter cleaning $100–$250 (average home). New seamless gutter install $6–$12/linear ft. Gutter guard install $7–$20/linear ft. Repair by scope $100–$500.',
    bookingInfo: 'Ask: cleaning, repair, or install, and property address.',
  },

  // ── CHIMNEY / FIREPLACE ───────────────────────────────────────────────────────
  'Chimney Sweep': {
    commonJobs: 'chimney sweep and cleaning, chimney inspection (Level 1/2/3), creosote removal, chimney cap install/replace, chimney liner repair/replace (stainless steel liner), fireplace damper repair, chimney waterproofing, tuckpointing, prefab fireplace repair, gas fireplace service, wood stove cleaning',
    urgencyPhrases: [
      'chimney fire','smell smoke inside','smoke coming into room','carbon monoxide',
      'co alarm','chimney is cracked','chimney damaged','bought the house','winter coming',
      'can\'t use fireplace',
    ],
    urgencyNote: 'Chimney fire, smoke entering living space, or CO detector alert — emergency. Evacuate and call 911 first, then owner.',
    qualifyingQuestions: "Is this an annual cleaning/inspection, a specific problem, or a pre-purchase inspection? When was the chimney last cleaned? Do you have a wood-burning or gas fireplace?",
    pricingContext: 'Level 1 inspection + cleaning $150–$300. Level 2 inspection $300–$500. Chimney liner install $2,500–$6,000. Chimney cap $150–$400. Tuckpointing $500–$2,500. Waterproofing $300–$600.',
    bookingInfo: 'Ask: type of service needed, wood/gas/pellet, and property address.',
  },

  // ── FOUNDATION REPAIR ────────────────────────────────────────────────────────
  'Foundation Repair': {
    commonJobs: 'foundation crack repair, basement wall stabilization, helical pier/push pier install, crawl space repair, floor leveling/mudjacking, waterproofing (interior and exterior), French drain install, sump pump install, bowing wall repair, settling foundation, soil erosion repair',
    urgencyPhrases: [
      'crack getting bigger','crack growing','floor is uneven','floor sloping',
      'doors sticking','windows sticking','wall bowing','basement flooding',
      'water in basement','structural concern','inspector flagged','inspector found',
    ],
    urgencyNote: 'Rapidly growing cracks, bowing walls, or active water intrusion are structural concerns — flag to owner for prompt inspection.',
    qualifyingQuestions: "What are you seeing — cracks, water, uneven floors, sticking doors? How long have you noticed it? Has it gotten worse recently?",
    pricingContext: 'Crack injection repair $400–$1,500 per crack. Helical piers $1,500–$3,500 each (multiple may be needed). Interior waterproofing $5,000–$15,000. Sump pump install $1,000–$3,000. Always requires an in-person structural assessment.',
    bookingInfo: 'Ask: what you are seeing and property address. A structural assessment visit is the first step.',
  },

  // ── CARPET CLEANER ───────────────────────────────────────────────────────────
  'Carpet Cleaner': {
    commonJobs: 'carpet deep cleaning (steam/hot water extraction), stain removal, pet odor and urine treatment, area rug cleaning, upholstery cleaning (sofa, chairs), tile and grout cleaning, hardwood floor cleaning, move-in/move-out carpet cleaning, commercial carpet cleaning',
    urgencyPhrases: [
      'party last night','guests arriving','showing the house','listing tomorrow',
      'move out inspection','big spill','flooded carpet','pet accident everywhere',
      'sewage on carpet',
    ],
    urgencyNote: 'Sewage or flood water on carpet is a health hazard — urgent. Flag to owner for same-day or emergency service.',
    qualifyingQuestions: "How many rooms (or approximate sq footage)? Any specific stain concerns — pets, food, wine? Is this a standard cleaning or do the carpets need deodorizing/stain treatment?",
    pricingContext: 'Per room $50–$100, most companies have a 3-room minimum. Whole home average $200–$400. Stain treatment $30–$75 per stain. Upholstery sofa $100–$200. Pet treatment add-on $50–$100.',
    bookingInfo: 'Ask: number of rooms, any stain concerns, and property address.',
  },

  // ── PRESSURE WASHING ─────────────────────────────────────────────────────────
  'Pressure Washer': {
    commonJobs: 'driveway and sidewalk cleaning, house washing (soft wash siding), deck and patio cleaning, fence cleaning, roof soft wash (algae/moss removal), gutter exterior cleaning, commercial building wash, graffiti removal, concrete sealing prep, fleet vehicle washing',
    urgencyPhrases: [
      'listing the house','going on market','showing this week','hoa violation',
      'mold on siding','algae on roof','before painting','event this weekend',
    ],
    urgencyNote: 'Pre-listing or HOA violation deadlines are time-sensitive.',
    qualifyingQuestions: "What surfaces need cleaning — driveway, house exterior, deck, roof? Do you want just pressure washing or house/roof soft washing too? Approximate sq footage?",
    pricingContext: 'Driveway $150–$350. House wash $300–$700 depending on size. Deck clean $150–$350. Roof soft wash $300–$600. Bundled jobs often discounted.',
    bookingInfo: 'Ask: what needs cleaning and property address.',
  },

  // ── LOCKSMITH ────────────────────────────────────────────────────────────────
  Locksmith: {
    commonJobs: 'lockout service, lock rekey, lock change/upgrade, deadbolt install, smart lock install, master key system, safe opening, car lockout, broken key extraction, sliding door lock repair, security assessment, access control systems',
    urgencyPhrases: [
      'locked out','locked myself out','keys inside','lost my keys',
      'broke my key','key broke in lock','lock won\'t open','lock is stuck',
      'lock broken','just moved in','eviction','tenant locked out','door won\'t unlock',
    ],
    urgencyNote: 'Lockouts are urgent by nature — confirm 24/7 availability and ETA. Notify owner immediately.',
    qualifyingQuestions: "What's the situation — locked out, need a rekey, or new lock install? Home, business, or vehicle? What type of lock (standard, deadbolt, smart lock)?",
    pricingContext: 'Residential lockout $75–$150 (higher after hours). Rekey per lock $25–$75. Lock change $100–$250 per lock. Smart lock install $100–$250 + lock cost. After-hours service 1.5–2× standard.',
    bookingInfo: 'Ask: type of service, address, and whether it is urgent (locked out now vs. scheduled service).',
  },

  // ── TREE SERVICE ─────────────────────────────────────────────────────────────
  'Tree Service': {
    commonJobs: 'tree removal, tree trimming and pruning, stump grinding/removal, emergency storm tree removal, dead tree removal, hazard tree assessment, tree cabling and bracing, lot clearing, palm tree trimming, arborist report, tree planting',
    urgencyPhrases: [
      'tree fell','tree on roof','tree on car','tree on fence','storm damage',
      'limb down','limb fell','leaning tree','about to fall','dangerously leaning',
      'blocking road','blocking driveway','power line','touching power line',
    ],
    urgencyNote: 'Tree on structure, touching power lines, or dangerously leaning — emergency. Notify owner immediately for same-day dispatch. If power lines involved, advise calling the utility company too.',
    qualifyingQuestions: "Is this removal, trimming, or stump grinding? How large is the tree (rough height)? Is it close to structures, power lines, or fencing?",
    pricingContext: 'Small tree removal (under 30 ft) $300–$700. Medium tree (30–60 ft) $700–$1,500. Large tree (60+ ft) $1,500–$4,000+. Stump grinding $150–$400. Palm trim $75–$250. Emergency removal premium 1.5–2×.',
    bookingInfo: 'Ask: service type, tree size/species if known, proximity to structures, and address.',
  },

  // ── JUNK REMOVAL ─────────────────────────────────────────────────────────────
  'Junk Removal': {
    commonJobs: 'furniture removal, appliance removal/haul-away, estate cleanout, garage cleanout, basement cleanout, attic cleanout, yard debris removal, renovation debris, hot tub removal, shed demolition and removal, office cleanout, TV and electronics disposal',
    urgencyPhrases: [
      'estate sale','estate cleanout','moving tomorrow','closing this week',
      'move-out deadline','eviction cleanout','property listing','sold the house',
      'landlord deadline','need it gone today','asap',
    ],
    urgencyNote: 'Estate closings, property sales, or move-out deadlines are time-sensitive — check availability and flag to owner.',
    qualifyingQuestions: "What needs to go — furniture, appliances, general junk, or a full cleanout? Is it in a house, garage, or yard? Roughly how large a job (1 truck, 2 trucks)?",
    pricingContext: 'Minimum load (1/8 truck) $100–$150. Half truck $300–$400. Full truck $500–$700. Estate/full cleanouts $800–$2,500+. Pricing varies by volume and disposal fees.',
    bookingInfo: 'Ask: what needs to be removed, approximate volume, and property address.',
  },

  // ── IRRIGATION / SPRINKLER ───────────────────────────────────────────────────
  'Irrigation Contractor': {
    commonJobs: 'sprinkler system install, sprinkler head repair/replace, valve repair, controller/timer replacement, smart irrigation controller install (Rachio, Hunter), system winterization/blowout, spring startup and inspection, backflow testing, drip irrigation, irrigation audit, leak repair',
    urgencyPhrases: [
      'sprinkler won\'t turn off','stuck on','running constantly','leak in yard',
      'water gushing from ground','wet spots','flooded yard',
      'pipe broke','winter coming','need to winterize',
    ],
    urgencyNote: 'System stuck running (sky-high water bill) or broken pipe flooding yard — urgent. Flag to owner for same-day service.',
    qualifyingQuestions: "Is this a repair, new install, or seasonal service (winterization/startup)? How many zones does the system have? What's the specific issue?",
    pricingContext: 'New system install $2,500–$6,000 (average lawn). Sprinkler head replace $75–$150 each. Valve repair $150–$300. Winterization blowout $75–$150. Spring startup $100–$175. Smart controller install $150–$350.',
    bookingInfo: 'Ask: type of service (repair, install, or seasonal), and property address.',
  },

  // ── SOLAR ────────────────────────────────────────────────────────────────────
  'Solar Installer': {
    commonJobs: 'solar panel system design and install, battery storage (Powerwall, Enphase), solar panel cleaning, system monitoring and maintenance, inverter replacement, panel repair, EV charger add-on, solar lease vs. purchase consultation, permit and interconnection handling',
    urgencyPhrases: [
      'system not working','panels not producing','no power from solar',
      'inverter alarm','utility bill full price','power outage','need battery backup',
    ],
    urgencyNote: 'System not producing power (inverter failure) — flag for prompt service. Potential warranty claim.',
    qualifyingQuestions: "Is this a new install or service on an existing system? For a new install: do you own or rent? Rough monthly electric bill and address? For service: what is the system doing (or not doing)?",
    pricingContext: 'Residential solar install $3–$5/watt before incentives (typical 6–10 kW system = $18,000–$50,000 before 30% federal tax credit). Battery storage (Powerwall) adds $10,000–$15,000 installed. Panel cleaning $150–$350. Always requires a site assessment and energy audit.',
    bookingInfo: 'Ask: new install or service/repair, property address, and whether they own the home. A consultation and site visit is the first step.',
  },

  // ── APPLIANCE REPAIR ─────────────────────────────────────────────────────────
  'Appliance Repair': {
    commonJobs: 'refrigerator repair, washer repair, dryer repair, dishwasher repair, oven/range repair, microwave repair, garbage disposal repair, ice maker repair, dryer vent cleaning, appliance install (over-the-range microwave, dishwasher, gas range), wine cooler repair',
    urgencyPhrases: [
      'fridge not cooling','refrigerator not cold','food going bad','freezer not freezing',
      'washer flooding','washer leaking','dryer not drying','oven not heating',
      'gas smell from stove','dishwasher flooding','appliance smoking',
    ],
    urgencyNote: 'Fridge not cooling (food safety), washer/dishwasher flooding, or gas smell from stove — urgent. Gas smells: advise turning off gas and calling the gas company first.',
    qualifyingQuestions: "Which appliance and what's it doing (or not doing)? What brand and model if you can find it? How old is the appliance?",
    pricingContext: 'Service/diagnostic call $75–$150 (often applied to repair). Most repairs $150–$400 parts and labor. Appliances over 10 years old may not be worth repairing — discuss cost vs. replace.',
    bookingInfo: 'Ask: appliance type, brand/model if available, and address.',
  },

  // ── TILE CONTRACTOR ───────────────────────────────────────────────────────────
  'Tile Contractor': {
    commonJobs: 'bathroom tile install (floor, shower, tub surround), kitchen backsplash, floor tile install, tile repair and re-grout, pool tile, outdoor patio tile, fireplace tile surround, shower pan install, Schluter and waterproofing systems, stone and marble work, grout sealing and cleaning',
    urgencyPhrases: [
      'shower leaking into floor below','water damage below shower','tile cracked and leaking',
      'listing the house','showing this week',
    ],
    urgencyNote: 'Shower leaking through floor — water damage escalates fast. Flag to owner for prompt response.',
    qualifyingQuestions: "What area — bathroom, kitchen, floor, or outdoor? Is this new installation or repair/re-grout? Approximate sq footage? Do you have a tile in mind or need design help?",
    pricingContext: 'Tile install $10–$20/sq ft labor (standard). Shower tile $1,500–$5,000 for a full shower depending on size. Kitchen backsplash $500–$1,500 labor. Grout cleaning/sealing $200–$600. Always measure for exact quote.',
    bookingInfo: 'Ask: area of home, type of project, approximate size, and address.',
  },

  // ── MASONRY ─────────────────────────────────────────────────────────────────
  Masonry: {
    commonJobs: 'brick repair and tuckpointing, stone veneer install, retaining wall build, paver patio and driveway, fireplace and fire pit build, chimney repair, brick mailbox, outdoor kitchen, stucco repair, concrete block wall, stone walkway, brick steps repair',
    urgencyPhrases: [
      'retaining wall falling','wall leaning','crumbling chimney','chimney falling apart',
      'bricks falling','structural crack','hoa violation','listing the house',
    ],
    urgencyNote: 'Failing retaining walls or crumbling structural masonry — safety concern. Flag to owner promptly.',
    qualifyingQuestions: "What type of masonry work — brick repair, new build, paving, or something else? Is it load-bearing or decorative? Approximate scope/size?",
    pricingContext: 'Tuckpointing $5–$25/sq ft. Paver patio $15–$35/sq ft. Retaining wall $30–$75/sq ft. New brick/stone fireplace $3,000–$10,000. Stucco repair $3–$8/sq ft. Always needs in-person estimate.',
    bookingInfo: 'Ask: type of work, approximate scope, and address for an estimate.',
  },

  // ── BASEMENT WATERPROOFING ────────────────────────────────────────────────────
  'Waterproofing Contractor': {
    commonJobs: 'interior basement waterproofing system, exterior waterproofing, French drain install, sump pump install and replacement, battery backup sump pump, crawl space encapsulation, vapor barrier install, window well drains, crack injection, drainage board, egress window install',
    urgencyPhrases: [
      'basement flooding','water in basement','basement wet','standing water',
      'sump pump failed','sump pump not working','crack leaking','wall leaking',
      'heavy rain coming','wet walls','mold smell in basement',
    ],
    urgencyNote: 'Active water intrusion or failed sump pump — urgent. Flood damage compounds by the hour, especially before storms.',
    qualifyingQuestions: "Is water actively coming in now? Where is the water entering — walls, floor, window wells, or cracks? How long has this been a problem?",
    pricingContext: 'Interior drainage system $5,000–$15,000 (perimeter). Sump pump install $1,000–$3,000. Crack injection $400–$1,500. Crawl space encapsulation $5,000–$15,000. Exterior waterproofing $8,000–$25,000+.',
    bookingInfo: 'Ask: where the water is coming in and property address. Assessment visit is always the first step.',
  },

  // ── SEPTIC SERVICE ────────────────────────────────────────────────────────────
  'Septic Service': {
    commonJobs: 'septic tank pumping and cleaning, septic inspection (for home sale), drain field repair, aerator/pump repair, septic riser install, new septic system install, grease trap pumping, septic alarm service, advanced treatment systems, emergency septic service',
    urgencyPhrases: [
      'sewage smell','smell sewage outside','drains backing up','toilets backing up',
      'sewage in yard','green soggy patch in yard','gurgling drains','slow drains everywhere',
      'system alarm','alarm beeping','selling the house',
    ],
    urgencyNote: 'Sewage backup into home, sewage surfacing in yard, or system alarm — health hazard emergency. Notify owner immediately for same-day response.',
    qualifyingQuestions: "Is this routine pumping, an inspection for home sale, or an emergency? When was the tank last pumped? Are you having any backup or slow drain issues?",
    pricingContext: 'Septic pump-out $250–$600 depending on tank size. Inspection for home sale $300–$600. Drain field repair $2,000–$20,000 depending on scope. Emergency service premium.',
    bookingInfo: 'Ask: type of service (routine, inspection, or emergency), and property address.',
  },

  // ── RESTORATION (WATER / FIRE / MOLD) ─────────────────────────────────────────
  'Restoration Contractor': {
    commonJobs: 'water damage restoration and drying, fire and smoke damage restoration, mold remediation and testing, sewage cleanup, wind/storm damage restoration, pack-out and contents restoration, demolition and rebuild, insurance claim assistance, emergency board-up, biohazard cleanup',
    urgencyPhrases: [
      'flooding','flooded house','water damage','pipe burst','water everywhere',
      'fire damage','smoke damage','mold','black mold','sewage backup',
      'ceiling caved','roof blown off','car hit house','need help now',
    ],
    urgencyNote: 'Water, fire, or sewage damage — emergency. Every hour matters for drying and preventing mold. Notify owner immediately for same-day emergency response.',
    qualifyingQuestions: "What happened and when? What type of damage — water, fire, smoke, or mold? Has the source been controlled (leak stopped, fire out)?",
    pricingContext: 'Water mitigation/drying $1,500–$8,000+ depending on scope. Fire/smoke restoration $4,000–$50,000+. Mold remediation $1,500–$10,000+. Emergency services often billed by scope and hours. Most restoration work is insurance-claimable.',
    bookingInfo: 'Ask: type of damage, when it happened, and property address. Emergency response is available 24/7.',
  },

  // ── SECURITY SYSTEMS ─────────────────────────────────────────────────────────
  'Security System Installer': {
    commonJobs: 'security camera install (indoor, outdoor, doorbell cam), alarm system install and monitoring, smart lock and access control, motion sensor lighting, smart home automation, glass break and motion detectors, intercom systems, commercial access control, system takeover and reprogramming',
    urgencyPhrases: [
      'break-in','someone broke in','burglary','vandalism','system not working',
      'alarm going off randomly','camera offline','just moved in','new home',
    ],
    urgencyNote: 'Post-break-in or system malfunction — flag to owner for priority scheduling.',
    qualifyingQuestions: "Is this a new install or upgrade to an existing system? Cameras, alarm, or both? Indoor, outdoor, or full property coverage? Do you want professional monitoring?",
    pricingContext: 'Camera system (4 cameras) installed $800–$2,000. Alarm system install $500–$2,000. Smart doorbell cam $200–$400 installed. Monthly monitoring $30–$60/month. Consultation is usually free.',
    bookingInfo: 'Ask: new install or existing system, type of system (cameras, alarm, or both), and address.',
  },

  // ── REMODELING ────────────────────────────────────────────────────────────────
  Remodeler: {
    commonJobs: 'kitchen remodel, bathroom remodel, basement finish, room addition, master suite build-out, open floor plan conversion, accessibility remodel (ADA, aging in place), second story addition, garage conversion to living space, in-law suite',
    urgencyPhrases: [
      'water damage','flood damage','permit deadline','listing the house',
      'family moving in','baby coming','disability access needed',
    ],
    urgencyNote: 'Water/fire damage or accessibility/health-driven timelines — flag to owner for priority.',
    qualifyingQuestions: "What type of remodel — kitchen, bathroom, basement, or something else? Rough scope and size? Do you have a design or are you starting from scratch? Target start date?",
    pricingContext: 'Kitchen remodel $20,000–$80,000+. Bathroom $8,000–$35,000. Basement finish $25,000–$65,000. Addition $150–$300/sq ft. Always requires an in-person consultation and estimate.',
    bookingInfo: 'Ask: type of remodel, scope, and address. A design consultation is the first step.',
  },

  // ── CABINET MAKER ────────────────────────────────────────────────────────────
  'Cabinet Contractor': {
    commonJobs: 'custom cabinet build, cabinet install (kitchen, bathroom, laundry, garage), cabinet refacing, cabinet painting/refinishing, pantry build-out, closet system install, entertainment center build, garage storage system, countertop install (quartz, granite, laminate)',
    urgencyPhrases: [
      'listing the house','kitchen remodel deadline','contractor deadline','countertop damaged',
    ],
    urgencyNote: 'Pre-listing prep or contractor dependency deadlines — time-sensitive.',
    qualifyingQuestions: "Is this custom cabinets, stock install, or cabinet refacing/painting? Which room — kitchen, bathroom, closet? Do you need countertops too?",
    pricingContext: 'Stock cabinet install (kitchen) $2,000–$5,000 labor. Semi-custom $5,000–$15,000 installed. Custom $15,000–$50,000+. Refacing $4,000–$10,000. Cabinet painting $2,000–$6,000. Countertop install $500–$2,500 labor.',
    bookingInfo: 'Ask: project type, room, and address. An estimate and measure appointment is needed.',
  },

  // ── GLASS / WINDOW REPAIR ─────────────────────────────────────────────────────
  'Glass Repair': {
    commonJobs: 'window glass replacement (single/double pane, insulated units), foggy window repair, shower door/enclosure install and repair, glass table top repair, mirror install, patio door glass replacement, commercial storefront glass, auto glass repair',
    urgencyPhrases: [
      'broken window','shattered glass','window cracked','broken pane',
      'security concern','weather coming','rain coming in','storm tonight',
      'glass broke','shattered','smashed',
    ],
    urgencyNote: 'Broken window or door glass — security and weather exposure. Flag to owner for same-day board-up or repair if needed.',
    qualifyingQuestions: "Is this a broken/cracked pane or foggy glass between panes (seal failure)? Window size approximately? How many panes?",
    pricingContext: 'Single pane replacement $75–$200. Double-pane insulated unit $150–$500+ per window. Foggy window glass unit swap $150–$400. Shower glass door $400–$1,200 installed.',
    bookingInfo: 'Ask: type of glass, approximate size, and address.',
  },

};

// ─── Trade name resolver ──────────────────────────────────────────────────────
function resolveTradeContext(trade) {
  if (!trade) return null;
  const t = trade.toLowerCase().trim();

  // Exact key match
  for (const [key, val] of Object.entries(TRADE_CONTEXT)) {
    if (t === key.toLowerCase()) return val;
  }
  // Substring match
  for (const [key, val] of Object.entries(TRADE_CONTEXT)) {
    if (t.includes(key.toLowerCase()) || key.toLowerCase().includes(t)) return val;
  }
  // Alias patterns
  if (/plumb/.test(t))                                    return TRADE_CONTEXT['Plumber'];
  if (/hvac|heat(ing)?|cool(ing)?|air.?cond|furnace/.test(t)) return TRADE_CONTEXT['HVAC'];
  if (/electri/.test(t))                                  return TRADE_CONTEXT['Electrician'];
  if (/roof/.test(t))                                     return TRADE_CONTEXT['Roofer'];
  if (/landscap|lawn|yard|mow|sod/.test(t))               return TRADE_CONTEXT['Landscaper'];
  if (/pest|exterminat|bug|rodent|termite|bee|wasp/.test(t)) return TRADE_CONTEXT['Pest Control'];
  if (/clean(er|ing)?|maid|housekeep/.test(t))            return TRADE_CONTEXT['House Cleaner'];
  if (/mov(ing|er)|reloc/.test(t))                        return TRADE_CONTEXT['Mover'];
  if (/garage.?door/.test(t))                             return TRADE_CONTEXT['Garage Door'];
  if (/paint/.test(t))                                    return TRADE_CONTEXT['Painter'];
  if (/pool|spa/.test(t))                                 return TRADE_CONTEXT['Pool Service'];
  if (/floor(ing)?|hardwood|carpet|lvp|vinyl floor|tile floor/.test(t)) return TRADE_CONTEXT['Flooring'];
  if (/handyman|handy.?man/.test(t))                      return TRADE_CONTEXT['Handyman'];
  if (/window|door.?install|window.?install/.test(t))     return TRADE_CONTEXT['Window Installer'];
  if (/fence/.test(t))                                    return TRADE_CONTEXT['Fence Contractor'];
  if (/deck|patio.?build|patio.?contrac/.test(t))         return TRADE_CONTEXT['Deck Builder'];
  if (/concret|asphalt|pav(ing|er|ement)|driveway/.test(t)) return TRADE_CONTEXT['Concrete Contractor'];
  if (/drywall|plaster/.test(t))                          return TRADE_CONTEXT['Drywall Contractor'];
  if (/insul/.test(t))                                    return TRADE_CONTEXT['Insulation Contractor'];
  if (/gutter/.test(t))                                   return TRADE_CONTEXT['Gutter Service'];
  if (/chimney|fireplace|firplace/.test(t))               return TRADE_CONTEXT['Chimney Sweep'];
  if (/foundation/.test(t))                               return TRADE_CONTEXT['Foundation Repair'];
  if (/carpet.?clean|upholstery.?clean/.test(t))          return TRADE_CONTEXT['Carpet Cleaner'];
  if (/pressure.?wash|power.?wash/.test(t))               return TRADE_CONTEXT['Pressure Washer'];
  if (/locksmith|lock/.test(t))                           return TRADE_CONTEXT['Locksmith'];
  if (/tree|arborist|stump/.test(t))                      return TRADE_CONTEXT['Tree Service'];
  if (/junk|haul|removal|cleanout/.test(t))               return TRADE_CONTEXT['Junk Removal'];
  if (/irrigation|sprinkler/.test(t))                     return TRADE_CONTEXT['Irrigation Contractor'];
  if (/solar/.test(t))                                    return TRADE_CONTEXT['Solar Installer'];
  if (/appliance/.test(t))                                return TRADE_CONTEXT['Appliance Repair'];
  if (/tile/.test(t))                                     return TRADE_CONTEXT['Tile Contractor'];
  if (/mason|brick|stone|stucco|paver/.test(t))           return TRADE_CONTEXT['Masonry'];
  if (/waterproof|basement.?water|crawl.?space/.test(t))  return TRADE_CONTEXT['Waterproofing Contractor'];
  if (/septic|cesspool/.test(t))                          return TRADE_CONTEXT['Septic Service'];
  if (/restor|remedia|water.?damage|fire.?damage|mold/.test(t)) return TRADE_CONTEXT['Restoration Contractor'];
  if (/security|camera|alarm|surveillance/.test(t))       return TRADE_CONTEXT['Security System Installer'];
  if (/remodel|renovat/.test(t))                          return TRADE_CONTEXT['Remodeler'];
  if (/cabinet|countertop/.test(t))                       return TRADE_CONTEXT['Cabinet Contractor'];
  if (/glass|mirror|window.?repair/.test(t))              return TRADE_CONTEXT['Glass Repair'];
  if (/contrac|build|construct/.test(t))                  return TRADE_CONTEXT['General Contractor'];
  return null;
}

// ─── Format services for prompt ──────────────────────────────────────────────
function formatServicesForPrompt(services) {
  if (!services || services.length === 0)
    return 'No specific services configured yet — use your trade knowledge to give helpful estimates, then book the appointment.';

  return services.map(svc => {
    if (typeof svc === 'string') return `• ${svc}`;

    const name = svc.name;
    const pt = svc.pricing_type;

    if (pt === 'free_estimate') {
      return `• ${name}: Free on-site estimate — never quote a number over text. Say: "We'd need to take a look first — free visit, no obligation."`;
    }

    const low = svc.price_low;
    const high = svc.price_high;
    const min = svc.min_charge;

    let unitStr = '';
    let mathInstruction = '';
    if (pt === 'per_sq_ft') {
      unitStr = '/sq ft';
      mathInstruction = `\n  → MATH: ${low}×qty to ${high}×qty. Example: 200 sq ft = $${Math.round(low * 200).toLocaleString()}–$${Math.round(high * 200).toLocaleString()}.`;
    } else if (pt === 'per_linear_ft') {
      unitStr = '/linear ft';
      mathInstruction = `\n  → MATH: ${low}×qty to ${high}×qty.`;
    } else if (pt === 'per_unit') {
      const unit = svc.unit || 'unit';
      unitStr = `/${unit}`;
      mathInstruction = `\n  → MATH: ${low}×qty to ${high}×qty.`;
    } else if (pt === 'hourly') {
      unitStr = '/hour';
    }

    let priceStr =
      pt === 'starting_at'
        ? `Starting at $${low}`
        : high
        ? `$${low}–$${high}${unitStr}`
        : `$${low}${unitStr}`;

    if (min) priceStr += ` (min $${min})`;

    let line = `• ${name}: ${priceStr}`;
    if (svc.notes) line += `\n  → ${svc.notes}`;
    if (mathInstruction) line += mathInstruction;

    return line;
  }).join('\n\n');
}

// ─── Format FAQs for prompt ───────────────────────────────────────────────────
function formatFAQs(faqs) {
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) return null;
  const lines = faqs
    .filter(f => f.question && f.answer)
    .map(f => `Q: ${f.question}\nA: ${f.answer}`);
  return lines.length > 0 ? lines.join('\n\n') : null;
}

// ─── Build system prompt ──────────────────────────────────────────────────────
function buildSystemPrompt(business, availableSlots) {
  const ownerName = business.owner_name || business.ownerName || 'the owner';

  const slotsText =
    availableSlots && availableSlots.length > 0
      ? availableSlots.map(s => `- ${s.date} at ${s.time}`).join('\n')
      : `No open slots at the moment — let the customer know someone will call them back to confirm a time.`;

  const servicesText = formatServicesForPrompt(business.services);
  const faqText = formatFAQs(business.faqs);
  const tradeCtx = resolveTradeContext(business.trade);

  const toneMap = {
    professional: 'Speak professionally and precisely. Formal but warm. No slang.',
    friendly:     'Speak in a friendly, conversational tone. Approachable and warm, like a helpful team member.',
    casual:       'Keep it relaxed and natural. Short, direct messages. Like texting a trusted local pro.',
    formal:       'Strictly professional. No colloquialisms. Precise language only.',
  };
  const toneInstruction = toneMap[(business.tone || 'friendly').toLowerCase()] || toneMap.friendly;

  const durationNote = business.appointment_duration
    ? `Jobs are typically scheduled as ${business.appointment_duration}-minute appointments.`
    : '';

  let tradeBlock = '';
  if (tradeCtx) {
    const urgencyList = tradeCtx.urgencyPhrases.map(p => `"${p}"`).join(', ');
    tradeBlock = `
TRADE KNOWLEDGE — ${business.trade}:
Common job types: ${tradeCtx.commonJobs}

Emergency / urgency indicators — if the customer mentions ANY of these, treat as urgent:
${urgencyList}
→ Urgency action: ${tradeCtx.urgencyNote}

Key qualifying questions (ask the most relevant one — never fire multiple at once):
${tradeCtx.qualifyingQuestions}

Industry pricing fallback (use ONLY if owner has not set a price for that specific service):
${tradeCtx.pricingContext}

Booking info: ${tradeCtx.bookingInfo}`;
  }

  const faqBlock = faqText
    ? `\nCOMMON QUESTIONS & ANSWERS (answer these accurately when asked):\n${faqText}`
    : '';

  const serviceAreaBlock = business.service_base_address
    ? `SERVICE AREA:
- Operating out of: ${business.service_base_address}
- Service radius: ${business.service_radius_miles || 25} miles
- Always collect the customer's job address before confirming any appointment. Tag it: [ADDRESS: full address]`
    : 'SERVICE AREA: No restrictions configured.';

  return `You are the AI receptionist for "${business.name}", a ${business.trade} business. You are responding via SMS on behalf of ${ownerName}.

TONE: ${toneInstruction}
${durationNote}

SERVICES & PRICING (owner-configured — use these first):
${servicesText}
${tradeBlock}
${faqBlock}

AVAILABLE APPOINTMENT SLOTS:
${slotsText}

${serviceAreaBlock}

YOUR JOB:
1. Understand what the customer needs
2. Ask 1 qualifying question at a time if needed — never ask multiple questions at once
3. Answer pricing questions with real numbers — either from SERVICES above or trade knowledge fallback
4. Do the math when customers give dimensions/quantities, show it briefly
5. If emergency: say you are notifying ${ownerName} right away. Tag [URGENT].
6. Otherwise: offer slots and book it

PRICING RULES:
- Give real dollar ranges — never just say "it depends" without explaining what it depends on
- Always a range (low–high), never one exact number
- Per-unit/sq ft/linear ft: do the math if customer gives a quantity
- Free estimate services: invite them in, never guess a number
- After pricing, steer toward booking

CONVERSATION RULES:
- Keep replies SHORT — 1–3 sentences. This is texting.
- Never reveal you are an AI — you are the front desk for ${business.name}
- Do not greet with "Hi", "Hey", or "Hello" on follow-up messages — only the very first response
- If the customer signals they are done ("thanks", "got it", "see you then", "sounds good", "perfect") — confirm the next step warmly and stop. Do not ask more questions.
- Vary your sentence structure across messages — do not be repetitive
- If you don't know something: "${ownerName} will get back to you with that detail."
- No emojis. No bullet points in texts.
- Collect the customer's name naturally if they haven't given it
${business.service_base_address ? '- Before confirming a booking, ask for the job address. Tag it: [ADDRESS: full street address, city, state zip]' : ''}

CONTROL TAGS — always include when applicable (stripped before sending):
[BOOKED: YYYY-MM-DD HH:MM]   ← Appointment confirmed. 24-hour time.
[URGENT]                      ← Emergency detected.
[NAME: First Last]            ← First time customer gives their name
[ADDRESS: full address]       ← When customer provides job address`;
}

// ─── History management ───────────────────────────────────────────────────────
function getOrSeedHistory(cacheKey, dbMessages) {
  if (!conversationCache.has(cacheKey) && dbMessages && dbMessages.length > 0) {
    const seeded = dbMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }));
    conversationCache.set(cacheKey, seeded);
  }
  if (!conversationCache.has(cacheKey)) conversationCache.set(cacheKey, []);
  return conversationCache.get(cacheKey);
}

function pruneHistory(history) {
  if (history.length <= 20) return;
  // Anchor = first 2 messages, keep last 18, drop the middle
  const anchor = history.slice(0, 2);
  const recent = history.slice(-18);
  history.splice(0, history.length, ...anchor, ...recent);
}

// ─── Main AI function ─────────────────────────────────────────────────────────
async function getAIResponse(phoneNumber, customerMessage, business, availableSlots, dbMessages = []) {
  const cacheKey = `${business.id}:${phoneNumber}`;
  const history = getOrSeedHistory(cacheKey, dbMessages);

  history.push({ role: 'user', content: customerMessage });

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: buildSystemPrompt(business, availableSlots),
    messages: history,
  });

  const aiMessage = response.content[0].text;
  history.push({ role: 'assistant', content: aiMessage });
  pruneHistory(history);

  return aiMessage;
}

function clearConversation(phoneNumber, businessId) {
  const cacheKey = businessId ? `${businessId}:${phoneNumber}` : phoneNumber;
  conversationCache.delete(cacheKey);
  conversationCache.delete(phoneNumber); // legacy key
}

module.exports = { getAIResponse, clearConversation };
