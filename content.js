export const evidence = [
  {
    id: 'strength',
    grade: 'Strong',
    title: 'Strength is the anchor',
    summary: 'Adults should do muscle-strengthening work at least twice a week. In postmenopausal women, resistance training improves strength and can improve bone mineral density.',
    sources: [
      ['WHO physical activity guidance', 'https://www.who.int/initiatives/behealthy/physical-activity'],
      ['2025 systematic review: resistance training & bone density', 'https://pubmed.ncbi.nlm.nih.gov/40420105/']
    ]
  },
  {
    id: 'sims',
    grade: 'Expert + supporting evidence',
    title: 'Heavy strength, power and short intensity',
    summary: 'Dr. Stacy Sims emphasizes progressive heavy resistance, power/plyometrics and short sprint intervals for women through peri- and postmenopause. Future You uses these as programming principles, scaled to training age and limitations rather than applied as one-size-fits-all rules.',
    sources: [
      ['Stacy Sims: How to Power Your Way Through Menopause', 'https://www.drstacysims.com/newsletters/articles/posts/How_to_Power_Your_Way_Through_Menopause'],
      ['Stacy Sims: Perimenopause vs Postmenopause guide', 'https://www.drstacysims.com/newsletters/articles/posts/perimenopause-vs-postmenopause-training-nutrition-guide']
    ]
  },
  {
    id: 'aerobic',
    grade: 'Strong',
    title: 'Aerobic fitness still matters',
    summary: 'WHO recommends 150–300 minutes of moderate aerobic activity, 75–150 minutes vigorous, or an equivalent mix each week, alongside strength work. Future You prioritizes strength without pretending easy aerobic work is irrelevant.',
    sources: [['WHO physical activity guidance', 'https://www.who.int/initiatives/behealthy/physical-activity']]
  },
  {
    id: 'cardiometabolic',
    grade: 'Strong',
    title: 'Know the cardiovascular basics',
    summary: 'Blood pressure, blood lipids, smoking status and glucose-related risk are established cardiovascular-health factors. Future You keeps these as health-admin prompts rather than calculating a medical risk score.',
    sources: [
      ['ESC 2021: Cardiovascular disease prevention', 'https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/cvd-prevention/'],
      ['ESC 2024: Elevated blood pressure and hypertension', 'https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/elevated-blood-pressure-and-hypertension/']
    ]
  },
  {
    id: 'screening',
    grade: 'Strong policy + evidence base',
    title: 'Stay current with preventive screening',
    summary: 'European cancer-screening policy supports organised breast, cervical and colorectal screening, while exact eligibility and intervals are implemented nationally. Future You therefore prompts you to check your local programme rather than hard-coding one European timetable.',
    sources: [
      ['EU Council Recommendation 2022: cancer screening', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022H1213(01)']
    ]
  },
  {
    id: 'plants',
    grade: 'Strong',
    title: 'Plant-rich, high-fibre eating is a big lever',
    summary: 'A plant-rich pattern built around wholegrains, vegetables, fruit, legumes, nuts and seeds supports long-term health. EFSA considers 25 g/day of dietary fibre adequate for normal bowel function in adults and notes additional health benefits with higher intakes.',
    sources: [
      ['EFSA: European dietary reference values for fibre', 'https://www.efsa.europa.eu/en/press/news/nda100326'],
      ['World Cancer Research Fund: wholegrains, vegetables, fruit and beans', 'https://www.wcrf.org/research-policy/evidence-for-our-recommendations/wholegrains-veg-fruit-beans/']
    ]
  },
  {
    id: 'protein',
    grade: 'Strong for training support',
    title: 'Protein supports muscle and recovery',
    summary: 'Future You uses 1.6 g/kg/day as a practical starting target for active women when body weight is supplied. It is a training-support target, not a claim that higher protein directly extends lifespan.',
    sources: [
      ['Stacy Sims: Protein and plant diversity', 'https://www.drstacysims.com/newsletters/articles/posts/protein-and-plant-diversity-menopause'],
      ['Stacy Sims: Perimenopause “Power Window”', 'https://www.drstacysims.com/newsletters/articles/posts/Harness_the_Perimenopause_Power_Window']
    ]
  },
  {
    id: 'sleep',
    grade: 'Strong general health evidence',
    title: 'Recovery is part of the program',
    summary: 'The app uses a simple 7–9 hour sleep target and avoids pseudo-precise readiness scores. Persistent sleep problems deserve clinical attention rather than an algorithmic score.',
    sources: [
      ['European Sleep Research Society: healthy sleep resources', 'https://esrs.eu/'],
      ['American Academy of Sleep Medicine consensus', 'https://aasm.org/resources/pdf/sleepdurationrecommendations.pdf']
    ]
  },
  {
    id: 'alcohol-nicotine',
    grade: 'Strong',
    title: 'Less alcohol; no tobacco or nicotine',
    summary: 'Avoiding tobacco and nicotine and reducing alcohol are major prevention levers. WHO Europe states that there is no safe level of alcohol consumption in relation to cancer risk, and tobacco remains a major preventable cause of disease in Europe.',
    sources: [
      ['WHO Europe: Alcohol and cancer', 'https://www.who.int/europe/news-room/fact-sheets/item/alcohol-and-cancer'],
      ['WHO Europe: Tobacco', 'https://www.who.int/europe/news-room/fact-sheets/item/tobacco']
    ]
  },
  {
    id: 'bone',
    grade: 'Strong',
    title: 'Bone health deserves attention after menopause',
    summary: 'Resistance and impact exercise can support bone health, while fracture-risk assessment and bone-density testing depend on age, history, medicines and local healthcare guidance. Future You does not impose a single screening age across Europe.',
    sources: [
      ['2025 systematic review: resistance training & bone density', 'https://pubmed.ncbi.nlm.nih.gov/40420105/'],
      ['European Menopause and Andropause Society', 'https://emas-online.org/']
    ]
  },
  {
    id: 'creatine',
    grade: 'Useful adjunct',
    title: 'Creatine can support training',
    summary: 'Creatine monohydrate is one of the few supplements Future You actively surfaces. A 2026 meta-analysis in postmenopausal women found small improvements in lean mass and strength with resistance training, while the EU has an authorised claim for improved resistance-training effects on muscle strength in adults over 55 at 3 g/day under specified training conditions. This is not evidence of longer lifespan.',
    sources: [
      ['EU authorised creatine health claim', 'https://eur-lex.europa.eu/eli/reg_impl/2017/672/oj/eng'],
      ['2026 meta-analysis: creatine in postmenopausal women', 'https://pubmed.ncbi.nlm.nih.gov/42141930/'],
      ['Stacy Sims: Creatine guide for active women', 'https://www.drstacysims.com/newsletters/articles/posts/creatine-guide-for-active-women']
    ]
  }
];

export const safetyCopy = `Future You is educational and is not medical care. Stop exercise and seek urgent medical assessment for chest pain, fainting, severe shortness of breath, or other concerning symptoms. If you have a condition, injury, pregnancy, recent surgery, osteoporosis with fracture history, or have been told to restrict exercise, get individualized clinical guidance before starting high-intensity, heavy-load or impact training.`;

export const evidenceReviewed = 'September 2026';
