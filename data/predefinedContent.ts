
// --- Fallback Dragon Descriptions ---
export const PREDEFINED_DRAGON_DESCRIPTIONS: string[] = [
    "Um dragão jovem com um brilho curioso nos olhos, prometendo uma grande inteligência.",
    "As suas escamas são fortes como rocha, sugerindo uma resistência inata e uma natureza protetora.",
    "Uma energia vibrante parece emanar deste jovem dragão, que mal consegue conter a sua excitação.",
    "Este dragão possui uma postura calma e nobre, observando o mundo com uma sabedoria para além da sua idade.",
    "Brincalhão e um pouco traquinas, este dragão parece pronto para explorar todos os cantos da academia.",
];

// --- Fallback Action Outcomes ---
// Use {dragonName} as a placeholder.
export const PREDEFINED_ACTION_OUTCOMES: Record<string, string[]> = {
    "Treinar": [
        "Você e {dragonName} praticam manobras de voo, fortalecendo vosso laço.",
        "{dragonName} parece visivelmente mais forte após uma sessão de treino intensa.",
        "O treino foi produtivo! {dragonName} aprendeu um pequeno truque novo."
    ],
    "Alimentar": [
        "{dragonName} devora a comida com um rugido de satisfação.",
        "Uma refeição deliciosa! {dragonName} lambe os beiços e pede por mais.",
        "{dragonName} parece cheio de energia após uma boa refeição."
    ],
    "Brincar": [
        "Você atira um pau e {dragonName} corre para o apanhar, abanando a cauda.",
        "{dragonName} dá-lhe uma cabeçada gentil, pedindo festas na barriga.",
        "Uma sessão de cócegas deixa {dragonName} a rolar de alegria."
    ],
    "Descansar": [
        "Um descanso merecido! {dragonName} aninha-se e adormece profundamente.",
        "{dragonName} espreguiça-se longamente e parece muito mais revigorado.",
        "Vocês encontram um local tranquilo para descansar. A energia de {dragonName} é restaurada."
    ]
};
