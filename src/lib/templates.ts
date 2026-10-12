export type StarterTemplate = {
  id: string;
  polarity: "build" | "break";
  environmentKind: "physical" | "digital" | "mixed";
  en: {
    habit: string;
    environment: string;
    cue: string;
    action: string;
  };
  zh: {
    habit: string;
    environment: string;
    cue: string;
    action: string;
  };
};

/** Exactly 10 starters from plan Q10 — bilingual EN + ZH. */
export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    id: "water",
    polarity: "build",
    environmentKind: "physical",
    en: {
      habit: "Drink water",
      environment: "Desk",
      cue: "Filled bottle in sight",
      action: "Keep a filled bottle or cup on the desk",
    },
    zh: {
      habit: "飲水",
      environment: "書桌",
      cue: "裝滿的水瓶放在眼前",
      action: "在書桌上放一瓶／一杯已裝滿的水",
    },
  },
  {
    id: "move",
    polarity: "build",
    environmentKind: "physical",
    en: {
      habit: "Move a bit",
      environment: "Home / door",
      cue: "Shoes or mat by the door",
      action: "Leave shoes or a mat visible; clear a small floor spot",
    },
    zh: {
      habit: "做吓運動",
      environment: "家門／門口",
      cue: "鞋或墊放在門口",
      action: "把鞋或墊放在顯眼處，並清出一小塊地板空間",
    },
  },
  {
    id: "notes",
    polarity: "build",
    environmentKind: "physical",
    en: {
      habit: "Write notes",
      environment: "Desk",
      cue: "Pen and notebook ready",
      action: "Place a nice pen and notebook beside the desk",
    },
    zh: {
      habit: "寫筆記",
      environment: "書桌",
      cue: "筆與筆記本就緒",
      action: "在書桌旁放一支好寫的筆和一本筆記本",
    },
  },
  {
    id: "phone",
    polarity: "break",
    environmentKind: "mixed",
    en: {
      habit: "Less phone scroll",
      environment: "Bedroom / phone",
      cue: "Phone charging out of reach",
      action: "Charge the phone in another room overnight",
    },
    zh: {
      habit: "少滑手機",
      environment: "睡房／手機",
      cue: "手機在另一間房充電",
      action: "晚上把手機拿到另一間房充電",
    },
  },
  {
    id: "read",
    polarity: "build",
    environmentKind: "physical",
    en: {
      habit: "Read more",
      environment: "Bedside",
      cue: "Book on the pillow",
      action: "Put tonight’s book on the pillow (not under a pile)",
    },
    zh: {
      habit: "多啲閱讀",
      environment: "床頭",
      cue: "書放在枕頭上",
      action: "把今晚要讀的書放在枕頭上（不要壓在一堆底下）",
    },
  },
  {
    id: "sleep",
    polarity: "build",
    environmentKind: "physical",
    en: {
      habit: "Sleep earlier",
      environment: "Bedroom",
      cue: "Alarm across the room",
      action: "Put the alarm across the room; no charger on the nightstand",
    },
    zh: {
      habit: "早啲瞓",
      environment: "睡房",
      cue: "鬧鐘放在房間另一邊",
      action: "鬧鐘放遠一點；床頭不要放充電器",
    },
  },
  {
    id: "stretch",
    polarity: "build",
    environmentKind: "physical",
    en: {
      habit: "Stretch",
      environment: "Desk / chair",
      cue: "Band or stretch card on the chair",
      action: "Hang a band or leave a stretch card on the chair back",
    },
    zh: {
      habit: "伸展一下",
      environment: "書桌／椅子",
      cue: "彈力帶或伸展卡在椅背",
      action: "在椅背掛彈力帶，或放一張伸展提示卡",
    },
  },
  {
    id: "snacks",
    polarity: "build",
    environmentKind: "physical",
    en: {
      habit: "Eat better snacks",
      environment: "Kitchen",
      cue: "Fruit at eye level",
      action: "Fruit bowl at eye level; junk snacks in an opaque high cupboard",
    },
    zh: {
      habit: "健康啲小食",
      environment: "廚房",
      cue: "水果放在視線高度",
      action: "水果盤放在視線高度；零食放進不透明的高櫃",
    },
  },
  {
    id: "floss",
    polarity: "build",
    environmentKind: "physical",
    en: {
      habit: "Floss",
      environment: "Bathroom",
      cue: "Floss beside the toothbrush",
      action: "Keep floss next to the toothbrush (same cue moment)",
    },
    zh: {
      habit: "用牙線",
      environment: "浴室",
      cue: "牙線放在牙刷旁",
      action: "把牙線放在牙刷旁邊（同一個提示時刻）",
    },
  },
  {
    id: "light-walk",
    polarity: "build",
    environmentKind: "physical",
    en: {
      habit: "Morning light walk",
      environment: "Door / shoes",
      cue: "Shoes and jacket by the door",
      action: "Put shoes and a light jacket by the door the night before",
    },
    zh: {
      habit: "睇吓朝早日光",
      environment: "門口／鞋",
      cue: "鞋與外套放在門口",
      action: "前一晚把鞋和薄外套放在門口",
    },
  },
];
