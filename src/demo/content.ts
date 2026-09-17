/**
 * Demo content. Written to be useful, not lorem ipsum. Nothing here is legal
 * advice; the Know Your Rights section says so on screen.
 *
 * Each rights entry has a full version and a plain-language version. The
 * plain version is what the "Plain language" switch shows: shorter sentences,
 * common words, one idea per sentence. WCAG 3.1.5 Reading Level is AAA, but
 * the people who need it most are the ones organizing apps are built for.
 */

export type RightsEntry = {
  id: string;
  title: string;
  full: string[];
  plain: string[];
};

export const knowYourRights: RightsEntry[] = [
  {
    id: "stopped",
    title: "If you are stopped by police",
    full: [
      "You have the right to remain silent. If you wish to exercise that right, say so out loud. In many states you may be required to give your name if asked to identify yourself.",
      "You do not have to consent to a search of yourself or your belongings. Police may pat down your clothing if they suspect a weapon; you should not physically resist, but you may state clearly that you do not consent.",
      "Ask if you are free to leave. If the officer says yes, calmly walk away.",
    ],
    plain: [
      "You can stay silent. Say: \"I want to stay silent.\"",
      "You can say no to a search. Say: \"I do not agree to a search.\" Do not fight or run.",
      "Ask: \"Am I free to go?\" If they say yes, walk away calmly.",
    ],
  },
  {
    id: "disability",
    title: "If you have a disability and need an accommodation",
    full: [
      "Under the Americans with Disabilities Act, state and local government agencies must provide reasonable modifications to policies and effective communication, including sign language interpreters, accessible documents, and extra time when needed.",
      "You can request an accommodation at any point, in any format you are able to use. The agency cannot charge you for it.",
      "If a service is denied because of your disability, you can file a complaint with the agency's ADA coordinator or with the U.S. Department of Justice.",
    ],
    plain: [
      "Government offices must help you take part. This is the law (the ADA).",
      "You can ask for help in any way that works for you. Examples: a sign language interpreter, large print, or more time. It is free.",
      "If they say no because of your disability, you can complain. Ask for the ADA coordinator.",
    ],
  },
  {
    id: "tenant",
    title: "If your landlord threatens eviction",
    full: [
      "In most places a landlord cannot remove you, change the locks, or shut off utilities without a court order. Only a court can order an eviction, and you have the right to appear and respond.",
      "Keep every notice, text, and email. Photograph the condition of the unit. Write down dates.",
      "Many cities have free tenant legal aid. Contacting them before your court date matters more than anything else on this list.",
    ],
    plain: [
      "Your landlord cannot lock you out or turn off heat, water, or power. Only a judge can evict you.",
      "Keep every paper, text, and email. Take photos. Write down dates.",
      "Get free legal help before your court date. This is the most important step.",
    ],
  },
  {
    id: "protest",
    title: "If you are protesting",
    full: [
      "The First Amendment protects your right to assemble and speak in traditional public forums such as streets, sidewalks, and parks, subject to reasonable time, place, and manner restrictions.",
      "You may photograph or record police in public spaces. Officers may not confiscate or demand to view your photos or video without a warrant.",
      "If you are detained, ask for a lawyer and do not sign anything you do not understand.",
    ],
    plain: [
      "You can gather and speak in public places like sidewalks and parks.",
      "You can record police in public. They cannot take your phone without a warrant.",
      "If you are held, ask for a lawyer. Do not sign papers you do not understand.",
    ],
  },
];

export const resourceLanguages = [
  {
    id: "en",
    lang: "en",
    label: "English",
    heading: "Get help",
    lines: [
      "Call 211 for food, housing, and utility assistance in your area.",
      "For legal aid, search for your state's Legal Aid or Legal Services office.",
      "Emergency: call 911. If you are deaf or hard of hearing, text 911 where available or use a relay service.",
    ],
  },
  {
    id: "es",
    lang: "es",
    label: "Español",
    heading: "Obtenga ayuda",
    lines: [
      "Llame al 211 para recibir ayuda con alimentos, vivienda y servicios públicos en su área.",
      "Para asistencia legal, busque la oficina de Legal Aid o Legal Services de su estado.",
      "Emergencia: llame al 911. Si es sordo o tiene dificultades auditivas, envíe un mensaje de texto al 911 donde esté disponible o use un servicio de retransmisión.",
    ],
  },
  {
    id: "pt",
    lang: "pt",
    label: "Português",
    heading: "Obtenha ajuda",
    lines: [
      "Ligue para 211 para assistência com alimentação, moradia e serviços públicos na sua região.",
      "Para assistência jurídica, procure o escritório de Legal Aid ou Legal Services do seu estado.",
      "Emergência: ligue para 911. Se você é surdo ou tem deficiência auditiva, envie uma mensagem de texto para 911 onde disponível ou use um serviço de retransmissão.",
    ],
  },
];
